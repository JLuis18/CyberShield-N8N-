'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al crear la cuenta')
                setLoading(false)
                return
            }

            // Redirect to login
            router.push('/login?registered=true')
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

                <h2 className="text-2xl font-semibold text-center mb-2">Crear Cuenta</h2>
                <p className="text-center text-gray-400 mb-8">Únete a la plataforma de seguridad</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Nombre Completo
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="cyber-input w-full"
                            placeholder="Juan Pérez"
                        />
                    </div>

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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-400">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}
