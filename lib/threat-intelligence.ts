/**
 * Threat Intelligence Service
 * Integrates with AbuseIPDB API for real-time threat detection
 */

interface AbuseIPDBResponse {
    data: {
        ipAddress: string
        isPublic: boolean
        ipVersion: number
        isWhitelisted: boolean
        abuseConfidenceScore: number
        countryCode: string
        usageType: string
        isp: string
        domain: string
        hostnames: string[]
        totalReports: number
        numDistinctUsers: number
        lastReportedAt: string | null
    }
}

interface ThreatIntelligenceResult {
    provider: 'abuseipdb' | 'local'
    abuseConfidenceScore: number
    totalReports: number
    lastReportedAt: string | null
    isWhitelisted: boolean
    countryCode?: string
    isp?: string
    riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
    cached: boolean
}

// Simple in-memory cache
// In production, consider using Redis for distributed caching
const ipCache = new Map<string, { data: ThreatIntelligenceResult; expiresAt: number }>()

// Rate limiting tracker
let requestCount = 0
let resetTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if API key is configured
 */
function isApiKeyConfigured(): boolean {
    return !!process.env.ABUSEIPDB_API_KEY && process.env.ABUSEIPDB_API_KEY !== 'your_api_key_here'
}

/**
 * Check if threat intelligence is enabled
 */
function isThreatIntelligenceEnabled(): boolean {
    return process.env.ENABLE_THREAT_INTELLIGENCE !== 'false' && isApiKeyConfigured()
}

/**
 * Clean expired cache entries
 */
function cleanCache() {
    const now = Date.now()
    const entries = Array.from(ipCache.entries())
    for (const [key, value] of entries) {
        if (value.expiresAt < now) {
            ipCache.delete(key)
        }
    }
}

/**
 * Get cached result if available and not expired
 */
function getCachedResult(ip: string): ThreatIntelligenceResult | null {
    const cached = ipCache.get(ip)
    if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.data, cached: true }
    }
    return null
}

/**
 * Cache a result for 24 hours
 */
function cacheResult(ip: string, result: ThreatIntelligenceResult) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    ipCache.set(ip, { data: result, expiresAt })

    // Clean cache periodically (every 100 requests)
    if (ipCache.size % 100 === 0) {
        cleanCache()
    }
}

/**
 * Check if rate limit allows another request
 */
function canMakeRequest(): boolean {
    const now = Date.now()

    // Reset counter if 24 hours have passed
    if (now > resetTime) {
        requestCount = 0
        resetTime = now + 24 * 60 * 60 * 1000
    }

    // Free tier: 1,000 requests/day (conservative limit: 900)
    return requestCount < 900
}

/**
 * Query AbuseIPDB API for IP reputation
 */
async function queryAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult> {
    const apiKey = process.env.ABUSEIPDB_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
        throw new Error('AbuseIPDB API key not configured')
    }

    // Check rate limit
    if (!canMakeRequest()) {
        throw new Error('Rate limit exceeded. Try again later.')
    }

    try {
        const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Key': apiKey,
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded')
            }
            throw new Error(`AbuseIPDB API error: ${response.status}`)
        }

        requestCount++

        const data: AbuseIPDBResponse = await response.json()
        const ipData = data.data

        // Determine risk level based on abuse confidence score
        let riskLevel: ThreatIntelligenceResult['riskLevel'] = 'safe'
        if (ipData.abuseConfidenceScore >= 75) {
            riskLevel = 'critical'
        } else if (ipData.abuseConfidenceScore >= 50) {
            riskLevel = 'high'
        } else if (ipData.abuseConfidenceScore >= 25) {
            riskLevel = 'medium'
        } else if (ipData.abuseConfidenceScore > 0) {
            riskLevel = 'low'
        }

        // Whitelisted IPs are always safe
        if (ipData.isWhitelisted) {
            riskLevel = 'safe'
        }

        const result: ThreatIntelligenceResult = {
            provider: 'abuseipdb',
            abuseConfidenceScore: ipData.abuseConfidenceScore,
            totalReports: ipData.totalReports,
            lastReportedAt: ipData.lastReportedAt,
            isWhitelisted: ipData.isWhitelisted,
            countryCode: ipData.countryCode,
            isp: ipData.isp,
            riskLevel,
            cached: false,
        }

        return result
    } catch (error) {
        console.error('AbuseIPDB query error:', error)
        throw error
    }
}

/**
 * Get threat intelligence for an IP address
 * Uses cache and falls back gracefully if API is unavailable
 */
export async function getThreatIntelligence(ip: string): Promise<ThreatIntelligenceResult | null> {
    // Skip if threat intelligence is disabled
    if (!isThreatIntelligenceEnabled()) {
        return null
    }

    // Check cache first
    const cached = getCachedResult(ip)
    if (cached) {
        return cached
    }

    try {
        const result = await queryAbuseIPDB(ip)

        // Cache the result
        cacheResult(ip, result)

        return result
    } catch (error) {
        console.error('Failed to get threat intelligence:', error)

        // Return null to fall back to rule-based analysis
        return null
    }
}

/**
 * Combine threat intelligence with rule-based analysis
 */
export function combineThreatScores(
    ruleBasedScore: number,
    threatIntel: ThreatIntelligenceResult | null
): {
    finalScore: number
    riskLevel: 'low' | 'medium' | 'high'
    confidence: number
} {
    // If no threat intel, use rule-based score only
    if (!threatIntel) {
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (ruleBasedScore >= 70) riskLevel = 'high'
        else if (ruleBasedScore >= 40) riskLevel = 'medium'

        return {
            finalScore: ruleBasedScore,
            riskLevel,
            confidence: 70, // Lower confidence without threat intel
        }
    }

    // Whitelisted IPs override everything
    if (threatIntel.isWhitelisted) {
        return {
            finalScore: 0,
            riskLevel: 'low',
            confidence: 100,
        }
    }

    // Combine scores with weighted average
    // AbuseIPDB gets 60% weight, rules get 40% weight
    const abuseScore = threatIntel.abuseConfidenceScore
    const finalScore = Math.round(abuseScore * 0.6 + ruleBasedScore * 0.4)

    // Determine final risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (finalScore >= 60) {
        riskLevel = 'high'
    } else if (finalScore >= 30) {
        riskLevel = 'medium'
    }

    // Higher confidence when both sources agree
    let confidence = 85
    if (
        (abuseScore >= 60 && ruleBasedScore >= 60) ||
        (abuseScore < 30 && ruleBasedScore < 30)
    ) {
        confidence = 95
    }

    return {
        finalScore,
        riskLevel,
        confidence,
    }
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): {
    requestsUsed: number
    requestsRemaining: number
    resetTime: Date
} {
    const now = Date.now()

    // Reset if needed
    if (now > resetTime) {
        requestCount = 0
        resetTime = now + 24 * 60 * 60 * 1000
    }

    return {
        requestsUsed: requestCount,
        requestsRemaining: Math.max(0, 900 - requestCount),
        resetTime: new Date(resetTime),
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
    size: number
    enabled: boolean
} {
    cleanCache()
    return {
        size: ipCache.size,
        enabled: isThreatIntelligenceEnabled(),
    }
}
