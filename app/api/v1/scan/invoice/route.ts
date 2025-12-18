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
        const { filename, content } = body

        if (!filename) {
            return NextResponse.json(
                { error: 'Filename is required' },
                { status: 400 }
            )
        }

        // Invoice analysis logic (comprehensive fraud detection)
        const filenameLower = filename.toLowerCase()
        const contentLower = content ? content.toLowerCase() : ''
        const threats: string[] = []
        let riskScore = 0

        // Dangerous extensions
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.zip', '.rar']
        dangerousExtensions.forEach(ext => {
            if (filenameLower.includes(ext)) {
                threats.push(`Dangerous file extension: ${ext}`)
                riskScore += 50
            }
        })

        // Double extension
        const extensionCount = (filename.match(/\./g) || []).length
        if (extensionCount > 1) {
            threats.push('Double extension detected (malware technique)')
            riskScore += 45
        }

        // Banking account change detection
        const accountChangeKeywords = [
            'cambio de cuenta', 'nueva cuenta', 'cuenta actualizada', 'new account', 'account change'
        ]
        accountChangeKeywords.forEach(keyword => {
            if (contentLower.includes(keyword)) {
                threats.push(`Bank account change detected: "${keyword}"`)
                riskScore += 35
            }
        })

        // Urgency tactics
        const urgencyKeywords = ['urgente', 'inmediato', '24h', 'urgent', 'immediate']
        urgencyKeywords.forEach(keyword => {
            if (contentLower.includes(keyword)) {
                threats.push(`Urgency pressure: "${keyword}"`)
                riskScore += 25
            }
        })

        // SUNAT/Government impersonation
        const govKeywords = ['sunat', 'regularización tributaria', 'multa']
        govKeywords.forEach(keyword => {
            if (contentLower.includes(keyword)) {
                threats.push(`Government impersonation: "${keyword}"`)
                riskScore += 40
            }
        })

        // Suspicious email domains
        const suspiciousDomains = ['@support.com', '@gmail.com', '@yahoo.com', '@hotmail.com']
        suspiciousDomains.forEach(domain => {
            if (contentLower.includes(domain)) {
                threats.push(`Suspicious email domain: ${domain}`)
                riskScore += 20
            }
        })

        // Determine risk level
        let riskLevel = 'low'
        if (riskScore >= 40) {
            riskLevel = 'high'
        } else if (riskScore >= 20) {
            riskLevel = 'medium'
        }

        // Store in database
        if (threats.length > 0) {
            await prisma.threat.create({
                data: {
                    userId: authResult.userId!,
                    type: 'invoice_fraud',
                    origin: filename,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'quarantine' : 'monitoring',
                },
            })
        }

        // Return response with rate limit headers
        return NextResponse.json(
            {
                filename,
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
        console.error('API invoice scan error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
