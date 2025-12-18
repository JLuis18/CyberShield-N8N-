'use client'

import { useEffect, useState } from 'react'

interface SecurityScoreData {
    score: number
    distribution: {
        low: number
        medium: number
        high: number
    }
    threatCount: number
    safeScanCount: number
}

export default function SecurityScore() {
    const [data, setData] = useState<SecurityScoreData>({
        score: 100,
        distribution: { low: 70, medium: 20, high: 10 },
        threatCount: 0,
        safeScanCount: 0
    })
    const [animatedScore, setAnimatedScore] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSecurityScore()
    }, [])

    const fetchSecurityScore = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/dashboard/security-score', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const scoreData = await res.json()
                setData(scoreData)
            }
        } catch (error) {
            console.error('Error fetching security score:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let start = 0
        const duration = 2000
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 4)

            start = Math.floor(data.score * easeOut)
            setAnimatedScore(start)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }, [data.score])

    // Calculate circle segments based on real distribution
    const { low, medium, high } = data.distribution
    const circumference = 2 * Math.PI * 80 // radius = 80

    const lowDash = (low / 100) * circumference
    const mediumDash = (medium / 100) * circumference
    const highDash = (high / 100) * circumference

    return (
        <div className="glass-panel h-full p-8 flex items-center justify-center">
            <div className="relative w-72 h-72">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00ff88" />
                            <stop offset="100%" stopColor="#00cc88" />
                        </linearGradient>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f0ff" />
                            <stop offset="100%" stopColor="#0066ff" />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff3366" />
                            <stop offset="100%" stopColor="#ff0044" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="20"
                    />

                    {/* Green segment (low severity) */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="url(#greenGradient)"
                        strokeWidth="20"
                        strokeDasharray={`${lowDash} ${circumference - lowDash}`}
                        strokeDashoffset="0"
                        filter="url(#glow)"
                        className="transition-all duration-1000"
                    />

                    {/* Blue segment (medium severity) */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="url(#blueGradient)"
                        strokeWidth="20"
                        strokeDasharray={`${mediumDash} ${circumference - mediumDash}`}
                        strokeDashoffset={`-${lowDash}`}
                        filter="url(#glow)"
                        className="transition-all duration-1000"
                    />

                    {/* Red segment (high severity) */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="url(#redGradient)"
                        strokeWidth="20"
                        strokeDasharray={`${highDash} ${circumference - highDash}`}
                        strokeDashoffset={`-${lowDash + mediumDash}`}
                        filter="url(#glow)"
                        className="transition-all duration-1000"
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold cyber-gradient" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))' }}>
                        {loading ? '...' : animatedScore}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 mt-2 text-center leading-tight">
                        PUNTOS DE<br />SEGURIDAD
                    </div>
                    {!loading && data.threatCount > 0 && (
                        <div className="text-xs text-red-400 mt-2">
                            {data.threatCount} amenazas detectadas
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
