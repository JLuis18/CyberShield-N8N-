import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, checkRateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/db'

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
        const { url } = body

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            )
        }

        // URL analysis logic (reuse from existing scanner)
        const suspiciousPatterns = [
            'bit.ly', 'tinyurl', 'login', 'verify', 'account', 'secure',
            'banking', 'paypal', 'password', 'suspended', 'urgent'
        ]

        const urlLower = url.toLowerCase()
        const threats: string[] = []
        let riskScore = 0

        suspiciousPatterns.forEach(pattern => {
            if (urlLower.includes(pattern)) {
                threats.push(`Suspicious pattern: "${pattern}"`)
                riskScore += 6
            }
        })

        if (!urlLower.startsWith('https://')) {
            threats.push('Not using HTTPS')
            riskScore += 20
        }

        if (urlLower.includes('@')) {
            threats.push('Contains @ symbol - phishing risk')
            riskScore += 40
        }

        if (urlLower.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
            threats.push('Uses IP address instead of domain')
            riskScore += 35
        }

        let riskLevel = 'low'
        if (riskScore >= 25) {
            riskLevel = 'high'
        } else if (riskScore >= 15) {
            riskLevel = 'medium'
        }

        // Store in database
        if (threats.length > 0) {
            await prisma.threat.create({
                data: {
                    userId: authResult.userId!,
                    type: 'url_phishing',
                    origin: url,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'blocked' : 'monitoring',
                },
            })
        }

        // Return response with rate limit headers
        return NextResponse.json(
            {
                url,
                riskLevel,
                riskScore,
                threats,
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
        console.error('API scan error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
