'use client'

import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        const particles: Particle[] = []
        const particleCount = 80
        const maxDistance = 150

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            radius: number

            constructor(width: number, height: number) {
                this.x = Math.random() * width
                this.y = Math.random() * height
                this.vx = (Math.random() - 0.5) * 0.5
                this.vy = (Math.random() - 0.5) * 0.5
                this.radius = Math.random() * 2 + 1
            }

            update(width: number, height: number) {
                this.x += this.vx
                this.y += this.vy

                if (this.x < 0 || this.x > width) this.vx *= -1
                if (this.y < 0 || this.y > height) this.vy *= -1
            }

            draw(ctx: CanvasRenderingContext2D) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius * 3
                )
                gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)')
                gradient.addColorStop(0.5, 'rgba(0, 102, 255, 0.4)')
                gradient.addColorStop(1, 'rgba(0, 102, 255, 0)')

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const init = () => {
            particles.length = 0
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height))
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, i) => {
                particle.update(canvas.width, canvas.height)
                particle.draw(ctx)

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = particle.x - p2.x
                    const dy = particle.y - p2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.3
                        const gradient = ctx.createLinearGradient(
                            particle.x, particle.y, p2.x, p2.y
                        )
                        gradient.addColorStop(0, `rgba(0, 240, 255, ${opacity})`)
                        gradient.addColorStop(1, `rgba(168, 85, 247, ${opacity})`)

                        ctx.strokeStyle = gradient
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        resize()
        init()
        animate()

        window.addEventListener('resize', () => {
            resize()
            init()
        })

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-60"
            style={{ zIndex: 0 }}
        />
    )
}
