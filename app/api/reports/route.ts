import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

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
        const { type, period } = body // type: monthly/custom, period: "2025-12" or custom dates

        let startDate: Date
        let endDate: Date
        let periodLabel: string

        if (type === 'monthly') {
            // Monthly report
            const [year, month] = period.split('-').map(Number)
            startDate = startOfMonth(new Date(year, month - 1))
            endDate = endOfMonth(new Date(year, month - 1))
            periodLabel = format(startDate, 'MMMM yyyy')
        } else {
            // Custom range
            startDate = new Date(body.startDate)
            endDate = new Date(body.endDate)
            periodLabel = `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        }

        // Gather statistics
        const [threats, connections, totalScans, user] = await Promise.all([
            prisma.threat.findMany({
                where: {
                    userId: payload.userId,
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.connection.findMany({
                where: {
                    userId: payload.userId,
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.usageLog.count({
                where: {
                    userId: payload.userId,
                    timestamp: { gte: startDate, lte: endDate }
                }
            }),
            prisma.user.findUnique({
                where: { id: payload.userId },
                select: { name: true, email: true }
            })
        ])

        // Calculate stats
        const stats = {
            period: periodLabel,
            totalScans,
            totalThreats: threats.length,
            highRiskThreats: threats.filter(t => t.severity === 'high').length,
            mediumRiskThreats: threats.filter(t => t.severity === 'medium').length,
            lowRiskThreats: threats.filter(t => t.severity === 'low').length,
            blockedThreats: threats.filter(t => t.status === 'blocked').length,
            networkScans: connections.length,
            blockedConnections: connections.filter(c => c.status === 'blocked').length,

            // By type
            urlThreats: threats.filter(t => t.type === 'phishing').length,
            emailThreats: threats.filter(t => t.type === 'email_phishing').length,
            invoiceThreats: threats.filter(t => t.type === 'invoice_fraud').length,

            // Top threats
            topThreats: threats
                .filter(t => t.severity === 'high')
                .slice(0, 10)
                .map(t => ({
                    type: t.type,
                    origin: t.origin,
                    description: t.description,
                    date: t.createdAt
                }))
        }

        // Create report record
        const report = await prisma.report.create({
            data: {
                userId: payload.userId,
                type: type,
                period: period || `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`,
                status: 'completed',
                stats: JSON.stringify(stats)
            }
        })

        return NextResponse.json({
            reportId: report.id,
            stats,
            userName: user?.name,
            userEmail: user?.email
        })
    } catch (error) {
        console.error('Report generation error:', error)
        return NextResponse.json(
            { error: 'Error al generar reporte' },
            { status: 500 }
        )
    }
}

// Get list of reports
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

        const reports = await prisma.report.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json({ reports })
    } catch (error) {
        console.error('Reports list error:', error)
        return NextResponse.json(
            { error: 'Error al obtener reportes' },
            { status: 500 }
        )
    }
}
