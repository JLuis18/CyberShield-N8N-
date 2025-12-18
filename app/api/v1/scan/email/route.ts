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
        const { content } = body

        if (!content) {
            return NextResponse.json(
                { error: 'Email content is required' },
                { status: 400 }
            )
        }

        // Email analysis logic (enhanced)
        const suspiciousKeywords = [
            'urgent', 'urgente', 'immediately', 'inmediato', 'verify your account', 'verificar cuenta',
            'suspended', 'suspendido', 'locked', 'bloqueado', 'winner', 'ganador', 'prize', 'premio',
            'click here', 'haz clic', 'reset password', 'restablecer contraseña'
        ]

        const emailContent = content.toLowerCase()
        const threats: string[] = []
        let riskScore = 0

        // Check for suspicious keywords
        suspiciousKeywords.forEach(keyword => {
            if (emailContent.includes(keyword)) {
                threats.push(`Suspicious keyword: "${keyword}"`)
                riskScore += 8
            }
        })

        // Check for excessive links
        const linkCount = (emailContent.match(/http/gi) || []).length
        if (linkCount > 5) {
            threats.push(`High number of links: ${linkCount}`)
            riskScore += 15
        }

        // Check for suspicious email patterns
        if (emailContent.includes('@gmail.com') || emailContent.includes('@yahoo.com')) {
            threats.push('Free email provider (potential spoofing)')
            riskScore += 10
        }

        // Determine risk level
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
                    type: 'email_phishing',
                    origin: content.substring(0, 255), // Truncate
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'blocked' : 'monitoring',
                },
            })
        }

        // Also store in Email table
        await prisma.email.create({
            data: {
                userId: authResult.userId!,
                sender: 'API Scan',
                subject: 'API Email Scan',
                content: content.substring(0, 1000),
                analyzed: true,
                riskLevel: riskLevel,
            }
        })

        // Return response with rate limit headers
        return NextResponse.json(
            {
                riskLevel,
                riskScore,
                threats,
                linkCount,
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
        console.error('API email scan error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
