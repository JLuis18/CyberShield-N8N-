'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión')
                setLoading(false)
                return
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Redirect to dashboard using window.location for better compatibility
            window.location.href = '/dashboard'
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <ParticleBackground />

            <div className="glass-panel w-full max-w-md p-8 relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <svg className="w-12 h-12 animate-glow" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2L8 8V18C8 27 20 34 20 34C20 34 32 27 32 18V8L20 2Z" stroke="url(#logoGradient)" strokeWidth="2" fill="url(#logoGradient)" fillOpacity="0.1" />
                        <path d="M20 12L15 15V20C15 23.5 20 26 20 26C20 26 25 23.5 25 20V15L20 12Z" fill="url(#logoGradient2)" />
                        <defs>
                            <linearGradient id="logoGradient" x1="8" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#00f0ff" />
                                <stop offset="1" stopColor="#0066ff" />
                            </linearGradient>
                            <linearGradient id="logoGradient2" x1="15" y1="12" x2="25" y2="26" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#00f0ff" />
                                <stop offset="1" stopColor="#0066ff" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <h1 className="text-3xl font-bold cyber-gradient">CyberShield</h1>
                </div>

                <h2 className="text-2xl font-semibold text-center mb-2">Iniciar Sesión</h2>
                <p className="text-center text-gray-400 mb-8">Accede a tu panel de seguridad</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="cyber-input w-full"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="cyber-input w-full"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cyber-button w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                        Crear una
                    </Link>
                </p>
            </div>
        </div>
    )
}
