'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Load theme from localStorage only on client
        const savedConfig = localStorage.getItem('userConfig')
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig)
                if (config.theme) {
                    setThemeState(config.theme)
                    document.documentElement.setAttribute('data-theme', config.theme)
                }
            } catch (error) {
                console.error('Error loading theme:', error)
            }
        } else {
            // Set default theme on first load
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }, [])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)

        // Update localStorage only if mounted (client-side)
        if (mounted) {
            const savedConfig = localStorage.getItem('userConfig')
            let config = { theme: newTheme, language: 'es', notifications: true }

            if (savedConfig) {
                try {
                    config = { ...JSON.parse(savedConfig), theme: newTheme }
                } catch (error) {
                    console.error('Error parsing config:', error)
                }
            }

            localStorage.setItem('userConfig', JSON.stringify(config))
        }
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // Always render children to prevent hydration mismatch
    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
