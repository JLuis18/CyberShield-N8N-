'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PLANS, formatPrice, getPlanColor } from '@/lib/plans'

function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || 'professional'

    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        email: '',
    })

    const plan = PLANS[planId]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value
            setFormData({ ...formData, [name]: formatted })
        }
        // Format expiry date
        else if (name === 'expiryDate') {
            const formatted = value.replace(/\D/g, '').substring(0, 4)
            const withSlash = formatted.length >= 3 ? `${formatted.slice(0, 2)}/${formatted.slice(2)}` : formatted
            setFormData({ ...formData, [name]: withSlash })
        }
        // Limit CVV to 3 digits
        else if (name === 'cvv') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').substring(0, 3) })
        }
        else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        // Simulate payment processing
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/upgrade-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ newPlan: planId }),
                })

                if (res.ok) {
                    const data = await res.json()

                    // Update user in localStorage
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                        const user = JSON.parse(userStr)
                        user.currentPlan = planId
                        localStorage.setItem('user', JSON.stringify(user))
                    }

                    // Redirect to success page
                    router.push(`/checkout/success?plan=${planId}`)
                } else {
                    alert('Error al procesar el pago')
                    setProcessing(false)
                }
            } catch (error) {
                alert('Error de conexión')
                setProcessing(false)
            }
        }, 2000)
    }

    if (!plan) {
        return <div className="p-8">Plan no encontrado</div>
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="glass-panel p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold cyber-gradient mb-2">Checkout</h1>
                        <p className="text-gray-400">Completa tu compra de forma segura</p>
                    </div>
                    <button
                        onClick={() => router.push('/plans')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Volver</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="glass-panel p-8">
                        <h2 className="text-2xl font-bold mb-6">Información de Pago</h2>

                        <div className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Número de Tarjeta</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={19}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors font-mono"
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>

                            {/* Card Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre en la Tarjeta</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={formData.cardName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                                    placeholder="JUAN PEREZ"
                                />
                            </div>

                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Fecha de Expiración</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors font-mono"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors font-mono"
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="flex items-start gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-cyan-300">Pago 100% Seguro</p>
                                    <p className="text-xs text-gray-400 mt-1">Tus datos están protegidos con encriptación SSL de 256 bits</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Procesando pago...
                                    </span>
                                ) : (
                                    `Pagar ${formatPrice(plan.price)}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 sticky top-8">
                        <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>

                        {/* Plan Info */}
                        <div className="p-4 bg-white/5 rounded-lg mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium" style={{ color: getPlanColor(planId) }}>
                                    {plan.displayName}
                                </span>
                                <span className="text-sm text-gray-400">Mensual</span>
                            </div>
                            <p className="text-3xl font-bold">{formatPrice(plan.price)}</p>
                            <p className="text-xs text-gray-400 mt-1">por mes</p>
                        </div>

                        {/* Features Included */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-400 mb-3">Incluye:</p>
                            <ul className="space-y-2">
                                {plan.features.slice(0, 5).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: getPlanColor(planId) }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                                {plan.features.length > 5 && (
                                    <li className="text-sm text-cyan-400">+{plan.features.length - 5} más...</li>
                                )}
                            </ul>
                        </div>

                        {/* Total */}
                        <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{formatPrice(plan.price)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">IVA (18%)</span>
                                <span>{formatPrice(plan.price * 0.18)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xl font-bold pt-4 border-t border-white/10">
                                <span>Total</span>
                                <span style={{ color: getPlanColor(planId) }}>{formatPrice(plan.price * 1.18)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-8">Cargando...</div>}>
            <CheckoutContent />
        </Suspense>
    )
}
