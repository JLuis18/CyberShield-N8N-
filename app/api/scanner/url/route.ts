import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// CORS headers for browser extension
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        let userId = null

        // Authentication is now optional - extension can work anonymously
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7)
                const payload = verifyToken(token)
                if (payload) {
                    userId = payload.userId
                }
            } catch {
                // Continue without auth
            }
        }

        const body = await request.json()
        const { url: input, fullAnalysis = false } = body

        if (!input) {
            return NextResponse.json({ error: 'URL requerida', analyzed: false }, { status: 400, headers: corsHeaders })
        }

        // Parse URL
        let parsedUrl
        try {
            parsedUrl = new URL(input.toLowerCase())
        } catch {
            return NextResponse.json({
                error: 'URL inválida',
                analyzed: false,
                riskLevel: 'unknown'
            }, { status: 400, headers: corsHeaders })
        }

        const url = input.toLowerCase()
        const domain = parsedUrl.hostname
        const threats: string[] = []
        let riskScore = 0

        // ============================================
        // 1. WHITELIST - Known Safe Domains
        // ============================================
        const safeDomains = [
            'google.com', 'www.google.com', 'mail.google.com', 'drive.google.com',
            'youtube.com', 'www.youtube.com',
            'facebook.com', 'www.facebook.com', 'm.facebook.com',
            'amazon.com', 'www.amazon.com',
            'microsoft.com', 'www.microsoft.com', 'outlook.com', 'login.microsoftonline.com',
            'apple.com', 'www.apple.com', 'icloud.com',
            'github.com', 'www.github.com',
            'linkedin.com', 'www.linkedin.com',
            'twitter.com', 'x.com',
            'instagram.com', 'www.instagram.com',
            'whatsapp.com', 'web.whatsapp.com',
            'netflix.com', 'www.netflix.com',
            'spotify.com', 'www.spotify.com',
            'wikipedia.org', 'www.wikipedia.org', 'en.wikipedia.org', 'es.wikipedia.org',
            'stackoverflow.com', 'www.stackoverflow.com',
            'reddit.com', 'www.reddit.com',
            'zoom.us', 'www.zoom.us',
            'dropbox.com', 'www.dropbox.com',
        ]

        // If domain is in whitelist, it's definitely safe
        if (safeDomains.includes(domain)) {
            threats.push('✅ Sitio web verificado y confiable')
            return NextResponse.json({
                riskLevel: 'low',
                threats,
                recommendations: ['Sitio seguro y verificado', 'Puedes navegar con confianza'],
                analyzed: true,
            }, { headers: corsHeaders })
        }

        // ============================================
        // 2. CRITICAL THREATS - Immediate High Risk
        // ============================================

        // Check for @ symbol (phishing technique)
        if (url.includes('@')) {
            threats.push('🚨 CRÍTICO: URL contiene "@" - técnica de phishing')
            riskScore += 60
        }

        // Check for IP address instead of domain
        if (domain.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
            threats.push('🚨 CRÍTICO: Usa dirección IP directa - muy sospechoso')
            riskScore += 50
        }

        // ============================================
        // 3. HIGH RISK PATTERNS - Likely Phishing
        // ============================================

        // Typosquatting - common misspellings
        const typosquatting = [
            'paypa1', 'paypai', 'g00gle', 'googIe', 'arnazon', 'amazom',
            'mlcrosoft', 'microsof', 'micros0ft', 'app1e', 'appie',
            'netfl1x', 'facebo0k', 'faceb00k', 'yah00', 'tw1tter'
        ]

        typosquatting.forEach(typo => {
            if (domain.includes(typo)) {
                threats.push(`🚨 Typosquatting detectado: "${typo}" - posible imitación de marca`)
                riskScore += 50
            }
        })

        // Suspicious TLDs
        const dangerousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.zip']
        const domainTLD = domain.substring(domain.lastIndexOf('.'))
        if (dangerousTLDs.includes(domainTLD)) {
            threats.push(`⚠️ Dominio de alto riesgo: ${domainTLD}`)
            riskScore += 30
        }

        // ============================================
        // 4. MEDIUM RISK INDICATORS
        // ============================================

        // URL shorteners
        const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link']
        if (shorteners.some(s => domain.includes(s))) {
            threats.push('⚠️ URL acortada - destino real desconocido')
            riskScore += 20
        }

        // Excessive subdomains (more than 3)
        const subdomains = domain.split('.').length - 2
        if (subdomains > 3) {
            threats.push(`⚠️ Múltiples subdominios (${subdomains}) - podría ser sospechoso`)
            riskScore += 15
        }

        // ============================================
        // 5. PHISHING KEYWORDS (Only if NOT whitelisted)
        // ============================================

        // Only check for phishing if domain contains brand names but ISN'T the real site
        const brandKeywords = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'netflix', 'bank']
        const containsBrand = brandKeywords.some(brand => domain.includes(brand))

        if (containsBrand && !safeDomains.includes(domain)) {
            threats.push('⚠️ Dominio contiene nombre de marca conocida - verificar autenticidad')
            riskScore += 35
        }

        // ============================================
        // 6. LOW RISK INDICATORS
        // ============================================

        // No HTTPS
        if (parsedUrl.protocol !== 'https:') {
            threats.push('⚠️ Conexión HTTP insegura - usa HTTPS siempre que sea posible')
            riskScore += 10
        }

        // Excessive dashes
        const dashCount = (domain.match(/-/g) || []).length
        if (dashCount > 3) {
            threats.push(`ℹ️ Múltiples guiones en dominio (${dashCount})`)
            riskScore += 8
        }

        // ============================================
        // 7. DETERMINE FINAL RISK LEVEL
        // ============================================

        let riskLevel: 'low' | 'medium' | 'high' = 'low'

        if (riskScore >= 50) {
            riskLevel = 'high'
        } else if (riskScore >= 25) {
            riskLevel = 'medium'
        } else {
            riskLevel = 'low'
        }

        // If no threats found, site is safe
        if (threats.length === 0) {
            threats.push('✓ No se detectaron amenazas conocidas')
        }

        // ============================================
        // 8. STORE THREAT IF DETECTED
        // ============================================

        if (riskLevel === 'high' && userId) {
            try {
                await prisma.threat.create({
                    data: {
                        userId,
                        type: 'url_phishing',
                        origin: input,
                        description: threats.join(', '),
                        severity: riskLevel,
                        status: 'blocked',
                    },
                })
            } catch (dbError) {
                console.error('DB Error:', dbError)
            }
        }

        // ============================================
        // 9. GENERATE RECOMMENDATIONS
        // ============================================

        const recommendations = []
        if (riskLevel === 'high') {
            recommendations.push('⛔ NO visites este sitio')
            recommendations.push('🚩 Reporta como phishing')
            recommendations.push('🔍 Verifica el remitente si llegaste por email')
        } else if (riskLevel === 'medium') {
            recommendations.push('⚠️ Proceder con cautela')
            recommendations.push('🔐 NO ingreses datos personales o contraseñas')
            recommendations.push('✅ Verifica que el dominio sea legítimo')
        } else {
            recommendations.push('✅ Sitio parece seguro')
            recommendations.push('💡 Siempre verifica el candado HTTPS')
        }

        return NextResponse.json({
            riskLevel,
            threats,
            recommendations,
            analyzed: true,
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('URL scan error:', error)
        return NextResponse.json({
            error: 'Error al analizar URL',
            analyzed: false,
            riskLevel: 'unknown'
        }, { status: 500, headers: corsHeaders })
    }
}
