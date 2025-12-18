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

        // Get historical threat data for last 8 months
        const now = new Date()
        const eightMonthsAgo = new Date()
        eightMonthsAgo.setMonth(now.getMonth() - 8)

        const threats = await prisma.threat.findMany({
            where: {
                userId: payload.userId,
                createdAt: {
                    gte: eightMonthsAgo
                }
            },
            select: {
                createdAt: true,
                severity: true
            }
        })

        // Group threats by month
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const labels: string[] = []
        const totalThreats: number[] = []
        const criticalThreats: number[] = []

        // Create array of last 8 months
        for (let i = 7; i >= 0; i--) {
            const date = new Date()
            date.setMonth(now.getMonth() - i)
            labels.push(monthNames[date.getMonth()])
        }

        // Count threats for each month
        labels.forEach((_, index) => {
            const monthDate = new Date()
            monthDate.setMonth(now.getMonth() - (7 - index))
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

            const monthThreats = threats.filter(t =>
                t.createdAt >= monthStart && t.createdAt <= monthEnd
            )

            totalThreats.push(monthThreats.length)
            criticalThreats.push(
                monthThreats.filter(t => t.severity === 'high' || t.severity === 'critical').length
            )
        })

        return NextResponse.json({
            labels,
            totalThreats,
            criticalThreats
        })
    } catch (error) {
        console.error('Trends error:', error)
        return NextResponse.json(
            { error: 'Error al obtener tendencias' },
            { status: 500 }
        )
    }
}
