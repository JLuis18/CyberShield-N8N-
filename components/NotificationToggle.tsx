'use client'

import { useState, useEffect } from 'react'
import { subscribeToPush, saveSubscription, areNotificationsEnabled } from '@/lib/push-notifications'

export default function NotificationToggle() {
    const [enabled, setEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [supported, setSupported] = useState(true)

    useEffect(() => {
        checkNotificationStatus()
    }, [])

    const checkNotificationStatus = async () => {
        const isSupported = 'Notification' in window && 'serviceWorker' in navigator
        setSupported(isSupported)

        if (isSupported) {
            const isEnabled = await areNotificationsEnabled()
            setEnabled(isEnabled)
        }
    }

    const handleToggle = async () => {
        if (!supported) {
            alert('Las notificaciones no están soportadas en este navegador')
            return
        }

        setLoading(true)

        try {
            if (!enabled) {
                // Enable notifications
                const vapidRes = await fetch('/api/notifications/subscribe')
                const { publicKey } = await vapidRes.json()

                if (!publicKey) {
                    alert('Las notificaciones están configurándose. Agrega las VAPID keys en las variables de entorno.')
                    setLoading(false)
                    return
                }

                const subscription = await subscribeToPush(publicKey)

                if (subscription) {
                    const token = localStorage.getItem('token')
                    if (token) {
                        const saved = await saveSubscription(subscription, token)
                        if (saved) {
                            setEnabled(true)
                            alert('✅ Notificaciones activadas correctamente')
                        } else {
                            alert('Error al guardar la suscripción')
                        }
                    }
                } else {
                    alert('Por favor permite las notificaciones en tu navegador')
                }
            } else {
                // Disable notifications (for now just update state)
                setEnabled(false)
                alert('Notificaciones desactivadas')
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            alert('Error al cambiar configuración de notificaciones')
        } finally {
            setLoading(false)
        }
    }

    if (!supported) {
        return (
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4">Notificaciones Push</h3>
                <p className="text-gray-400 text-sm">
                    Tu navegador no soporta notificaciones push
                </p>
            </div>
        )
    }

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Notificaciones Push</h3>
            <p className="text-gray-400 text-sm mb-4">
                Recibe alertas instantáneas cuando se detecten amenazas de alto riesgo
            </p>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                    <p className="font-medium">Alertas de Amenazas</p>
                    <p className="text-sm text-gray-400">
                        {enabled ? 'Activas' : 'Inactivas'}
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'
                        } ${loading ? 'opacity-50' : ''}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {enabled && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-green-400 text-sm">
                        ✅ Recibirás notificaciones cuando se detecten amenazas HIGH
                    </p>
                </div>
            )}
        </div>
    )
}
