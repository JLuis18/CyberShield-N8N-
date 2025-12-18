'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language } from '@/lib/translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof translations.es
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Load language from localStorage only on client
        const savedConfig = localStorage.getItem('userConfig')
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig)
                if (config.language && (config.language === 'es' || config.language === 'en')) {
                    setLanguageState(config.language)
                }
            } catch (error) {
                console.error('Error loading language:', error)
            }
        }
    }, [])

    const setLanguage = (newLang: Language) => {
        setLanguageState(newLang)

        // Update localStorage only if mounted (client-side)
        if (mounted) {
            const savedConfig = localStorage.getItem('userConfig')
            let config = { language: newLang, theme: 'dark', notifications: true }

            if (savedConfig) {
                try {
                    config = { ...JSON.parse(savedConfig), language: newLang }
                } catch (error) {
                    console.error('Error parsing config:', error)
                }
            }

            localStorage.setItem('userConfig', JSON.stringify(config))
        }
    }

    const t = translations[language]

    // Always render children to prevent hydration mismatch
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
