/**
 * Real Network Threat Database
 * Categorized connection data for accurate threat detection
 */

export interface NetworkConnection {
    ip: string
    port: number
    description: string
    riskLevel: 'safe' | 'warning' | 'high' | 'critical'
    category: string
}

// 🟢 SECURE CONNECTIONS - Known safe services
export const SAFE_CONNECTIONS: NetworkConnection[] = [
    { ip: '8.8.8.8', port: 53, description: 'Google DNS', riskLevel: 'safe', category: 'DNS' },
    { ip: '1.1.1.1', port: 53, description: 'Cloudflare DNS', riskLevel: 'safe', category: 'DNS' },
    { ip: '172.217.5.78', port: 443, description: 'Google HTTPS', riskLevel: 'safe', category: 'Web Services' },
    { ip: '104.26.0.1', port: 443, description: 'Cloudflare Servicios Web', riskLevel: 'safe', category: 'Web Services' },
    { ip: '157.240.3.35', port: 443, description: 'Facebook Servicios HTTPS', riskLevel: 'safe', category: 'Social Media' },
    { ip: '52.217.40.36', port: 443, description: 'AWS Infraestructura', riskLevel: 'safe', category: 'Cloud Infrastructure' },
    { ip: '151.101.1.69', port: 80, description: 'Wikipedia', riskLevel: 'safe', category: 'Web Services' },
    { ip: '35.170.27.238', port: 443, description: 'Amazon Servidor Global', riskLevel: 'safe', category: 'Cloud Infrastructure' },
    { ip: '104.18.31.223', port: 443, description: 'CDN Cloudflare', riskLevel: 'safe', category: 'CDN' },
]

// 🟡 WARNING CONNECTIONS - Suspicious or insecure protocols
export const WARNING_CONNECTIONS: NetworkConnection[] = [
    { ip: '192.168.1.50', port: 21, description: 'FTP sin cifrado', riskLevel: 'warning', category: 'Unencrypted Protocol' },
    { ip: '181.45.117.201', port: 8080, description: 'Proxy HTTP', riskLevel: 'warning', category: 'Proxy' },
    { ip: '177.234.29.22', port: 23, description: 'Telnet inseguro', riskLevel: 'warning', category: 'Unencrypted Protocol' },
    { ip: '192.168.0.15', port: 3389, description: 'Escritorio Remoto (RDP)', riskLevel: 'warning', category: 'Remote Access' },
    { ip: '201.245.191.17', port: 5900, description: 'VNC remoto', riskLevel: 'warning', category: 'Remote Access' },
    { ip: '200.35.201.155', port: 110, description: 'POP3 sin seguridad', riskLevel: 'warning', category: 'Email Protocol' },
    { ip: '189.142.21.101', port: 25, description: 'SMTP inseguro', riskLevel: 'warning', category: 'Email Protocol' },
    { ip: '45.186.64.9', port: 389, description: 'LDAP expuesto', riskLevel: 'warning', category: 'Directory Service' },
]

// 🔴 HIGH RISK CONNECTIONS - Botnets, C2, TOR, RAT
export const HIGH_RISK_CONNECTIONS: NetworkConnection[] = [
    { ip: '45.71.101.221', port: 22, description: 'SSH externo desconocido', riskLevel: 'high', category: 'Remote Access' },
    { ip: '103.150.97.12', port: 4444, description: 'Puerto RAT de control remoto', riskLevel: 'high', category: 'RAT' },
    { ip: '185.220.101.4', port: 9001, description: 'Nodo de salida TOR', riskLevel: 'high', category: 'TOR Network' },
    { ip: '201.48.11.93', port: 6667, description: 'Botnet IRC', riskLevel: 'high', category: 'Botnet' },
    { ip: '92.255.85.66', port: 5000, description: 'Reverse Shell', riskLevel: 'high', category: 'Reverse Shell' },
    { ip: '89.248.165.234', port: 8081, description: 'Beaconing C2', riskLevel: 'high', category: 'C2 Server' },
    { ip: '188.68.41.191', port: 135, description: 'RPC Expuesto', riskLevel: 'high', category: 'RPC' },
    { ip: '156.146.63.56', port: 1080, description: 'SOCKS Proxy oculto', riskLevel: 'high', category: 'Proxy' },
]

