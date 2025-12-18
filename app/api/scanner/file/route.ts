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
            return NextResponse.json({ error: 'Información de archivo requerida' }, { status: 400 })
        }

        // Simulate file analysis
        const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.vbs', '.js', '.scr', '.com']
        const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']

        const filename = input.toLowerCase()
        const threats: string[] = []
        let riskLevel = 'low'

        // Check file extension
        const hasSuspiciousExt = suspiciousExtensions.some(ext => filename.includes(ext))
        if (hasSuspiciousExt) {
            threats.push('Extensión de archivo potencialmente peligrosa')
            riskLevel = 'high'
        }

        // Check for double extensions
        if ((filename.match(/\./g) || []).length > 1) {
            threats.push('Archivo con doble extensión detectado')
            riskLevel = 'high'
        }

        // Check for macro-enabled documents
        if (filename.includes('.xlsm') || filename.includes('.docm')) {
            threats.push('Documento con macros habilitadas')
            riskLevel = 'medium'
        }

        // Simulate content analysis
        if (input.includes('invoice') || input.includes('factura')) {
            if (riskLevel === 'low') {
                threats.push('Documento de factura - verificar remitente')
                riskLevel = 'medium'
            }
        }

        // Check for suspicious patterns in content
        const suspiciousPatterns = ['password', 'credentials', 'ransomware', 'payload']
        suspiciousPatterns.forEach(pattern => {
            if (input.includes(pattern)) {
                threats.push(`Contenido sospechoso detectado: "${pattern}"`)
                riskLevel = 'high'
            }
        })

        // Create threat record if detected
        if (threats.length > 0) {
            await prisma.threat.create({
                data: {
                    userId: payload.userId,
                    type: 'file_malware',
                    origin: filename,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'quarantine' : 'monitoring',
                },
            })
        }

        const recommendations = []
        if (riskLevel === 'high') {
            recommendations.push('NO ABRIR el archivo')
            recommendations.push('Eliminar inmediatamente')
            recommendations.push('Ejecutar análisis antivirus completo')
            recommendations.push('Cambiar contraseñas si ya fue abierto')
        } else if (riskLevel === 'medium') {
            recommendations.push('Verificar origen del archivo')
            recommendations.push('Analizar con antivirus antes de abrir')
            recommendations.push('Deshabilitar macros si es un documento')
        } else {
            recommendations.push('Archivo parece seguro')
            recommendations.push('Mantener antivirus actualizado')
        }

        return NextResponse.json({
            riskLevel,
            threats,
            recommendations,
            analyzed: true,
        })
    } catch (error) {
        console.error('File scan error:', error)
        return NextResponse.json(
            { error: 'Error al analizar archivo' },
            { status: 500 }
        )
    }
}
