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

        // For now, return mock notifications since DB might not be migrated yet
        const mockNotifications = [
            {
                id: '1',
                title: 'Amenaza detectada',
                message: 'Se detectó un intento de phishing en el último análisis',
                type: 'threat',
                severity: 'high',
                read: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Nivel de seguridad actualizado',
                message: 'Tu puntuación de seguridad ha aumentado a 92',
                type: 'security',
                severity: 'info',
                read: true,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ]

        const unreadCount = mockNotifications.filter(n => !n.read).length

        return NextResponse.json({
            notifications: mockNotifications,
            unreadCount,
            total: mockNotifications.length
        })
    } catch (error) {
        console.error('Notifications error:', error)
        return NextResponse.json(
            { error: 'Error al obtener notificaciones' },
            { status: 500 }
        )
    }
}
