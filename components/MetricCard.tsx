'use client'

import { useEffect, useState } from 'react'

interface MetricCardProps {
    icon: React.ReactNode
    value: number
    label: string
    color: 'red' | 'blue' | 'purple'
}

const colorClasses = {
    red: 'from-red-500/20 to-red-600/10',
    blue: 'from-cyan-500/20 to-blue-600/10',
    purple: 'from-purple-500/20 to-purple-600/10',
}

export default function MetricCard({ icon, value, label, color }: MetricCardProps) {
    const [animatedValue, setAnimatedValue] = useState(0)

    useEffect(() => {
        let start = 0
        const duration = 2000
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 4)

            start = Math.floor(value * easeOut)
            setAnimatedValue(start)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }, [value])

    return (
        <div className="glass-panel p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold text-white mb-1">
                    {animatedValue}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                    {label}
                </div>
            </div>
        </div>
    )
}
