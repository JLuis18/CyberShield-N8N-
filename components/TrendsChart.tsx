'use client'

import { useEffect, useRef, useState } from 'react'

interface TrendsData {
    labels: string[]
    totalThreats: number[]
    criticalThreats: number[]
}

export default function TrendsChart() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [data, setData] = useState<TrendsData>({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
        totalThreats: [0, 0, 0, 0, 0, 0, 0, 0],
        criticalThreats: [0, 0, 0, 0, 0, 0, 0, 0],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTrends()
    }, [])

    const fetchTrends = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/dashboard/trends', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const trendsData = await res.json()
                setData(trendsData)
            }
        } catch (error) {
            console.error('Error fetching trends:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || loading) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationProgress = 0

        const resize = () => {
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * window.devicePixelRatio
            canvas.height = rect.height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        const drawLine = (
            lineData: number[],
            maxValue: number,
            padding: number,
            chartHeight: number,
            stepX: number,
            color1: string,
            color2: string,
            width: number
        ) => {
            const points = lineData.map((value, i) => ({
                x: padding + stepX * i,
                y: padding + chartHeight - (value / maxValue) * chartHeight * animationProgress,
            }))

            // Fill gradient
            const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight)
            gradient.addColorStop(0, color1 + '40')
            gradient.addColorStop(1, color1 + '00')

            ctx.beginPath()
            ctx.moveTo(points[0].x, padding + chartHeight)
            points.forEach(point => ctx.lineTo(point.x, point.y))
            ctx.lineTo(points[points.length - 1].x, padding + chartHeight)
            ctx.closePath()
            ctx.fillStyle = gradient
            ctx.fill()

            // Draw line
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)

            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2
                const yc = (points[i].y + points[i + 1].y) / 2
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)

            ctx.shadowBlur = 15
            ctx.shadowColor = color1
            ctx.strokeStyle = color1
            ctx.lineWidth = 3
            ctx.stroke()
            ctx.shadowBlur = 0

            // Draw points
            points.forEach(point => {
                const pointGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 6)
                pointGradient.addColorStop(0, color1)
                pointGradient.addColorStop(1, color2)

                ctx.fillStyle = pointGradient
                ctx.beginPath()
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
                ctx.fill()

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
                ctx.lineWidth = 2
                ctx.stroke()
            })
        }

        const draw = () => {
            const rect = canvas.getBoundingClientRect()
            const width = rect.width
            const height = rect.height

            ctx.clearRect(0, 0, width, height)

            const padding = 40
            const chartWidth = width - padding * 2
            const chartHeight = height - padding * 2
            const maxValue = Math.max(...data.totalThreats, 1) // Avoid division by zero
            const stepX = chartWidth / (data.labels.length - 1)

            // Grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
            ctx.lineWidth = 1
            for (let i = 0; i <= 4; i++) {
                const y = padding + (chartHeight / 4) * i
                ctx.beginPath()
                ctx.moveTo(padding, y)
                ctx.lineTo(width - padding, y)
                ctx.stroke()
            }

            // Draw lines
            drawLine(data.totalThreats, maxValue, padding, chartHeight, stepX, '#00f0ff', '#0066ff', width)
            drawLine(data.criticalThreats, maxValue, padding, chartHeight, stepX, '#ff3366', '#ff0044', width)

            // Labels
            ctx.fillStyle = 'rgba(139, 146, 167, 0.8)'
            ctx.font = '12px Inter'
            ctx.textAlign = 'center'
            data.labels.forEach((label, i) => {
                const x = padding + stepX * i
                ctx.fillText(label, x, height - 15)
            })
        }

        const animate = () => {
            if (animationProgress < 1) {
                animationProgress += 0.02
                draw()
                requestAnimationFrame(animate)
            } else {
                draw()
            }
        }

        resize()
        animate()

        const handleResize = () => {
            resize()
            draw()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [data, loading])

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Tendencias de Amenazas</h3>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 10px #00f0ff' }}></div>
                        <span className="text-sm text-gray-400">Total amenazas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 10px #ff3366' }}></div>
                        <span className="text-sm text-gray-400">Amenazas críticas</span>
                    </div>
                </div>
            </div>
            {loading ? (
                <div className="w-full h-52 flex items-center justify-center text-gray-400">
                    Cargando tendencias...
                </div>
            ) : (
                <canvas ref={canvasRef} className="w-full h-52" />
            )}
        </div>
    )
}
