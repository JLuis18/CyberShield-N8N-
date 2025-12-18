import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * n8n Webhook Endpoint
 * Receives emails from n8n Gmail trigger and analyzes them for phishing
 * 
 * Expected format from n8n Gmail Trigger:
 * - from: sender email
 * - to: recipient email  
 * - subject: email subject
 * - body: email body (text or html)
 * - date: email date
 */

// Make this route dynamic
export const dynamic = 'force-dynamic'

interface N8NEmailPayload {
    from?: string
    to?: string
    subject?: string
    body?: string
    text?: string
    html?: string
    date?: string
    snippet?: string
    attachments?: Array<{ filename?: string; mimeType?: string; size?: number }>
}

export async function POST(request: NextRequest) {
    try {
        // Optional API key verification from header
        const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

        // Parse request body
        const body: N8NEmailPayload = await request.json()

        // Extract email content - n8n may send different formats
        const emailContent = body.body || body.text || body.html || body.snippet || ''
        const sender = body.from || 'unknown'
        const subject = body.subject || '(Sin asunto)'

        if (!emailContent && !subject) {
            return NextResponse.json(
                { error: 'Email content or subject required', success: false },
                { status: 400 }
            )
        }

        // Combine subject and body for analysis
        const fullContent = `${subject} ${emailContent}`.toLowerCase()

        // ========== PHISHING DETECTION LOGIC ==========
        const threats: string[] = []
        let riskScore = 0

        // 1. Urgency keywords (high risk)
        const urgencyKeywords = [
            'urgent', 'urgente', 'immediately', 'inmediato', 'act now', 'actúa ahora',
            'limited time', 'tiempo limitado', 'expires today', 'expira hoy',
            'last chance', 'última oportunidad', 'final notice', 'aviso final',
            '24 hours', '24 horas', 'account suspended', 'cuenta suspendida',
            'account locked', 'cuenta bloqueada', 'verify now', 'verificar ahora'
        ]

        urgencyKeywords.forEach(keyword => {
            if (fullContent.includes(keyword)) {
                threats.push(`🚨 Urgencia sospechosa: "${keyword}"`)
                riskScore += 15
            }
        })

        // 2. Sensitive info requests
        const sensitiveRequests = [
            'password', 'contraseña', 'credit card', 'tarjeta de crédito',
            'bank account', 'cuenta bancaria', 'ssn', 'social security',
            'cvv', 'pin', 'routing number', 'clave digital', 'token'
        ]

        sensitiveRequests.forEach(term => {
            if (fullContent.includes(term)) {
                threats.push(`⚠️ Solicita información sensible: "${term}"`)
                riskScore += 25
            }
        })

        // 3. Suspicious URLs
        const urlPatterns = [
            /http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP addresses
            /http:\/\/.*\.(tk|ml|ga|cf|gq)\//,              // Free suspicious TLDs
            /\.(exe|bat|scr|vbs|ps1)[\s'"]/,                // Executable extensions
            /(verify|secure|login|update).*\.(com|net)/     // Phishing patterns
        ]

        urlPatterns.forEach((pattern, idx) => {
            if (pattern.test(fullContent)) {
                const messages = [
                    '🚨 URL con IP directa detectada',
                    '🚨 Dominio sospechoso (.tk, .ml, etc.)',
                    '⚠️ Archivo ejecutable mencionado',
                    '⚠️ Patrón de URL de phishing'
                ]
                threats.push(messages[idx])
                riskScore += 20
            }
        })

        // 4. Check link count
        const linkCount = (fullContent.match(/https?:\/\//gi) || []).length
        if (linkCount > 5) {
            threats.push(`⚠️ Demasiados enlaces (${linkCount})`)
            riskScore += 15
        }

        // 5. Brand spoofing detection
        const brands = ['paypal', 'amazon', 'netflix', 'microsoft', 'apple', 'google', 'banco', 'bank']
        const suspiciousSender = sender.toLowerCase()

        brands.forEach(brand => {
            if (fullContent.includes(brand) && !suspiciousSender.includes(brand)) {
                threats.push(`⚠️ Menciona "${brand}" pero remitente no es oficial`)
                riskScore += 20
            }
        })

        // 6. Generic greeting
        const genericGreetings = ['dear customer', 'estimado cliente', 'dear user', 'estimado usuario', 'querido usuario']
        if (genericGreetings.some(g => fullContent.includes(g))) {
            threats.push('⚠️ Saludo genérico (no personalizado)')
            riskScore += 10
        }

        // 7. Check attachments if provided
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.ps1', '.js', '.jar']
        if (body.attachments && body.attachments.length > 0) {
            body.attachments.forEach(att => {
                const filename = (att.filename || '').toLowerCase()
                if (dangerousExtensions.some(ext => filename.endsWith(ext))) {
                    threats.push(`🚨 Archivo peligroso adjunto: ${att.filename}`)
                    riskScore += 30
                }
            })
        }

        // ========== DETERMINE RISK LEVEL ==========
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (riskScore >= 40) {
            riskLevel = 'high'
        } else if (riskScore >= 20) {
            riskLevel = 'medium'
        }

        // ========== GENERATE RECOMMENDATIONS ==========
        const recommendations: string[] = []
        if (riskLevel === 'high') {
            recommendations.push('🚫 NO responder al correo')
            recommendations.push('🚫 NO hacer clic en enlaces')
            recommendations.push('🗑️ Marcar como spam/phishing')
            recommendations.push('🗑️ Eliminar el correo')
        } else if (riskLevel === 'medium') {
            recommendations.push('⚠️ Verificar remitente cuidadosamente')
            recommendations.push('⚠️ No proporcionar información personal')
            recommendations.push('📞 Contactar directamente a la empresa si es necesario')
        } else {
            recommendations.push('✅ Email parece legítimo')
            recommendations.push('👁️ Mantener precaución habitual')
        }

        // ========== STORE IN DATABASE (if available) ==========
        let emailId: string | null = null
        try {
            // Use the first registered user (usually the main user) for n8n scans
            // This ensures emails appear in the user's history
            let user = await prisma.user.findFirst({
                orderBy: { createdAt: 'asc' }
            })

            if (!user) {
                // Fallback: create integration user if no users exist
                user = await prisma.user.create({
                    data: {
                        email: 'n8n-integration@cybershield.local',
                        password: 'n8n-integration-user',
                        name: 'n8n Integration'
                    }
                })
            }

            // Store email analysis
            const email = await prisma.email.create({
                data: {
                    userId: user.id,
                    sender: sender,
                    subject: subject,
                    content: emailContent.substring(0, 1000),
                    analyzed: true,
                    riskLevel,
                }
            })
            emailId = email.id

            // Create threat record if risky
            if (riskLevel !== 'low') {
                await prisma.threat.create({
                    data: {
                        userId: user.id,
                        type: 'email_phishing',
                        origin: `n8n: ${sender}`,
                        description: threats.slice(0, 5).join(', '),
                        severity: riskLevel,
                        status: riskLevel === 'high' ? 'deleted' : 'monitoring',
                    }
                })
            }
        } catch (dbError) {
            console.log('Database storage skipped:', dbError)
        }

        // ========== RETURN RESPONSE ==========
        return NextResponse.json({
            success: true,
            emailId,
            riskLevel,
            riskScore,
            threats: threats.length > 0 ? threats : ['✅ No se detectaron amenazas'],
            recommendations,
            analyzed: {
                sender,
                subject,
                linksFound: linkCount,
                attachments: body.attachments?.length || 0
            },
            message: riskLevel === 'high'
                ? '🚨 ALERTA: Email de alto riesgo - Probable phishing'
                : riskLevel === 'medium'
                    ? '⚠️ PRECAUCIÓN: Email con señales sospechosas'
                    : '✅ Email parece seguro',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('n8n webhook error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Error al analizar email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// GET endpoint for health check / verification from n8n
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'CyberShield n8n Webhook',
        timestamp: new Date().toISOString(),
        usage: {
            method: 'POST',
            contentType: 'application/json',
            requiredFields: ['subject OR body'],
            optionalFields: ['from', 'to', 'date', 'attachments']
        }
    })
}
