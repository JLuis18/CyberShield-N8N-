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

        // Calculate security score based on real data
        let score = 100 // Start with perfect score

        // Get threats from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentThreats = await prisma.threat.findMany({
            where: {
                userId: payload.userId,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        })

        // Deduct points based on threat severity
        recentThreats.forEach(threat => {
            switch (threat.severity) {
                case 'high':
                case 'critical':
                    score -= 15
                    break
                case 'medium':
                    score -= 10
                    break
                case 'low':
                    score -= 5
                    break
            }

            // Additional deductions for blocked/quarantined threats
            if (threat.status === 'blocked') {
                score -= 5 // Extra penalty for blocked threats
            } else if (threat.status === 'quarantine') {
                score -= 3
            }
        })

        // Get scan activity (emails, URLs, invoices, connections)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentEmails = await prisma.email.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: sevenDaysAgo },
                analyzed: true,
                riskLevel: 'low' // Only count safe scans
            }
        })

        const recentConnections = await prisma.connection.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: sevenDaysAgo },
                status: 'active' // Only safe connections
            }
        })

        // Reward points for safe scans (max +10)
        const safeScanBonus = Math.min((recentEmails + recentConnections) * 2, 10)
        score += safeScanBonus

        // Check for inactivity
        const allActivity = await prisma.threat.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        const emailActivity = await prisma.email.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        const connectionActivity = await prisma.connection.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        const totalActivity = allActivity + emailActivity + connectionActivity

        // Penalize for no activity in 30 days
        if (totalActivity === 0) {
            score -= 20
        }

        // Ensure score stays within bounds
        score = Math.max(0, Math.min(100, score))

        // Calculate threat distribution for the circle segments
        const threatsByType = await prisma.threat.groupBy({
            by: ['severity'],
            where: {
                userId: payload.userId,
                createdAt: { gte: thirtyDaysAgo }
            },
            _count: true
        })

        const totalThreats = recentThreats.length || 1 // Avoid division by zero
        const distribution = {
            low: 0,
            medium: 0,
            high: 0
        }

        threatsByType.forEach(group => {
            const severity = group.severity === 'critical' ? 'high' : group.severity
            if (severity in distribution) {
                distribution[severity as keyof typeof distribution] = (group._count / totalThreats) * 100
            }
        })

        // If no threats, show balanced distribution
        if (recentThreats.length === 0) {
            distribution.low = 70
            distribution.medium = 20
            distribution.high = 10
        }

        return NextResponse.json({
            score: Math.round(score),
            distribution,
            threatCount: recentThreats.length,
            safeScanCount: recentEmails + recentConnections,
            lastActivity: totalActivity > 0 ? new Date().toISOString() : null
        })
    } catch (error) {
        console.error('Security score error:', error)
        return NextResponse.json(
            { error: 'Error al calcular puntuación de seguridad' },
            { status: 500 }
        )
    }
}
