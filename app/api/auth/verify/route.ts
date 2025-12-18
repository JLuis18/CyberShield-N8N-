import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const payload = verifyToken(token)

        if (!payload) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            message: 'Token válido',
            user: payload,
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al verificar token' },
            { status: 500 }
        )
    }
}
