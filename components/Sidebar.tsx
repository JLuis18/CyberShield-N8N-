'use client'

// Force rebuild - ensure all 7 menu items are included
// Build timestamp: 2025-12-04 16:38

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            ),
        },
        {
            name: 'Escáner de Amenazas',
            path: '/scanner',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 7V10L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            name: 'Historial de Escaneos',
            path: '/history',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="5" r="1" fill="currentColor" />
                    <circle cx="8" cy="10" r="1" fill="currentColor" />
                    <circle cx="8" cy="15" r="1" fill="currentColor" />
                </svg>
            ),
        },
        {
            name: 'Reportes',
            path: '/reports',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4H17C17.5523 4 18 4.44772 18 5V15C18 15.5523 17.5523 16 17 16H3C2.44772 16 2 15.5523 2 15V5C2 4.44772 2.44772 4 3 4Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 8H14M6 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            name: 'Tu Nivel de Seguridad',
            path: '/security',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L4 5V10C4 14.5 10 17.5 10 17.5C10 17.5 16 14.5 16 10V5L10 2Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            name: 'Configuración',
            path: '/settings',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 1V4M10 16V19M19 10H16M4 10H1M16.5 3.5L14.5 5.5M5.5 14.5L3.5 16.5M16.5 16.5L14.5 14.5M5.5 5.5L3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            name: 'Planes y Suscripciones',
            path: '/plans',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M13 10V3L4 14H11V20L20 9H13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
    ]

    return (
        <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <svg className="w-10 h-10 animate-glow" viewBox="0 0 40 40" fill="none">
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
                    <span className="text-xl font-bold cyber-gradient">CyberShield</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-white/10 space-y-3">
                {user && (
                    <div className="px-4 py-2 bg-white/5 rounded-lg">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                )}

                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                        <path d="M13 13L17 10L13 7M17 10H7M11 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 max-w-sm w-full mx-4">
                        <h3 className="text-xl font-semibold mb-2">¿Cerrar sesión?</h3>
                        <p className="text-gray-400 mb-6">¿Estás seguro que deseas salir de tu cuenta?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
