import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, checkRateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { analyzeConnection, checkKnownConnection } from '@/lib/network-threats'
import { getThreatIntelligence, combineThreatScores } from '@/lib/threat-intelligence'

export async function POST(request: NextRequest) {
    try {
        // Verify API key
        const authResult = await verifyApiKey(request)

        if (!authResult.valid) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            )
        }

        // Get API key details for rate limiting
        const apiKey = await prisma.apiKey.findUnique({
            where: { id: authResult.apiKeyId }
        })

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not found' },
                { status: 401 }
            )
        }

        // Check rate limit
        const rateLimit = checkRateLimit(apiKey.id, apiKey.rateLimit)

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    limit: apiKey.rateLimit,
                    resetTime: new Date(rateLimit.resetTime).toISOString()
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': apiKey.rateLimit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimit.resetTime.toString()
                    }
                }
            )
        }

        // Parse request body
        const body = await request.json()
        const { ipAddress, port, protocol = 'TCP' } = body

        if (!ipAddress || !port) {
            return NextResponse.json(
                { error: 'IP address and port are required' },
                { status: 400 }
            )
        }

        // Validate IP address format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
        if (!ipRegex.test(ipAddress)) {
            return NextResponse.json({ error: 'Invalid IP address format' }, { status: 400 })
        }

        // Validate octets
        const octets = ipAddress.split('.').map(Number)
        if (octets.some((octet: number) => octet > 255)) {
            return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 })
        }

        // Use the comprehensive threat analysis
        const analysis = analyzeConnection(ipAddress, port)
        const knownConnection = checkKnownConnection(ipAddress, port)

        let threats = [...analysis.threats]
        let riskScore = 0

        // Map risk level to numeric score
        switch (analysis.riskLevel) {
            case 'critical':
                riskScore = 100
                break
            case 'high':
                riskScore = 70
                break
            case 'warning':
                riskScore = 40
                break
            case 'safe':
                riskScore = 0
                break
        }

        // Additional checks for IP characteristics
        const isPrivate = (
            ipAddress.startsWith('192.168.') ||
            ipAddress.startsWith('10.') ||
            ipAddress.startsWith('172.16.') ||
            ipAddress.startsWith('172.17.') ||
            ipAddress.startsWith('172.18.') ||
            ipAddress.startsWith('172.19.') ||
            ipAddress.startsWith('172.20.') ||
            ipAddress.startsWith('172.21.') ||
            ipAddress.startsWith('172.22.') ||
            ipAddress.startsWith('172.23.') ||
            ipAddress.startsWith('172.24.') ||
            ipAddress.startsWith('172.25.') ||
            ipAddress.startsWith('172.26.') ||
            ipAddress.startsWith('172.27.') ||
            ipAddress.startsWith('172.28.') ||
            ipAddress.startsWith('172.29.') ||
            ipAddress.startsWith('172.30.') ||
            ipAddress.startsWith('172.31.')
        )

        if (isPrivate && !knownConnection) {
            threats.push('🔒 Private IP address detected')
            if (analysis.riskLevel !== 'safe') {
                riskScore += 15
            }
        }

        // Check for localhost
        if (ipAddress.startsWith('127.')) {
            threats.push('Localhost/loopback address')
        }

        // Determine status based on risk level
        let status = 'active'
        let riskLevel: 'low' | 'medium' | 'high' = 'low'

        if (analysis.riskLevel === 'critical') {
            status = 'blocked'
            riskLevel = 'high'
        } else if (analysis.riskLevel === 'high') {
            status = 'blocked'
            riskLevel = 'high'
        } else if (analysis.riskLevel === 'warning') {
            status = 'monitoring'
            riskLevel = 'medium'
        } else {
            status = 'active'
            riskLevel = 'low'
        }

        // Get threat intelligence from AbuseIPDB
        const threatIntel = await getThreatIntelligence(ipAddress)

        // Combine threat intelligence with rule-based analysis
        if (threatIntel) {
            const combined = combineThreatScores(riskScore, threatIntel)
            riskLevel = combined.riskLevel
            riskScore = combined.finalScore

            // Update status based on combined score
            if (riskLevel === 'high') {
                status = 'blocked'
            } else if (riskLevel === 'medium') {
                status = 'monitoring'
            } else {
                status = 'active'
            }

            // Add threat intelligence insights to threats array
            if (threatIntel.totalReports > 0) {
                threats.push(`🌐 ${threatIntel.totalReports} abuse reports globally`)
            }
            if (threatIntel.abuseConfidenceScore > 0) {
                threats.push(`📊 Threat confidence: ${threatIntel.abuseConfidenceScore}%`)
            }
            if (threatIntel.isWhitelisted) {
                threats.push(`✅ Verified legitimate IP`)
            }
        }

        // Store in database
        await prisma.connection.create({
            data: {
                userId: authResult.userId!,
                ipAddress,
                port,
                protocol,
                status,
            }
        })

        if (riskLevel === 'high') {
            await prisma.threat.create({
                data: {
                    userId: authResult.userId!,
                    type: 'network_suspicious',
                    origin: `${ipAddress}:${port}`,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: 'blocked',
                },
            })
        }

        // Return response with rate limit headers
        return NextResponse.json(
            {
                ipAddress,
                port,
                protocol,
                riskLevel,
                riskScore,
                status,
                threats,
                category: analysis.category,
                emoji: analysis.emoji,
                recommendations: analysis.recommendations,
                threatIntelligence: threatIntel ? {
                    provider: threatIntel.provider,
                    abuseConfidenceScore: threatIntel.abuseConfidenceScore,
                    totalReports: threatIntel.totalReports,
                    lastReportedAt: threatIntel.lastReportedAt,
                    isWhitelisted: threatIntel.isWhitelisted,
                    countryCode: threatIntel.countryCode,
                    isp: threatIntel.isp,
                    cached: threatIntel.cached,
                } : null,
                analyzed: true,
                timestamp: new Date().toISOString()
            },
            {
                headers: {
                    'X-RateLimit-Limit': apiKey.rateLimit.toString(),
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    'X-RateLimit-Reset': rateLimit.resetTime.toString()
                }
            }
        )
    } catch (error) {
        console.error('API network scan error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