// 🧨 CRITICAL CONNECTIONS - Direct attack indicators
export const CRITICAL_CONNECTIONS: NetworkConnection[] = [
    { ip: '145.239.5.30', port: 4444, description: 'Control Botnet', riskLevel: 'critical', category: 'Botnet C2' },
    { ip: '185.156.177.59', port: 1337, description: 'Puerto de explotación', riskLevel: 'critical', category: 'Exploitation' },
    { ip: '198.98.49.55', port: 9001, description: 'TOR Hidden Service', riskLevel: 'critical', category: 'TOR Network' },
    { ip: '81.17.18.59', port: 6667, description: 'Control Botnet IRC', riskLevel: 'critical', category: 'Botnet C2' },
    { ip: '185.129.62.62', port: 2222, description: 'SSH Persistente oculto', riskLevel: 'critical', category: 'Backdoor' },
    { ip: '5.79.113.108', port: 23, description: 'Telnet usado por Mirai', riskLevel: 'critical', category: 'Mirai Botnet' },
    { ip: '144.76.139.55', port: 8888, description: 'Servidor CobaltStrike C2', riskLevel: 'critical', category: 'CobaltStrike' },
    { ip: '193.56.28.52', port: 443, description: 'Server Beaconing HTTPS', riskLevel: 'critical', category: 'C2 Server' },
    { ip: '104.21.16.101', port: 2053, description: 'Puerto de exfiltración SSL', riskLevel: 'critical', category: 'Data Exfiltration' },
]

// Port-based risk assessment
export const DANGEROUS_PORTS: Record<number, { description: string; riskLevel: 'warning' | 'high' | 'critical'; category: string }> = {
    // Remote Access - Warning to High
    21: { description: 'FTP sin cifrado', riskLevel: 'warning', category: 'File Transfer' },
    22: { description: 'SSH - Acceso remoto', riskLevel: 'warning', category: 'Remote Access' },
    23: { description: 'Telnet inseguro', riskLevel: 'warning', category: 'Remote Access' },
    3389: { description: 'RDP - Escritorio Remoto', riskLevel: 'warning', category: 'Remote Access' },
    5900: { description: 'VNC - Control remoto', riskLevel: 'warning', category: 'Remote Access' },

    // Email - Warning
    25: { description: 'SMTP inseguro', riskLevel: 'warning', category: 'Email' },
    110: { description: 'POP3 sin seguridad', riskLevel: 'warning', category: 'Email' },

    // Directory Services - Warning
    389: { description: 'LDAP expuesto', riskLevel: 'warning', category: 'Directory' },

    // RPC/SMB - High
    135: { description: 'RPC Expuesto', riskLevel: 'high', category: 'Windows Service' },
    139: { description: 'NetBIOS', riskLevel: 'high', category: 'File Sharing' },
    445: { description: 'SMB - Compartición archivos', riskLevel: 'high', category: 'File Sharing' },

    // Proxies - High
    1080: { description: 'SOCKS Proxy', riskLevel: 'high', category: 'Proxy' },
    8080: { description: 'HTTP Proxy', riskLevel: 'warning', category: 'Proxy' },

    // Malware/RAT - Critical
    1337: { description: 'Puerto de explotación', riskLevel: 'critical', category: 'Exploitation' },
    2222: { description: 'SSH alternativo (backdoor común)', riskLevel: 'critical', category: 'Backdoor' },
    4444: { description: 'Metasploit/RAT', riskLevel: 'critical', category: 'RAT' },
    5000: { description: 'Reverse Shell/Payload Server', riskLevel: 'high', category: 'Reverse Shell' },
    6667: { description: 'IRC - Usado por botnets', riskLevel: 'high', category: 'Botnet' },
    8081: { description: 'C2 Beaconing', riskLevel: 'high', category: 'C2' },
    8888: { description: 'CobaltStrike/C2', riskLevel: 'critical', category: 'C2' },
    9001: { description: 'TOR/C2', riskLevel: 'high', category: 'TOR' },
    12345: { description: 'NetBus (Trojan)', riskLevel: 'critical', category: 'Trojan' },
    31337: { description: 'Back Orifice (Trojan)', riskLevel: 'critical', category: 'Trojan' },

    // Data Exfiltration
    2053: { description: 'Exfiltración SSL', riskLevel: 'critical', category: 'Exfiltration' },
}

