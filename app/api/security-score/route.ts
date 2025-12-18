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

        // Get current security score
        const latestScore = await prisma.securityHistory.findFirst({
            where: { userId: payload.userId },
            orderBy: { date: 'desc' },
        })

        // Get security history
        const history = await prisma.securityHistory.findMany({
            where: { userId: payload.userId },
            orderBy: { date: 'desc' },
            take: 30,
        })

        return NextResponse.json({
            currentScore: latestScore?.score || 90,
            history: history.map(h => ({
                date: h.date,
                score: h.score,
            })),
        })
    } catch (error) {
        console.error('Security score error:', error)
        return NextResponse.json(
            { error: 'Error al obtener puntuación de seguridad' },
            { status: 500 }
        )
    }
}
