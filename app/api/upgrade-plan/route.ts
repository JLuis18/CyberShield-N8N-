import { NextRequest, NextResponse } from 'next/server'
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
        const { newPlan } = body

        // Validate plan
        const validPlans = ['basic', 'professional', 'enterprise']
        if (!validPlans.includes(newPlan)) {
            return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
        }

        // In a real app, you would:
        // 1. Process payment with Stripe/PayPal
        // 2. Update user record in database
        // 3. Send confirmation email
        // 4. Create invoice

        // For now, we'll just simulate success
        // The client will update localStorage

        return NextResponse.json({
            success: true,
            message: 'Plan actualizado exitosamente',
            newPlan,
            userId: payload.userId,
        })
    } catch (error) {
        console.error('Upgrade error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar plan' },
            { status: 500 }
        )
    }
}
