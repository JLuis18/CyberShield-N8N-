'use client'

import { useState, useEffect } from 'react'
import { PLANS, isPlanFeatureAvailable, getRemainingScans } from '@/lib/plans'

interface UsageStats {
    urlScans: number
    emailScans: number
    invoiceScans: number
    networkScans: number
    lastReset: string
}

export function usePlanFeatures() {
    const [userPlan, setUserPlan] = useState<string>('basic')
    const [usage, setUsage] = useState<UsageStats>({
        urlScans: 0,
        emailScans: 0,
        invoiceScans: 0,
        networkScans: 0,
        lastReset: new Date().toDateString()
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUserPlan()
        loadUsage()
    }, [])

    const loadUserPlan = () => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const user = JSON.parse(userStr)
            setUserPlan(user.currentPlan || 'basic')
        }
        setLoading(false)
    }

    const loadUsage = () => {
        const usageStr = localStorage.getItem('dailyUsage')
        if (usageStr) {
            const storedUsage = JSON.parse(usageStr)
            const today = new Date().toDateString()

            // Reset if it's a new day
            if (storedUsage.lastReset !== today) {
                const resetUsage = {
                    urlScans: 0,
                    emailScans: 0,
                    invoiceScans: 0,
                    networkScans: 0,
                    lastReset: today
                }
                localStorage.setItem('dailyUsage', JSON.stringify(resetUsage))
                setUsage(resetUsage)
            } else {
                setUsage(storedUsage)
            }
        } else {
            const today = new Date().toDateString()
            const newUsage = {
                urlScans: 0,
                emailScans: 0,
                invoiceScans: 0,
                networkScans: 0,
                lastReset: today
            }
            localStorage.setItem('dailyUsage', JSON.stringify(newUsage))
            setUsage(newUsage)
        }
    }

    const incrementUsage = (type: 'urlScans' | 'emailScans' | 'invoiceScans' | 'networkScans') => {
        setUsage(prev => {
            const updated = {
                ...prev,
                [type]: prev[type] + 1
            }
            localStorage.setItem('dailyUsage', JSON.stringify(updated))
            return updated
        })
    }

    const hasFeature = (feature: string): boolean => {
        return isPlanFeatureAvailable(userPlan, feature as any)
    }

    const canPerformScan = (type: 'urlScans' | 'emailScans' | 'invoiceScans' | 'networkScans'): boolean => {
        const plan = PLANS[userPlan]
        if (!plan) return false

        const limit = plan.limits[type] as number
        if (limit === -1) return true // Unlimited

        return usage[type] < limit
    }

    const getRemainingScansCount = (type: 'urlScans' | 'emailScans' | 'invoiceScans' | 'networkScans'): number => {
        return getRemainingScans(userPlan, type, usage[type])
    }

    const getUpgradeMessage = (feature: string): string => {
        if (userPlan === 'basic') {
            return 'Actualiza a Plan Profesional para acceder a esta función'
        } else if (userPlan === 'professional') {
            return 'Disponible solo en Plan Empresarial'
        }
        return ''
    }

    return {
        userPlan,
        plan: PLANS[userPlan],
        usage,
        loading,
        hasFeature,
        canPerformScan,
        incrementUsage,
        getRemainingScansCount,
        getUpgradeMessage
    }
}
