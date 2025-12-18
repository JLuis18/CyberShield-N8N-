import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
        const { endpoint, keys } = body

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return NextResponse.json(
                { error: 'Invalid subscription data' },
                { status: 400 }
            )
        }

        // Check if subscription already exists
        const existing = await prisma.pushSubscription.findUnique({
            where: { endpoint }
        })

        if (existing) {
            // Update if exists
            await prisma.pushSubscription.update({
                where: { endpoint },
                data: {
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                    isActive: true
                }
            })
        } else {
            // Create new subscription
            await prisma.pushSubscription.create({
                data: {
                    userId: payload.userId,
                    endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription saved'
        })
    } catch (error) {
        console.error('Subscribe error:', error)
        return NextResponse.json(
            { error: 'Error saving subscription' },
            { status: 500 }
        )
    }
}

// Get VAPID public key
export async function GET() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!vapidPublicKey) {
        return NextResponse.json(
            { error: 'VAPID key not configured' },
            { status: 500 }
        )
    }

    return NextResponse.json({ publicKey: vapidPublicKey })
}
