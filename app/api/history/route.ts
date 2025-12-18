import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
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

        // Parse query parameters
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // url, email, invoice, network
        const riskLevel = searchParams.get('riskLevel') // low, medium, high
        const search = searchParams.get('search')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const exportFormat = searchParams.get('export') // csv, json

        // Build where clause
        const where: any = {
            userId: payload.userId
        }

        // Combine all scan sources
        const scans: any[] = []

        // Get threats (URL, Email, Invoice scans)
        if (!type || ['url', 'email', 'invoice'].includes(type)) {
            const threatWhere: any = { userId: payload.userId }

            if (type) {
                const typeMap: any = {
                    'url': 'phishing',
                    'email': 'email_phishing',
                    'invoice': 'invoice_fraud'
                }
                threatWhere.type = typeMap[type]
            }

            if (riskLevel) {
                threatWhere.severity = riskLevel
            }

            if (search) {
                threatWhere.OR = [
                    { origin: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }

            if (startDate || endDate) {
                threatWhere.createdAt = {}
                if (startDate) threatWhere.createdAt.gte = new Date(startDate)
                if (endDate) threatWhere.createdAt.lte = new Date(endDate)
            }

            const threats = await prisma.threat.findMany({
                where: threatWhere,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    type: true,
                    origin: true,
                    description: true,
                    severity: true,
                    status: true,
                    createdAt: true
                }
            })

            // Also get emails for email type to include content
            const emails = await prisma.email.findMany({
                where: { userId: payload.userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    sender: true,
                    subject: true,
                    content: true,
                    riskLevel: true,
                    createdAt: true
                }
            })

            // Create a map of emails by date for matching
            const emailMap = new Map()
            emails.forEach(email => {
                const key = email.createdAt.getTime()
                emailMap.set(key, email)
            })

            // Transform threats to unified format
            threats.forEach(threat => {
                const typeMap: any = {
                    'phishing': 'url',
                    'email_phishing': 'email',
                    'invoice_fraud': 'invoice'
                }

                const scanType = typeMap[threat.type] || 'url'

                // Find matching email content for email type threats
                let emailContent = null
                let emailSubject = null
                let emailSender = null

                if (scanType === 'email') {
                    // Find the closest email by timestamp
                    const threatTime = threat.createdAt.getTime()
                    let closestEmail = null
                    let minDiff = Infinity

                    emails.forEach(email => {
                        const diff = Math.abs(email.createdAt.getTime() - threatTime)
                        if (diff < minDiff && diff < 60000) { // Within 1 minute
                            minDiff = diff
                            closestEmail = email
                        }
                    })

                    if (closestEmail) {
                        emailContent = (closestEmail as any).content
                        emailSubject = (closestEmail as any).subject
                        emailSender = (closestEmail as any).sender
                    }
                }

                scans.push({
                    id: threat.id,
                    type: scanType,
                    input: threat.origin,
                    riskLevel: threat.severity,
                    riskScore: threat.severity === 'high' ? 80 : threat.severity === 'medium' ? 50 : 20,
                    threats: threat.description.split(', '),
                    status: threat.status,
                    scannedAt: threat.createdAt,
                    // Additional email fields
                    emailContent: emailContent,
                    emailSubject: emailSubject,
                    emailSender: emailSender
                })
            })

            // Also add emails that don't have threat records (low risk emails)
            if (!type || type === 'email') {
                emails.forEach(email => {
                    // Check if this email is already covered by a threat
                    const alreadyIncluded = scans.some(scan =>
                        scan.type === 'email' &&
                        Math.abs(new Date(scan.scannedAt).getTime() - email.createdAt.getTime()) < 60000
                    )

                    if (!alreadyIncluded && (!riskLevel || email.riskLevel === riskLevel)) {
                        scans.push({
                            id: email.id,
                            type: 'email',
                            input: email.subject || 'Sin asunto',
                            riskLevel: email.riskLevel || 'low',
                            riskScore: email.riskLevel === 'high' ? 80 : email.riskLevel === 'medium' ? 50 : 20,
                            threats: [],
                            status: 'analyzed',
                            scannedAt: email.createdAt,
                            emailContent: email.content,
                            emailSubject: email.subject,
                            emailSender: email.sender
                        })
                    }
                })
            }
        }

        // Get network scans
        if (!type || type === 'network') {
            const connectionWhere: any = { userId: payload.userId }

            if (riskLevel) {
                const statusMap: any = {
                    'high': 'blocked',
                    'medium': 'monitoring',
                    'low': 'active'
                }
                connectionWhere.status = statusMap[riskLevel]
            }

            if (search) {
                connectionWhere.OR = [
                    { ipAddress: { contains: search } },
                ]
            }

            if (startDate || endDate) {
                connectionWhere.createdAt = {}
                if (startDate) connectionWhere.createdAt.gte = new Date(startDate)
                if (endDate) connectionWhere.createdAt.lte = new Date(endDate)
            }

            const connections = await prisma.connection.findMany({
                where: connectionWhere,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    ipAddress: true,
                    port: true,
                    protocol: true,
                    status: true,
                    createdAt: true
                }
            })

            // Transform connections
            connections.forEach(conn => {
                const riskMap: any = {
                    'blocked': 'high',
                    'monitoring': 'medium',
                    'active': 'low'
                }

                scans.push({
                    id: conn.id,
                    type: 'network',
                    input: `${conn.ipAddress}:${conn.port}`,
                    riskLevel: riskMap[conn.status] || 'low',
                    riskScore: conn.status === 'blocked' ? 75 : conn.status === 'monitoring' ? 45 : 15,
                    threats: [],
                    status: conn.status,
                    protocol: conn.protocol,
                    scannedAt: conn.createdAt
                })
            })
        }

        // Sort by date
        scans.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())

        // Handle export
        if (exportFormat === 'csv') {
            const csv = convertToCSV(scans)
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="scan-history-${Date.now()}.csv"`
                }
            })
        }

        if (exportFormat === 'json') {
            return new NextResponse(JSON.stringify(scans, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="scan-history-${Date.now()}.json"`
                }
            })
        }

        // Pagination
        const total = scans.length
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedScans = scans.slice(startIndex, endIndex)

        return NextResponse.json({
            scans: paginatedScans,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('History API error:', error)
        return NextResponse.json(
            { error: 'Error al obtener historial' },
            { status: 500 }
        )
    }
}

function convertToCSV(scans: any[]): string {
    const headers = ['ID', 'Type', 'Input', 'Risk Level', 'Risk Score', 'Threats', 'Status', 'Scanned At']
    const rows = scans.map(scan => [
        scan.id,
        scan.type,
        scan.input,
        scan.riskLevel,
        scan.riskScore,
        Array.isArray(scan.threats) ? scan.threats.join('; ') : '',
        scan.status || '',
        new Date(scan.scannedAt).toISOString()
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
}
