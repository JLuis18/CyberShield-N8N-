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

        // Get threats count
        const threatsBlocked = await prisma.threat.count({
            where: {
                userId: payload.userId,
                status: 'blocked',
            },
        })

        // Get emails count
        const emailsAnalyzed = await prisma.email.count({
            where: {
                userId: payload.userId,
                analyzed: true,
            },
        })

        // Get connections count
        const connectionsAnalyzed = await prisma.connection.count({
            where: {
                userId: payload.userId,
            },
        })

        return NextResponse.json({
            threatsBlocked,
            emailsAnalyzed,
            connectionsAnalyzed,
        })
    } catch (error) {
        console.error('Metrics error:', error)
        return NextResponse.json(
            { error: 'Error al obtener métricas' },
            { status: 500 }
        )
    }
}
