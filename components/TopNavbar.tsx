'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Breadcrumb {
    label: string
    href?: string
}

interface UserInfo {
    name: string
    email: string
    photo?: string
    plan: string
}

interface TopNavbarProps {
    user?: UserInfo
}

export default function TopNavbar({ user }: TopNavbarProps) {
    const pathname = usePathname()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Fetch notifications
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const getBreadcrumbs = (): Breadcrumb[] => {
        const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard', href: '/dashboard' }]

        if (pathname === '/dashboard') return breadcrumbs

        if (pathname.startsWith('/scanner')) {
            breadcrumbs.push({ label: 'Escáner de Amenazas' })
        } else if (pathname.startsWith('/security')) {
            breadcrumbs.push({ label: 'Tu Nivel de Seguridad' })
        } else if (pathname.startsWith('/settings')) {
            breadcrumbs.push({ label: 'Configuración' })
        } else if (pathname.startsWith('/plans')) {
            breadcrumbs.push({ label: 'Planes y Suscripciones' })
        }

        return breadcrumbs
    }

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'basic': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            case 'professional': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            case 'enterprise': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    const getPlanLabel = (plan: string) => {
        switch (plan) {
            case 'basic': return 'Básico'
            case 'professional': return 'Profesional'
            case 'enterprise': return 'Empresarial'
            default: return 'Básico'
        }
    }

    const breadcrumbs = getBreadcrumbs()

    return (
        <div className="glass-panel border-b border-white/10 px-8 py-4 mb-6 relative z-50">
            <div className="flex items-center justify-between">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <span className="text-gray-500">/</span>}
                            {crumb.href ? (
                                <Link href={crumb.href} className="text-gray-400 hover:text-cyan-400 transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-white font-medium">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 glass-panel p-4 z-50 max-h-96 overflow-y-auto">
                                <h3 className="font-semibold mb-3">Notif icaciones</h3>
                                {notifications.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">No hay notificaciones</p>
                                ) : (
                                    <div className="space-y-2">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-3 rounded-lg ${notif.read ? 'bg-white/5' : 'bg-cyan-500/10 border border-cyan-500/20'}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{notif.title}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                                                        <span className="text-xs text-gray-500 mt-2 block">
                                                            {new Date(notif.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {!notif.read && (
                                                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPlanBadgeColor(user?.plan || 'basic')}`}>
                                    {getPlanLabel(user?.plan || 'basic')}
                                </span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Profile dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-64 glass-panel p-4 z-50">
                                <div className="mb-4 pb-4 border-b border-white/10">
                                    <p className="font-medium">{user?.name || 'Usuario'}</p>
                                    <p className="text-sm text-gray-400">{user?.email || 'usuario@email.com'}</p>
                                </div>
                                <nav className="space-y-1">
                                    <Link href="/settings" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Configuración</span>
                                    </Link>
                                    <Link href="/plans" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Planes</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token')
                                            localStorage.removeItem('user')
                                            window.location.href = '/login'
                                        }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
