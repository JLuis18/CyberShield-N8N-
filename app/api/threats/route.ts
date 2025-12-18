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

        // Get all threats for user
        const threats = await prisma.threat.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ threats })
    } catch (error) {
        console.error('Threats error:', error)
        return NextResponse.json(
            { error: 'Error al obtener amenazas' },
            { status: 500 }
        )
    }
}
