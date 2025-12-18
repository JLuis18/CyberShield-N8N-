'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { getPlanColor } from '@/lib/plans'

interface UpgradePromptProps {
    feature: string
    requiredPlan: 'professional' | 'enterprise'
}

export default function UpgradePrompt({ feature, requiredPlan }: UpgradePromptProps) {
    const { getUpgradeMessage } = usePlanFeatures()
    const color = getPlanColor(requiredPlan)

    return (
        <div className="glass-panel p-8 text-center border-2" style={{ borderColor: color + '40' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: color + '20' }}>
                <svg className="w-8 h-8" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            <h3 className="text-xl font-bold mb-2">Función Premium</h3>
            <p className="text-gray-400 mb-6">{getUpgradeMessage(feature)}</p>

            <Link href="/plans" className="cyber-button inline-block px-8 py-3">
                Ver Planes
            </Link>
        </div>
    )
}

interface UsageLimitProps {
    type: 'urlScans' | 'emailScans' | 'invoiceScans'
    label: string
}

export function UsageLimitBanner({ type, label }: UsageLimitProps) {
    const { getRemainingScansCount, plan } = usePlanFeatures()
    const remaining = getRemainingScansCount(type)

    // Don't show for unlimited
    if (remaining === Infinity) return null

    const percentage = (remaining / (plan?.limits[type] as number)) * 100
    const isLow = remaining <= 2

    return (
        <div className={`glass-panel p-4 mb-4 border-l-4 ${isLow ? 'border-orange-500' : 'border-cyan-500'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${isLow ? 'text-orange-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium">
                            {remaining} {label} restantes hoy
                        </p>
                        <p className="text-xs text-gray-400">Plan {plan?.displayName}</p>
                    </div>
                </div>

                {isLow && (
                    <Link href="/plans" className="text-sm px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors border border-orange-500/30">
                        Actualizar
                    </Link>
                )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${isLow ? 'bg-orange-500' : 'bg-cyan-500'} transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
