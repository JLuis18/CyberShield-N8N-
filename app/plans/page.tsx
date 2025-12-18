'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS, formatPrice, getPlanColor } from '@/lib/plans'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PlansPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [currentPlan, setCurrentPlan] = useState('basic')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const userData = JSON.parse(userStr)
            setUser(userData)
            setCurrentPlan(userData.currentPlan || 'basic')
        }
    }, [])

    const handleUpgrade = (planId: string) => {
        if (planId === currentPlan) return

        if (planId === 'basic') {
            if (confirm('¿Estás seguro que deseas cambiar al plan básico? Perderás acceso a funciones premium.')) {
                const userStr = localStorage.getItem('user')
                if (userStr) {
                    const user = JSON.parse(userStr)
                    user.currentPlan = 'basic'
                    localStorage.setItem('user', JSON.stringify(user))
                    setCurrentPlan('basic')
                    alert('Plan actualizado a Básico')
                }
            }
        } else {
            router.push(`/checkout?plan=${planId}`)
        }
    }

    const plans = [PLANS.basic, PLANS.professional, PLANS.enterprise]

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="glass-panel p-6 md:p-8 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold cyber-gradient mb-2">{t.plans.title}</h1>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-base md:text-lg">{t.plans.subtitle}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-cyan-500/50 text-sm md:text-base w-full sm:w-auto justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{t.common.backToDashboard}</span>
                    </button>
                </div>
            </div>

            {/* Current Plan Info */}
            {user && (
                <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8 border-l-4" style={{ borderLeftColor: getPlanColor(currentPlan) }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-400">{t.plans.currentPlan}</p>
                            <h2 className="text-2xl font-bold" style={{ color: getPlanColor(currentPlan) }}>
                                {PLANS[currentPlan].displayName}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{formatPrice(PLANS[currentPlan].price)}</p>
                            <p className="text-sm text-gray-400">por mes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
                {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlan
                    const isPopular = plan.popular

                    return (
                        <div
                            key={plan.id}
                            className={`glass-panel p-8 relative ${isCurrent ? 'ring-2' : ''} ${isPopular ? 'scale-105 shadow-2xl' : ''
                                }`}
                            style={{
                                ...(isCurrent && {
                                    '--tw-ring-color': getPlanColor(plan.id),
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderColor: getPlanColor(plan.id)
                                } as React.CSSProperties),
                                ...(isPopular && !isCurrent && {
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: getPlanColor(plan.id) + '80'
                                } as React.CSSProperties)
                            }}
                        >
                            {/* Popular Badge */}
                            {isPopular && (
                                <div
                                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold"
                                    style={{
                                        backgroundColor: getPlanColor(plan.id),
                                        color: '#0a0e1a'
                                    }}
                                >
                                    MÁS POPULAR
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrent && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                                    PLAN ACTUAL
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2" style={{ color: getPlanColor(plan.id) }}>
                                    {plan.displayName}
                                </h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                                    <span className="text-gray-400">/mes</span>
                                </div>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <svg
                                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                                            style={{ color: getPlanColor(plan.id) }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Action Button */}
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrent}
                                className={`w-full py-3 rounded-lg font-semibold transition-all ${isCurrent
                                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    : 'cyber-button'
                                    }`}
                                style={
                                    !isCurrent
                                        ? {
                                            background: `linear-gradient(135deg, ${getPlanColor(plan.id)}22, ${getPlanColor(plan.id)}44)`,
                                            borderColor: getPlanColor(plan.id)
                                        }
                                        : undefined
                                }
                            >
                                {isCurrent ? 'Plan Actual' : plan.price === 0 ? 'Plan Gratis' : 'Actualizar Plan'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="glass-panel p-8">
                <h2 className="text-2xl font-bold mb-6">Comparación Detallada</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4">Característica</th>
                                {plans.map((plan) => (
                                    <th key={plan.id} className="text-center py-4 px-4">
                                        <span style={{ color: getPlanColor(plan.id) }}>{plan.displayName}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Escaneos URL/día</td>
                                <td className="text-center py-4 px-4">10</td>
                                <td className="text-center py-4 px-4 text-cyan-400 font-bold">Ilimitado</td>
                                <td className="text-center py-4 px-4 text-purple-400 font-bold">Ilimitado</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Escaneos Email/día</td>
                                <td className="text-center py-4 px-4">10</td>
                                <td className="text-center py-4 px-4 text-cyan-400 font-bold">Ilimitado</td>
                                <td className="text-center py-4 px-4 text-purple-400 font-bold">Ilimitado</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Análisis IA</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-cyan-400">✓</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Reportes Avanzados</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-cyan-400">✓</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Monitoreo en Tiempo Real</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-cyan-400">✓</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Análisis de Tráfico</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Sandboxing de Archivos</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">API Access</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Integraciones</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-red-400">✗</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-cyan-400">✓ Básicas</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">✓ Completas</span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-4 text-gray-300">Soporte Prioritario</td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-gray-400">Email</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-cyan-400">Chat 24/7</span>
                                </td>
                                <td className="text-center py-4 px-4">
                                    <span className="text-purple-400">Dedicado 24/7</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="glass-panel p-8 mt-8">
                <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
                        <p className="text-gray-400">Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejan inmediatamente.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">¿Qué métodos de pago aceptan?</h3>
                        <p className="text-gray-400">Aceptamos tarjetas de crédito/débito Visa, Mastercard y American Express.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">¿Hay garantía de devolución?</h3>
                        <p className="text-gray-400">Ofrecemos una garantía de devolución de 30 días sin preguntas para todos los planes de pago.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