// Safe ports and services
export const SAFE_PORTS: Record<number, string> = {
    53: 'DNS - Resolución de nombres',
    80: 'HTTP - Tráfico web',
    443: 'HTTPS - Tráfico web seguro',
    143: 'IMAP - Correo',
    993: 'IMAPS - Correo seguro',
    995: 'POP3S - Correo seguro',
}

/**
 * Check if an IP:Port combination is in our known threat database
 */
export function checkKnownConnection(ip: string, port: number): NetworkConnection | null {
    const allConnections = [
        ...SAFE_CONNECTIONS,
        ...WARNING_CONNECTIONS,
        ...HIGH_RISK_CONNECTIONS,
        ...CRITICAL_CONNECTIONS,
    ]

    return allConnections.find(conn => conn.ip === ip && conn.port === port) || null
}

/**
 * Get risk level for a specific port
 */
export function getPortRisk(port: number): { description: string; riskLevel: string; category: string } | null {
    if (DANGEROUS_PORTS[port]) {
        return DANGEROUS_PORTS[port]
    }
    if (SAFE_PORTS[port]) {
        return { description: SAFE_PORTS[port], riskLevel: 'safe', category: 'Standard Service' }
    }
    return null
}

/**
 * Analyze connection and return comprehensive threat info
 */
export function analyzeConnection(ip: string, port: number): {
    riskLevel: 'safe' | 'warning' | 'high' | 'critical'
    threats: string[]
    category: string
    recommendations: string[]
    emoji: string
} {
    const knownConnection = checkKnownConnection(ip, port)
    const portInfo = getPortRisk(port)

    const threats: string[] = []
    let riskLevel: 'safe' | 'warning' | 'high' | 'critical' = 'safe'
    let category = 'Unknown'
    const recommendations: string[] = []
    let emoji = '🟢'

    // Check known connection first
    if (knownConnection) {
        riskLevel = knownConnection.riskLevel
        category = knownConnection.category
        threats.push(`${knownConnection.description}`)

        switch (riskLevel) {
            case 'critical':
                emoji = '🧨'
                threats.push('🔥 Alta probabilidad de ataque dirigido')
                threats.push('🔥 Servidor de comando y control (C2)')
                recommendations.push('⛔ BLOQUEAR INMEDIATAMENTE')
                recommendations.push('🚨 Aislar el sistema afectado')
                recommendations.push('📞 Contactar equipo de respuesta a incidentes')
                recommendations.push('🔍 Auditoría completa del sistema')
                break
            case 'high':
                emoji = '🔴'
                threats.push('⚠️ Posible amenaza o servicio expuesto')
                recommendations.push('🚫 Bloquear esta conexión')
                recommendations.push('🔍 Investigar origen inmediatamente')
                recommendations.push('📊 Revisar logs de seguridad')
                recommendations.push('🛡️ Activar monitoreo intensivo')
                break
            case 'warning':
                emoji = '🟡'
                threats.push('⚠️ Conexión sospechosa o insegura')
                recommendations.push('👁️ Monitorear esta conexión')
                recommendations.push('✅ Verificar legitimidad del tráfico')
                recommendations.push('🔐 Considerar uso de protocolo seguro')
                break
            case 'safe':
                emoji = '🟢'
                threats.push('✓ Conexión segura verificada')
                recommendations.push('✅ Conexión legítima y segura')
                recommendations.push('📊 Mantener monitoreo estándar')
                break
        }
    }
    // Check port-based risk if no exact match
    else if (portInfo) {
        riskLevel = portInfo.riskLevel as any
        category = portInfo.category
        threats.push(`${portInfo.description}`)

        if (riskLevel === 'critical') {
            emoji = '🔴'
            threats.push('🚨 Puerto asociado con malware/ataques')
            recommendations.push('⛔ NO permitir esta conexión')
            recommendations.push('🔥 Bloquear en firewall')
            recommendations.push('🔍 Investigar el origen')
        } else if (riskLevel === 'high') {
            emoji = '🟡'
            threats.push('⚠️ Puerto de alto riesgo')
            recommendations.push('👁️ Monitoreo estricto requerido')
            recommendations.push('🔐 Validar necesidad de este servicio')
        } else if (riskLevel === 'warning') {
            emoji = '🟡'
            threats.push('⚠️ Protocolo inseguro o expuesto')
            recommendations.push('🔐 Migrar a versión segura si es posible')
            recommendations.push('👁️ Monitorear actividad')
        }
    }

    return { riskLevel, threats, category, recommendations, emoji }
}
