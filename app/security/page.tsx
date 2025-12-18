'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SecurityPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [score, setScore] = useState(90)
    const [threats, setThreats] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSecurityData()
    }, [])

    const fetchSecurityData = async () => {
        try {
            const token = localStorage.getItem('token')

            const scoreRes = await fetch('/api/security-score', {
                headers: { 'Authorization': `Bearer ${token}` },
            })

            const threatsRes = await fetch('/api/threats', {
                headers: { 'Authorization': `Bearer ${token}` },
            })

            if (scoreRes.ok) {
                const scoreData = await scoreRes.json()
                setScore(scoreData.currentScore)
                setHistory(scoreData.history || [])
            }

            if (threatsRes.ok) {
                const threatsData = await threatsRes.json()
                setThreats(threatsData.threats || [])
            }
        } catch (error) {
            console.error('Error fetching security data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
            quarantine: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            monitoring: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        }
        return styles[status as keyof typeof styles] || styles.pending
    }

    const getSeverityBadge = (severity: string) => {
        const styles = {
            critical: 'bg-red-600',
            high: 'bg-red-500',
            medium: 'bg-yellow-500',
            low: 'bg-green-500',
        }
        return styles[severity as keyof typeof styles] || styles.low
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient mb-2">{t.security.title}</h1>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>{t.security.subtitle}</p>
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

            {/* Security Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="glass-panel p-8 text-center">
                    <div className="text-6xl font-bold cyber-gradient mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))' }}>
                        {score}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">PUNTUACIÓN ACTUAL</p>
                </div>

                <div className="glass-panel p-8 text-center">
                    <div className="text-6xl font-bold text-red-400 mb-4">
                        {threats.filter(t => t.severity === 'high' || t.severity === 'critical').length}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">AMENAZAS CRÍTICAS</p>
                </div>

                <div className="glass-panel p-8 text-center">
                    <div className="text-6xl font-bold text-green-400 mb-4">
                        {threats.filter(t => t.status === 'blocked').length}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">AMENAZAS BLOQUEADAS</p>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Recomendaciones de IA</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium text-white">Activar autenticación de dos factores</p>
                            <p className="text-sm text-gray-400 mt-1">Mejora la seguridad de tu cuenta en un 95%</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium text-white">Actualizar contraseñas débiles</p>
                            <p className="text-sm text-gray-400 mt-1">3 cuentas detectadas con contraseñas de bajo nivel</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium text-white">Revisar conexiones sospechosas</p>
                            <p className="text-sm text-gray-400 mt-1">5 direcciones IP desconocidas detectadas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threats Table */}
            <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold mb-4">Amenazas Detectadas</h3>

                {loading ? (
                    <p className="text-center text-gray-400 py-8">Cargando...</p>
                ) : threats.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No hay amenazas detectadas</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tipo</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Origen</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Severidad</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {threats.map((threat) => (
                                    <tr key={threat.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 text-sm text-gray-300">
                                            {new Date(threat.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-300">{threat.type}</td>
                                        <td className="py-3 px-4 text-sm text-gray-300 max-w-xs truncate">{threat.origin}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getSeverityBadge(threat.severity)}`}></div>
                                                <span className="text-sm text-gray-300 capitalize">{threat.severity}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(threat.status)}`}>
                                                {threat.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-400 max-w-md truncate">{threat.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
