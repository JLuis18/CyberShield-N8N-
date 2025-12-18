import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
// @ts-ignore - web-push doesn't have TypeScript definitions
import webpush from 'web-push'

// Mark this route as dynamic (not statically rendered)
export const dynamic = 'force-dynamic'


// Configure VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@cybershield.app',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export interface NotificationPayload {
    title: string
    body: string
    url?: string
    severity?: 'low' | 'medium' | 'high'
    threatId?: string
    tag?: string
}

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

        const body: NotificationPayload = await request.json()

        // Get all active subscriptions for user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                userId: payload.userId,
                isActive: true
            }
        })

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No active subscriptions'
            })
        }

        // Send notifications to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }

                try {
                    await webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify(body)
                    )
                    return { success: true }
                } catch (error: any) {
                    // If subscription is no longer valid, deactivate it
                    if (error.statusCode === 410) {
                        await prisma.pushSubscription.update({
                            where: { id: sub.id },
                            data: { isActive: false }
                        })
                    }
                    throw error
                }
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        return NextResponse.json({
            success: true,
            sent: successful,
            failed
        })
    } catch (error) {
        console.error('Send notification error:', error)
        return NextResponse.json(
            { error: 'Error sending notification' },
            { status: 500 }
        )
    }
}
