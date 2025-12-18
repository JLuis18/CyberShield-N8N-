import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const payload = verifyToken(token)

        if (!payload) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }

        const body = await request.json()
        const { input } = body

        if (!input) {
            return NextResponse.json({ error: 'Contenido de email requerido' }, { status: 400 })
        }

        // Enhanced email analysis with comprehensive phishing detection
        const suspiciousKeywords = [
            // Urgency/pressure
            'urgent', 'urgente', 'immediately', 'inmediato', 'act now', 'actúa ahora',
            'limited time', 'tiempo limitado', 'expires today', 'expira hoy',
            'last chance', 'última oportunidad', 'final notice', 'aviso final',

            // Account security
            'verify your account', 'verificar cuenta', 'suspended', 'suspendido',
            'locked', 'bloqueado', 'unusual activity', 'actividad inusual',
            'confirm identity', 'confirmar identidad', 'security alert', 'alerta de seguridad',

            // Financial lures
            'winner', 'ganador', 'congratulations', 'felicidades', 'prize', 'premio',
            'refund', 'reembolso', 'tax return', 'devolución de impuestos',
            'inheritance', 'herencia', 'lottery', 'lotería',

            // Action triggers
            'click here', 'haz clic aquí', 'update payment', 'actualizar pago',
            'reset password', 'restablecer contraseña', 'download', 'descargar',
        ]

        const emailContent = input.toLowerCase()
        const threats: string[] = []
        let riskScore = 0

        // Check for suspicious keywords (each adds 8 points)
        suspiciousKeywords.forEach(keyword => {
            if (emailContent.includes(keyword)) {
                threats.push(`Palabra clave sospechosa: "${keyword}"`)
                riskScore += 8
            }
        })

        // Check for excessive links (phishing emails often have many links)
        const linkCount = (emailContent.match(/http/gi) || []).length
        if (linkCount > 5) {
            threats.push(`Número elevado de enlaces (${linkCount})`)
            riskScore += 20
        } else if (linkCount > 2) {
            threats.push(`Múltiples enlaces detectados (${linkCount})`)
            riskScore += 10
        }

        // Check for brand spoofing
        const brandsPatterns = [
            { brand: 'paypal', domains: ['@paypal.com', '@e.paypal.com'] },
            { brand: 'amazon', domains: ['@amazon.com', '@amazon.es'] },
            { brand: 'bank', domains: ['@bank.com', '@banking.com'] },
            { brand: 'microsoft', domains: ['@microsoft.com', '@outlook.com'] },
            { brand: 'apple', domains: ['@apple.com', '@icloud.com'] },
        ]

        brandsPatterns.forEach(({ brand, domains }) => {
            if (emailContent.includes(brand)) {
                const hasDomain = domains.some(domain => emailContent.includes(domain))
                if (!hasDomain) {
                    threats.push(`Posible suplantación de identidad: menciona "${brand}" sin dominio oficial`)
                    riskScore += 30
                }
            }
        })

        // Check for personal information requests
        const sensitiveRequests = [
            'password', 'contraseña', 'ssn', 'social security',
            'credit card', 'tarjeta de crédito', 'cvv', 'pin',
            'bank account', 'cuenta bancaria', 'routing number'
        ]
        sensitiveRequests.forEach(term => {
            if (emailContent.includes(term)) {
                threats.push(`Solicita información sensible: "${term}"`)
                riskScore += 25
            }
        })

        // Check for mismatched or suspicious sender emails
        const suspiciousEmailPatterns = [
            '@gmail.com', '@yahoo.com', '@hotmail.com', // Personal emails pretending to be business
            'noreply', 'no-reply', 'support', 'admin', 'security'
        ]
        suspiciousEmailPatterns.forEach(pattern => {
            if (emailContent.includes(pattern) && emailContent.includes('official')) {
                threats.push(`Correo sospechoso: usa "${pattern}" pero claims oficial`)
                riskScore += 15
            }
        })

        // Check for poor grammar/spelling (common in phishing)
        const poorGrammarIndicators = ['dear customer', 'estimado cliente', 'dear user', 'estimado usuario']
        if (poorGrammarIndicators.some(phrase => emailContent.includes(phrase))) {
            threats.push('Saludo genérico (no personalizado) - posible phishing')
            riskScore += 10
        }

        // Check for urgency + action combination (very common in phishing)
        const hasUrgency = suspiciousKeywords.slice(0, 8).some(word => emailContent.includes(word))
        const hasAction = suspiciousKeywords.slice(38).some(word => emailContent.includes(word))
        if (hasUrgency && hasAction) {
            threats.push('Combinación de urgencia y acción inmediata - táctica de phishing')
            riskScore += 20
        }

        // Determine risk level based on score (LOWERED THRESHOLDS)
        let riskLevel = 'low'
        if (riskScore >= 25) {  // Changed from 60 to 25
            riskLevel = 'high'
        } else if (riskScore >= 15) {  // Changed from 30 to 15
            riskLevel = 'medium'
        }

        // Store email analysis
        await prisma.email.create({
            data: {
                userId: payload.userId,
                sender: 'unknown@example.com',
                subject: 'Análisis de contenido',
                content: input.substring(0, 500),
                analyzed: true,
                riskLevel,
            },
        })

        // Create threat if high risk
        if (riskLevel === 'high' || riskLevel === 'medium') {
            await prisma.threat.create({
                data: {
                    userId: payload.userId,
                    type: 'email_phishing',
                    origin: 'email_content',
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'blocked' : 'monitoring',
                },
            })
        }

        const recommendations = []
        if (riskLevel === 'high') {
            recommendations.push('NO responder al correo')
            recommendations.push('NO hacer clic en enlaces')
            recommendations.push('Marcar como spam/phishing')
            recommendations.push('Eliminar el correo inmediatamente')
        } else if (riskLevel === 'medium') {
            recommendations.push('Verificar remitente cuidadosamente')
            recommendations.push('No proporcionar información personal')
            recommendations.push('Contactar directamente a la empresa si es necesario')
        } else {
            recommendations.push('Email parece legítimo')
            recommendations.push('Mantener precaución general')
        }

        return NextResponse.json({
            riskLevel,
            threats,
            recommendations,
            analyzed: true,
        })
    } catch (error) {
        console.error('Email scan error:', error)
        return NextResponse.json(
            { error: 'Error al analizar email' },
            { status: 500 }
        )
    }
}
