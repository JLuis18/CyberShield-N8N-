'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import NotificationToggle from '@/components/NotificationToggle'

export default function SettingsPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()
    const [config, setConfig] = useState({
        theme: theme,
        language: language,
        notifications: true,
    })
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    // Update config when theme or language changes from context
    useEffect(() => {
        setConfig(prev => ({ ...prev, theme, language }))
    }, [theme, language])

    const handleSave = () => {
        setSaving(true)
        setMessage('')

        try {
            localStorage.setItem('userConfig', JSON.stringify(config))

            setTimeout(() => {
                setMessage(t.settings.saved)
                setSaving(false)

                setTimeout(() => setMessage(''), 3000)
            }, 500)
        } catch (error) {
            setMessage(t.settings.error)
            setSaving(false)
        }
    }

    useEffect(() => {
        const savedConfig = localStorage.getItem('userConfig')
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig)
                setConfig(parsed)
            } catch (error) {
                console.error('Error loading config:', error)
            }
        }
    }, [])

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            <div className="glass-panel p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold cyber-gradient mb-2">{t.settings.title}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{t.settings.subtitle}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-cyan-500/50"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{t.common.backToDashboard}</span>
                    </button>
                </div>
            </div>

            {message && (
                <div className={`glass-panel p-4 mb-6 ${message.includes('Error') || message.includes('✗') ? 'border-red-500' : 'border-green-500'}`}>
                    <p className={message.includes('Error') || message.includes('✗') ? 'text-red-400' : 'text-green-400'}>{message}</p>
                </div>
            )}

            <div className="space-y-6">
                {/* Language Settings */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">{t.settings.language}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                            <input
                                type="radio"
                                name="language"
                                value="es"
                                checked={config.language === 'es'}
                                onChange={(e) => {
                                    setConfig({ ...config, language: e.target.value as 'es' | 'en' })
                                    setLanguage('es')
                                }}
                                className="w-4 h-4 text-cyan-400"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>Español</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                            <input
                                type="radio"
                                name="language"
                                value="en"
                                checked={config.language === 'en'}
                                onChange={(e) => {
                                    setConfig({ ...config, language: e.target.value as 'es' | 'en' })
                                    setLanguage('en')
                                }}
                                className="w-4 h-4 text-cyan-400"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>English</span>
                        </label>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">{t.settings.theme}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={config.theme === 'dark'}
                                onChange={(e) => {
                                    setConfig({ ...config, theme: e.target.value as 'dark' | 'light' })
                                    setTheme('dark')
                                }}
                                className="w-4 h-4 text-cyan-400"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{t.settings.darkTheme}</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={config.theme === 'light'}
                                onChange={(e) => {
                                    setConfig({ ...config, theme: e.target.value as 'dark' | 'light' })
                                    setTheme('light')
                                }}
                                className="w-4 h-4 text-cyan-400"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{t.settings.lightTheme}</span>
                        </label>
                    </div>
                </div>

                {/* Notification Settings */}
                <NotificationToggle />

                {/* API Keys Section */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="mb-4 text-sm">
                        Genera claves de API para integrar CyberShield con tus aplicaciones externas
                    </p>
                    <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-sm text-green-400">✅ Disponible ahora - Integra con tus sistemas</p>
                    </div>
                    <button
                        className="cyber-button px-6 py-3"
                        onClick={() => router.push('/settings/api-keys')}
                    >
                        Gestionar API Keys
                    </button>
                </div>

                {/* External Integrations */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">{t.settings.integrations}</h3>
                    <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <p className="text-sm text-cyan-400">{t.settings.comingSoon} Conecta CyberShield con tu suite de productividad</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Microsoft 365</p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monitoreo de correos y documentos</p>
                            </div>
                            <button
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                                onClick={() => alert('Próximamente: Conecta tu cuenta de Microsoft 365 para análisis automático de amenazas en emails.')}
                            >
                                {t.settings.connect}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Google Workspace</p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Protección de Gmail y Drive</p>
                            </div>
                            <button
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                                onClick={() => alert('Próximamente: Conecta Google Workspace para escaneo automático de archivos y emails.')}
                            >
                                {t.settings.connect}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="cyber-button w-full py-4 text-lg disabled:opacity-50"
                >
                    {saving ? t.settings.saving : t.settings.saveConfig}
                </button>
            </div>
        </div>
    )
}
