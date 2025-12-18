import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CyberShield - Enterprise Security Platform',
    description: 'Advanced cybersecurity monitoring and threat detection platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <LanguageProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </LanguageProvider>
            </body>
        </html>
    )
}
