import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        let userId = null

        // Authentication is now optional - allow anonymous scans
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
        const { input, fileType, fileSize } = body

        if (!input) {
            return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
        }

        // Enhanced invoice analysis with comprehensive fraud detection
        const filename = input.toLowerCase()
        const content = input.toLowerCase() // In real app, this would be OCR extracted text
        const threats: string[] = []
        let riskScore = 0

        // Check file size
        if (fileSize && fileSize > 10 * 1024 * 1024) {
            threats.push('⚠️ Archivo excede tamaño recomendado (>10MB)')
            riskScore += 15
        }

        // Check file type - strict validation
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        if (fileType && !validTypes.includes(fileType)) {
            threats.push('🚨 Tipo de archivo no válido o sospechoso')
            riskScore += 40
        }

        // ===== FRAUD PATTERN 1: Cambio de Cuenta Bancaria =====
        const accountChangeKeywords = [
            'cambio de cuenta', 'cambio cuenta', 'nueva cuenta', 'cuenta actualizada',
            'actualizada cuenta', 'actualización bancaria', 'cambio de infraestructura',
            'no utilizar cuenta', 'cuenta anterior', 'reemplaza versión',
            'new account', 'updated account', 'account change', 'new iban'
        ]

        accountChangeKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                threats.push(`🚨 Cambio de cuenta bancaria: "${keyword}"`)
                riskScore += 35
            }
        })

        // ===== FRAUD PATTERN 2: Urgencia y Presión =====
        const urgencyKeywords = [
            'urgente', 'inmediato', 'pago inmediato', '24h', '24 horas',
            'fecha límite', 'último aviso', 'última oportunidad',
            'cuenta desactivada', 'servicio suspendido', 'bloqueado',
            'immediate', 'urgent', 'asap', 'immediately', 'time sensitive'
        ]

        urgencyKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                threats.push(`⚠️ Presión de urgencia: "${keyword}"`)
                riskScore += 25
            }
        })

        // ===== FRAUD PATTERN 3: SUNAT / Gobierno Falsificado =====
        const governmentKeywords = [
            'sunat', 'regularización tributaria', 'ajuste correctivo',
            'diferencias de declaración', 'multa tributaria', 'sanción',
            'superintendencia', 'tributos internos'
        ]

        governmentKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                threats.push(`🚨 Posible suplantación de SUNAT/gobierno: "${keyword}"`)
                riskScore += 40
            }
        })

        // ===== FRAUD PATTERN 4: Dominios de Email Sospechosos =====
        const suspiciousDomains = [
            '@provider-mail.com', '@support.com', '@servicio.com', '@pagos.net',
            '@facturacion.com', '@company-mail.com', '@business-support.com',
            '@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com'
        ]

        suspiciousDomains.forEach(domain => {
            if (content.includes(domain)) {
                threats.push(`⚠️ Dominio de email sospechoso: "${domain}"`)
                riskScore += 20
            }
        })

        // ===== FRAUD PATTERN 5: CCI/IBAN Patterns =====
        if (content.includes('cci:') || content.includes('iban:')) {
            threats.push('ℹ️ Contiene información bancaria (CCI/IBAN)')
            riskScore += 10
        }

        // Detect multiple CCI/IBAN (suspicious)
        const cciMatches = (content.match(/cci/gi) || []).length
        if (cciMatches > 1) {
            threats.push('⚠️ Múltiples cuentas bancarias mencionadas')
            riskScore += 25
        }

        // ===== FRAUD PATTERN 6: Archivos Embebidos Peligrosos =====
        const dangerousExtensions = [
            '.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar',
            '.com', '.pif', '.msi', '.app', '.deb', '.dmg', '.dll',
            '.zip', '.rar', '.7z'
        ]

        dangerousExtensions.forEach(ext => {
            if (filename.includes(ext) || content.includes(ext)) {
                threats.push(`🚨 Archivo ejecutable/comprimido detectado: "${ext}"`)
                riskScore += 50
            }
        })

        // ===== FRAUD PATTERN 7: Extensión Doble =====
        const extensionCount = (filename.match(/\./g) || []).length
        if (extensionCount > 1) {
            threats.push('🚨 Extensión doble detectada (técnica de malware)')
            riskScore += 45
        }

        // ===== FRAUD PATTERN 8: Empresas/Proveedores Falsificados =====
        const fakeCompanyPatterns = [
            'servi media', 'media group', 'tech import', 'global tech',
            'proyectos andinas', 'instalaciones andinas', 'proveedorxyz',
            'servicio especializado', 'soporte técnico'
        ]

        fakeCompanyPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
                threats.push(`⚠️ Nombre de empresa genérico: "${pattern}"`)
                riskScore += 15
            }
        })

        // ===== FRAUD PATTERN 9: Montos Altos con Urgencia =====
        const amountPatterns = [
            /s\/\.\s*\d{4,}/, // S/. 1000+
            /usd\s*\d{4,}/,   // USD 1000+
            /\$\s*\d{4,}/     // $ 1000+
        ]

        const hasHighAmount = amountPatterns.some(pattern => pattern.test(content))
        if (hasHighAmount && riskScore > 20) {
            threats.push('⚠️ Monto alto + otros indicadores sospechosos')
            riskScore += 20
        }

        // ===== FRAUD PATTERN 10: Palabras Clave de Fraude =====
        const fraudKeywords = [
            'descarga la factura', 'adjunto comprobante', 'archivo adjunto',
            'ver factura', 'click aquí', 'haga clic', 'descargar pdf',
            'verificar pago', 'confirmar transferencia', 'validar cuenta'
        ]

        fraudKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                threats.push(`⚠️ Solicitud de acción sospechosa: "${keyword}"`)
                riskScore += 18
            }
        })

        // ===== FRAUD PATTERN 11: Falta de Información Oficial =====
        const missingOfficialInfo = [
            'sin firma', 'unsigned', 'no firmado', 'author: unknown',
            'producer: unknown', 'beta', 'no verified'
        ]

        missingOfficialInfo.forEach(keyword => {
            if (content.includes(keyword)) {
                threats.push('⚠️ Falta información oficial/firma digital')
                riskScore += 22
            }
        })

        // ===== FRAUD PATTERN 12: Typosquatting en Empresas =====
        const typosquattedCompanies = [
            'sunat-pe', 'nsunat', 'sunat.com', 'sunat-peru',
            'bcp-banco', 'interbank-peru', 'continental-bank'
        ]

        typosquattedCompanies.forEach(typo => {
            if (content.includes(typo)) {
                threats.push(`🚨 Posible typosquatting de entidad: "${typo}"`)
                riskScore += 40
            }
        })

        // ===== FRAUD PATTERN 13: Números de Factura Sospechosos =====
        if (filename.match(/\d{10,}/)) {
            threats.push('⚠️ Número de factura excesivamente largo')
            riskScore += 12
        }

        // ===== FRAUD PATTERN 14: Campos Inconsistentes =====
        const inconsistencyPatterns = [
            'datos no coinciden', 'información actualizada', 'cambio de datos',
            'nueva dirección', 'nuevo contacto', 'teléfono actualizado'
        ]

        inconsistencyPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
                threats.push(`⚠️ Inconsistencia de datos: "${pattern}"`)
                riskScore += 15
            }
        })

        // Determine risk level (LOWERED THRESHOLDS)
        let riskLevel = 'low'
        if (riskScore >= 40) {
            riskLevel = 'high'
        } else if (riskScore >= 20) {
            riskLevel = 'medium'
        }

        // Store analysis result (only if authenticated)
        if (threats.length > 0 && userId) {
            await prisma.threat.create({
                data: {
                    userId,
                    type: 'invoice_fraud',
                    origin: input,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: riskLevel === 'high' ? 'quarantine' : 'monitoring',
                },
            })
        }

        const recommendations = []
        if (riskLevel === 'high') {
            recommendations.push('🚨 NO PROCESAR este documento')
            recommendations.push('🚨 NO realizar ningún pago')
            recommendations.push('📞 Contactar al remitente por canal oficial verificado')
            recommendations.push('📋 Reportar como posible fraude')
            recommendations.push('🔍 Verificar autenticidad con el emisor')
        } else if (riskLevel === 'medium') {
            recommendations.push('⚠️ Verificar remitente antes de procesar')
            recommendations.push('📞 Confirmar detalles de pago por teléfono')
            recommendations.push('🔍 Revisar números de cuenta cuidadosamente')
            recommendations.push('🛡️ Escanear archivo con antivirus')
        } else {
            recommendations.push('✓ Factura parece legítima')
            recommendations.push('📋 Verificar datos de pago estándar')
            recommendations.push('💾 Archivar copia de seguridad')
        }

        return NextResponse.json({
            riskLevel,
            threats,
            recommendations,
            analyzed: true,
            fileInfo: {
                name: input,
                type: fileType || 'unknown',
                size: fileSize ? `${(fileSize / 1024).toFixed(2)} KB` : 'unknown',
                riskScore
            }
        })
    } catch (error) {
        console.error('Invoice scan error:', error)
        return NextResponse.json(
            { error: 'Error al analizar factura' },
            { status: 500 }
        )
    }
}
