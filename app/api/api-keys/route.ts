import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { generateApiKey, hashApiKey } from '@/lib/api-auth'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


// GET - List all API keys for user
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

        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: payload.userId },
            select: {
                id: true,
                name: true,
                isActive: true,
                rateLimit: true,
                lastUsedAt: true,
                createdAt: true,
                expiresAt: true,
                // Don't return the actual key
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ apiKeys })
    } catch (error) {
        console.error('Get API keys error:', error)
        return NextResponse.json(
            { error: 'Error al obtener API keys' },
            { status: 500 }
        )
    }
}

// POST - Create new API key
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
        const { name, rateLimit = 100, expiresAt } = body

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'Nombre de API key requerido' },
                { status: 400 }
            )
        }

        // Generate new API key
        const apiKey = generateApiKey()
        const hashedKey = hashApiKey(apiKey)

        // Store in database
        const newKey = await prisma.apiKey.create({
            data: {
                userId: payload.userId,
                name: name.trim(),
                key: hashedKey,
                rateLimit,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            select: {
                id: true,
                name: true,
                isActive: true,
                rateLimit: true,
                createdAt: true,
                expiresAt: true,
            }
        })

        // IMPORTANT: Return the plain key ONLY ONCE
        // User must save it, we'll never show it again
        return NextResponse.json({
            apiKey: apiKey, // Plain text key - show only once
            ...newKey,
            warning: 'Save this key now! It will not be shown again.'
        })
    } catch (error) {
        console.error('Create API key error:', error)
        return NextResponse.json(
            { error: 'Error al crear API key' },
            { status: 500 }
        )
    }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const keyId = searchParams.get('id')

        if (!keyId) {
            return NextResponse.json(
                { error: 'ID de API key requerido' },
                { status: 400 }
            )
        }

        // Verify ownership and delete
        const deleted = await prisma.apiKey.deleteMany({
            where: {
                id: keyId,
                userId: payload.userId // Ensure user owns this key
            }
        })

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: 'API key no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, message: 'API key revocada' })
    } catch (error) {
        console.error('Delete API key error:', error)
        return NextResponse.json(
            { error: 'Error al revocar API key' },
            { status: 500 }
        )
    }
}
