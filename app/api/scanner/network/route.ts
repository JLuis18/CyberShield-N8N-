import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
        const { ipAddress, port, protocol = 'TCP' } = body

        if (!ipAddress) {
            return NextResponse.json({ error: 'IP address requerida' }, { status: 400 })
        }

        if (!port || port < 1 || port > 65535) {
            return NextResponse.json({ error: 'Puerto inválido (1-65535)' }, { status: 400 })
        }

        const threats: string[] = []
        let riskScore = 0

        // Validate IP format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
        if (!ipRegex.test(ipAddress)) {
            return NextResponse.json({ error: 'Formato de IP inválido' }, { status: 400 })
        }

        // Check each octet is valid (0-255)
        const octets = ipAddress.split('.').map(Number)
        if (octets.some((octet: number) => octet > 255)) {
            return NextResponse.json({ error: 'IP address inválida' }, { status: 400 })
        }

        // Check for private IP ranges
        const isPrivateIP =
            (octets[0] === 10) ||
            (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
            (octets[0] === 192 && octets[1] === 168) ||
            (octets[0] === 127) // Loopback

        if (isPrivateIP) {
            threats.push('🔒 IP privada detectada - no debería acceder a internet')
            riskScore += 25
        }

        // Check for localhost
        if (octets[0] === 127) {
            threats.push('⚠️ Dirección loopback (localhost)')
            riskScore += 15
        }

        // Check for broadcast/multicast
        if (octets[0] >= 224) {
            threats.push('⚠️ Dirección multicast/broadcast')
            riskScore += 20
        }

        // Detect dangerous ports
        const dangerousPorts: { [key: number]: string } = {
            // Remote access
            22: 'SSH - Acceso remoto',
            23: 'Telnet - Acceso remoto sin cifrar',
            3389: 'RDP - Escritorio remoto Windows',
            5900: 'VNC - Control remoto',

            // File sharing
            21: 'FTP - Transferencia archivos sin cifrar',
            445: 'SMB - Compartición archivos Windows',
            139: 'NetBIOS - Compartición archivos',
            69: 'TFTP - Transferencia archivos trivial',

            // Databases
            3306: 'MySQL - Base de datos',
            5432: 'PostgreSQL - Base de datos',
            27017: 'MongoDB - Base de datos',
            1433: 'MS SQL Server - Base de datos',
            6379: 'Redis - Base de datos',

            // Administration
            8080: 'HTTP Proxy - Puerto administrativo',
            8443: 'HTTPS alternativo',
            8888: 'Puerto administrativo común',

            // Trojans/Malware (common trojan ports)
            12345: 'NetBus - Puerto de troyano conocido',
            31337: 'Back Orifice - Puerto de troyano',
            6667: 'IRC - Usado por botnets',
        }

        if (dangerousPorts[port]) {
            threats.push(`🚨 Puerto peligroso: ${dangerousPorts[port]}`)
            riskScore += 30
        }

        // Check for well-known safe services
        const safePorts: { [key: number]: string } = {
            80: 'HTTP - Tráfico web',
            443: 'HTTPS - Tráfico web seguro',
            53: 'DNS - Resolución de nombres',
            25: 'SMTP - Correo saliente',
            110: 'POP3 - Correo entrante',
            143: 'IMAP - Correo entrante',
            993: 'IMAPS - Correo seguro',
            995: 'POP3S - Correo seguro',
        }

        if (safePorts[port]) {
            threats.push(`✓ Puerto estándar: ${safePorts[port]}`)
            riskScore -= 10 // Reduce risk for known safe ports
        }

        // Check for high ports (often used by malware)
        if (port > 49152) {
            threats.push('⚠️ Puerto dinámico/privado (>49152)')
            riskScore += 15
        }

        // Detect cloud provider IPs (simplified check)
        // AWS ranges start with specific octets
        if ((octets[0] === 3 || octets[0] === 18 || octets[0] === 52 || octets[0] === 54)) {
            threats.push('☁️ Posible IP de AWS')
            riskScore += 5
        }

        // Google Cloud
        if (octets[0] === 35 || (octets[0] === 34 && octets[1] < 128)) {
            threats.push('☁️ Posible IP de Google Cloud')
            riskScore += 5
        }

        // Determine risk level
        let riskLevel = 'low'
        let status = 'monitoring'

        if (riskScore >= 40) {
            riskLevel = 'high'
            status = 'blocked'
        } else if (riskScore >= 20) {
            riskLevel = 'medium'
            status = 'monitoring'
        } else if (riskScore < 0) {
            riskScore = 0
            riskLevel = 'low'
            status = 'active'
        }

        // Store in database (only if authenticated)
        if (userId) {
            await prisma.connection.create({
                data: {
                    userId,
                    ipAddress,
                    port,
                    protocol,
                    status,
                },
            })
        }

        // Create threat if high risk (only if authenticated)
        if (riskLevel === 'high' && userId) {
            await prisma.threat.create({
                data: {
                    userId,
                    type: 'network_connection',
                    origin: `${ipAddress}:${port}`,
                    description: threats.join(', '),
                    severity: riskLevel,
                    status: 'blocked',
                },
            })
        }

        const recommendations = []
        if (riskLevel === 'high') {
            recommendations.push('NO permitir esta conexión')
            recommendations.push('Bloquear en firewall')
            recommendations.push('Investigar el origen de la conexión')
            recommendations.push('Revisar logs de seguridad')
        } else if (riskLevel === 'medium') {
            recommendations.push('Monitorear esta conexión')
            recommendations.push('Verificar que sea tráfico legítimo')
            recommendations.push('Considerar bloqueo si persiste')
        } else {
            recommendations.push('Conexión parece legítima')
            recommendations.push('Mantener monitoreo estándar')
        }

        return NextResponse.json({
            riskLevel,
            threats,
            recommendations,
            analyzed: true,
            connectionInfo: {
                ip: ipAddress,
                port,
                protocol,
                status,
            }
        })
    } catch (error) {
        console.error('Network scan error:', error)
        return NextResponse.json(
            { error: 'Error al analizar conexión' },
            { status: 500 }
        )
    }
}
