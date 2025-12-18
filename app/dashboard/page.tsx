'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SecurityScore from '@/components/SecurityScore'
import TrendsChart from '@/components/TrendsChart'
import MetricCard from '@/components/MetricCard'
import ActionCard from '@/components/ActionCard'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [metrics, setMetrics] = useState({
        threatsBlocked: 0,
        emailsAnalyzed: 0,
        connectionsAnalyzed: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMetrics()
    }, [])

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/dashboard/metrics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const data = await res.json()
                setMetrics(data)
            }
        } catch (error) {
            console.error('Error fetching metrics:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Welcome Card */}
            <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold cyber-gradient mb-2">{t.dashboard.welcome}</h1>
                <p className="text-sm md:text-base text-gray-400">{t.dashboard.subtitle}</p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Security Score - Full height on left */}
                <div className="lg:col-span-1 lg:row-span-2">
                    <SecurityScore />
                </div>

                {/* Metrics Panel */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L4 6V12C4 17 12 21 12 21C12 21 20 17 20 12V6L12 2Z" stroke="#ff3366" strokeWidth="2" />
                                <path d="M9 12L11 14L15 10" stroke="#ff3366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        value={loading ? 0 : metrics.threatsBlocked}
                        label={t.dashboard.threatsBlocked}
                        color="red"
                    />
                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#00f0ff" strokeWidth="2" />
                                <path d="M3 9L12 14L21 9" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        value={loading ? 0 : metrics.emailsAnalyzed}
                        label={t.dashboard.emailsAnalyzed}
                        color="blue"
                    />
                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="#a855f7" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" fill="#a855f7" />
                                <path d="M12 3V6M12 18V21M21 12H18M6 12H3" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        }
                        value={loading ? 0 : metrics.connectionsAnalyzed}
                        label={t.dashboard.connectionsAnalyzed}
                        color="purple"
                    />
                </div>

                {/* Trends Chart */}
                <div className="lg:col-span-2">
                    <TrendsChart />
                </div>

                {/* Action Cards - Now horizontal */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <ActionCard
                        icon={
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="12" stroke="url(#blueGradient)" strokeWidth="2" />
                                <path d="M16 10V16L20 18" stroke="url(#blueGradient)" strokeWidth="2" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="blueGradient" x1="0" y1="0" x2="32" y2="32">
                                        <stop stopColor="#00f0ff" />
                                        <stop offset="1" stopColor="#0066ff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        }
                        title={t.dashboard.actions.analyzeLink}
                        description={t.dashboard.actions.analyzeLinkDesc}
                        onAction={() => router.push('/scanner?type=url')}
                    />

                    <ActionCard
                        icon={
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <rect x="8" y="6" width="16" height="20" rx="2" stroke="#a855f7" strokeWidth="2" />
                                <path d="M12 12H20M12 16H20M12 20H16" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        }
                        title={t.dashboard.actions.verifyEmail}
                        description={t.dashboard.actions.verifyEmailDesc}
                        onAction={() => router.push('/scanner?type=email')}
                    />

                    <ActionCard
                        icon={
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path d="M10 8L16 4L22 8V16C22 20 16 23 16 23C16 23 10 20 10 16V8Z" stroke="#ff3366" strokeWidth="2" />
                                <circle cx="16" cy="14" r="2" fill="#ff3366" />
                            </svg>
                        }
                        title={t.dashboard.actions.analyzeInvoice}
                        description={t.dashboard.actions.analyzeInvoiceDesc}
                        onAction={() => router.push('/scanner?type=invoice')}
                    />

                    <ActionCard
                        icon={
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="10" stroke="#10b981" strokeWidth="2" />
                                <circle cx="16" cy="16" r="3" fill="#10b981" />
                                <path d="M16 6V10M16 22V26M26 16H22M10 16H6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="8" cy="8" r="2" fill="#10b981" opacity="0.5" />
                                <circle cx="24" cy="8" r="2" fill="#10b981" opacity="0.5" />
                                <circle cx="8" cy="24" r="2" fill="#10b981" opacity="0.5" />
                                <circle cx="24" cy="24" r="2" fill="#10b981" opacity="0.5" />
                            </svg>
                        }
                        title="Analizar Conexión"
                        description="Verificar seguridad de IPs y puertos"
                        onAction={() => router.push('/scanner?type=network')}
                    />
                </div>
            </div>
        </div>
    )
}
