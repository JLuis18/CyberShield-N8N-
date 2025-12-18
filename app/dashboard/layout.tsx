'use client'

import { useEffect, useState } from 'react'
import ParticleBackground from '@/components/ParticleBackground'
import Sidebar from '@/components/Sidebar'
import TopNavbar from '@/components/TopNavbar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const userData = JSON.parse(userStr)
            setUser({
                name: userData.name || 'Usuario',
                email: userData.email || '',
                plan: userData.currentPlan || 'basic'
            })
        }
    }, [])

    return (
        <div className="flex min-h-screen relative">
            <ParticleBackground />
            <Sidebar />
            <main className="flex-1 relative z-10">
                <TopNavbar user={user} />
                {children}
            </main>
        </div>
    )
}
