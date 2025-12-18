'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PLANS, getPlanColor } from '@/lib/plans'

function CheckoutSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || 'professional'
    const plan = PLANS[planId]

    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push('/dashboard')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    if (!plan) return null

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="glass-panel p-12 text-center">
                    {/* Checkmark Icon */}
                    <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500">
                        <svg className="w-12 h-12 text-green-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Tu suscripción a <span style={{ color: getPlanColor(planId) }} className="font-bold">{plan.displayName}</span> ha sido activada
                    </p>

                    {/* Features Unlocked */}
                    <div className="glass-panel p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-cyan-400">✨ Nuevas Funciones Desbloqueadas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                            {plan.features.slice(0, 6).map((feature, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email Confirmation */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Se ha enviado un recibo a tu correo electrónico</span>
                    </div>

                    {/* Redirect Info */}
                    <p className="text-gray-400 mb-4">
                        Serás redirigido al dashboard en <span className="text-cyan-400 font-bold text-2xl">{countdown}</span> segundos
                    </p>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="cyber-button px-8 py-3"
                    >
                        Ir al Dashboard Ahora
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="p-8">Cargando...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    )
}
