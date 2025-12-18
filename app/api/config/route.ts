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

        // Get user config
        let config = await prisma.userConfig.findUnique({
            where: { userId: payload.userId },
        })

        // Create default config if doesn't exist
        if (!config) {
            config = await prisma.userConfig.create({
                data: {
                    userId: payload.userId,
                },
            })
        }

        return NextResponse.json({
            config: {
                theme: config.theme,
                language: config.language,
                notifications: config.notifications,
            },
        })
    } catch (error) {
        console.error('Config GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener configuración' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
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
        const { theme, language, notifications } = body

        // Update user config
        const config = await prisma.userConfig.upsert({
            where: { userId: payload.userId },
            update: {
                theme,
                language,
                notifications,
            },
            create: {
                userId: payload.userId,
                theme,
                language,
                notifications,
            },
        })

        return NextResponse.json({
            message: 'Configuración actualizada',
            config,
        })
    } catch (error) {
        console.error('Config PATCH error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar configuración' },
            { status: 500 }
        )
    }
}
