import { NextRequest, NextResponse } from 'next/server'

/**
 * Email Forwarding Endpoint
 * Receives forwarded emails and analyzes them for threats
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            from,
            to,
            subject,
            html,
            text,
            headers,
            attachments = []
        } = body

        // Extract URLs
        const urls = extractURLs(html || text || '')

        // Extract sender email
        const senderEmail = extractEmail(from)
        const senderDomain = senderEmail.split('@')[1] || ''

        // Analyze for threats
        const threats: string[] = []
        let riskScore = 0

        // 1. Check sender domain
        const isSuspiciousDomain = analyzeSenderDomain(senderDomain)
        if (isSuspiciousDomain) {
            threats.push('🚨 Remitente de dominio sospechoso')
            riskScore += 40
        }

        // 2. Check for phishing keywords
        const phishingIndicators = checkPhishingKeywords(subject || '', text || html || '')
        if (phishingIndicators.length > 0) {
            threats.push(...phishingIndicators)
            riskScore += phishingIndicators.length * 15
        }

        // 3. Analyze URLs
        const urlAnalysis = analyzeEmailURLs(urls)
        if (urlAnalysis.dangerousURLs > 0) {
            threats.push(`🚨 ${urlAnalysis.dangerousURLs} URL(s) peligrosa(s) detectada(s)`)
            riskScore += urlAnalysis.dangerousURLs * 30
        }

        // 4. Check attachments
        const dangerousAttachments = checkAttachments(attachments)
        if (dangerousAttachments.length > 0) {
            threats.push(`⚠️ Archivos adjuntos sospechosos: ${dangerousAttachments.join(', ')}`)
            riskScore += dangerousAttachments.length * 25
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (riskScore >= 60) {
            riskLevel = 'high'
        } else if (riskScore >= 30) {
            riskLevel = 'medium'
        }

        return NextResponse.json({
            success: true,
            riskLevel,
            threats: threats.length > 0 ? threats : ['✓ No se detectaron amenazas'],
            urlsAnalyzed: urls.length,
            attachmentsChecked: attachments.length,
            riskScore,
            details: {
                sender: senderEmail,
                subject: subject || '(Sin asunto)',
                urlAnalysis: urlAnalysis.details
            },
            message: riskLevel === 'high'
                ? '⚠️ Email de alto riesgo detectado'
                : riskLevel === 'medium'
                    ? '⚠️ Email con señales sospechosas'
                    : '✅ Email parece seguro'
        })

    } catch (error) {
        console.error('Email analysis error:', error)
        return NextResponse.json(
            {
                error: 'Error al analizar el email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

/** Extract URLs from text */
function extractURLs(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi
    return text.match(urlRegex) || []
}

/** Extract email from string */
function extractEmail(from: string): string {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
    const match = from.match(emailRegex)
    return match ? match[1] : from
}

/** Analyze sender domain */
function analyzeSenderDomain(domain: string): boolean {
    const suspiciousPatterns = [
        /\d{5,}/,
        /-free-/,
        /-secure-/,
        /-verify-/,
        /temp/i,
        /disposable/i,
        /\.tk$/,
        /\.ml$/,
        /\.ga$/,
    ]

    return suspiciousPatterns.some(pattern => pattern.test(domain))
}

/** Check phishing keywords */
function checkPhishingKeywords(subject: string, body: string): string[] {
    const text = `${subject} ${body}`.toLowerCase()
    const threats: string[] = []

    const keywords = [
        'urgente', 'urgent', 'inmediato', 'immediate',
        'suspendida', 'suspended', 'bloqueada', 'blocked',
        'verificar', 'verify', 'confirmar', 'confirm',
        'actualizar', 'update', 'acción requerida', 'action required'
    ]

    let found = 0
    keywords.forEach(keyword => {
        if (text.includes(keyword) && found < 3) {
            threats.push(`⚠️ Lenguaje de urgencia: "${keyword}"`)
            found++
        }
    })

    return threats
}

/** Analyze URLs */
function analyzeEmailURLs(urls: string[]): { dangerousURLs: number, details: any[] } {
    let dangerousCount = 0
    const details: any[] = []

    for (const url of urls) {
        try {
            const parsedUrl = new URL(url)
            const domain = parsedUrl.hostname

            const isDangerous =
                domain.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) ||
                domain.match(/[0-9]{5,}/) ||
                parsedUrl.protocol === 'http:'

            if (isDangerous) {
                dangerousCount++
                details.push({ url, reason: 'Patrón sospechoso' })
            }
        } catch {
            // Invalid URL, skip
        }
    }

    return { dangerousURLs: dangerousCount, details }
}

/** Check attachments */
function checkAttachments(attachments: any[]): string[] {
    const dangerousExt = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.ps1', '.zip', '.rar', '.js', '.jar']
    const dangerous: string[] = []

    attachments.forEach(att => {
        const filename = (att.filename || att.name || '').toLowerCase()
        if (dangerousExt.some(ext => filename.endsWith(ext))) {
            dangerous.push(att.filename || att.name)
        }
    })

    return dangerous
}
