// Plan configuration for CyberShield subscription tiers

export interface PlanLimits {
    urlScans: number // -1 = unlimited
    emailScans: number
    invoiceScans: number
    networkScans: number
    trafficAnalysis: boolean
    aiAnalysis: boolean
    advancedReports: boolean
    realTimeMonitoring: boolean
    networkAnalysis: boolean
    sandboxing: boolean
    apiAccess: boolean
    integrations: number
    teamMembers: number
}

export interface PlanConfig {
    id: string
    name: string
    displayName: string
    price: number
    billingPeriod: 'monthly' | 'yearly'
    popular?: boolean
    features: string[]
    limits: PlanLimits
    color: string
}

export const PLANS: Record<string, PlanConfig> = {
    basic: {
        id: 'basic',
        name: 'basic',
        displayName: 'Plan Básico',
        price: 0,
        billingPeriod: 'monthly',
        color: '#6b7280',
        features: [
            'Escaneo manual de amenazas',
            'Análisis limitado de correos (10/día)',
            'Análisis de URLs (10/día)',
            'Facturas ilimitadas',
            'Alertas básicas',
            'Dashboard básico',
            'Soporte por email'
        ],
        limits: {
            urlScans: 10,
            emailScans: 10,
            invoiceScans: -1,
            networkScans: 5,
            trafficAnalysis: false,
            aiAnalysis: false,
            advancedReports: false,
            realTimeMonitoring: false,
            networkAnalysis: false,
            sandboxing: false,
            apiAccess: false,
            integrations: 0,
            teamMembers: 1
        }
    },

    professional: {
        id: 'professional',
        name: 'professional',
        displayName: 'Plan Profesional',
        price: 60.00,
        billingPeriod: 'monthly',
        popular: true,
        color: '#00f0ff',
        features: [
            'Todo del Plan Básico',
            'Escaneos ilimitados',
            'Análisis IA avanzado',
            'Reportes detallados en PDF',
            'Priorización automática de amenazas',
            'Historial completo de seguridad',
            'Integraciones básicas (2)',
            'Alertas en tiempo real',
            'Hasta 5 miembros del equipo',
            'Soporte prioritario'
        ],
        limits: {
            urlScans: -1,
            emailScans: -1,
            invoiceScans: -1,
            networkScans: -1,
            trafficAnalysis: false,
            aiAnalysis: true,
            advancedReports: true,
            realTimeMonitoring: true,
            networkAnalysis: false,
            sandboxing: false,
            apiAccess: false,
            integrations: 2,
            teamMembers: 5
        }
    },

    enterprise: {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Plan Empresarial',
        price: 120.00,
        billingPeriod: 'monthly',
        color: '#a855f7',
        features: [
            'Todo del Plan Profesional',
            'Monitoreo 24/7 en tiempo real',
            'Machine Learning predictivo',
            'Sandboxing de archivos',
            'Análisis de comportamiento de red',
            'Análisis de tráfico avanzado',
            'Métricas completas SOC',
            'Resumen ejecutivo personalizado',
            'API completa sin restricciones',
            'Integraciones ilimitadas',
            'Equipo ilimitado',
            'Soporte dedicado 24/7',
            'Gerente de cuenta asignado',
            'SLA garantizado'
        ],
        limits: {
            urlScans: -1,
            emailScans: -1,
            invoiceScans: -1,
            networkScans: -1,
            trafficAnalysis: true,
            aiAnalysis: true,
            advancedReports: true,
            realTimeMonitoring: true,
            networkAnalysis: true,
            sandboxing: true,
            apiAccess: true,
            integrations: -1,
            teamMembers: -1
        }
    }
}

export const getPlanById = (planId: string): PlanConfig | undefined => {
    return PLANS[planId]
}

export const isPlanFeatureAvailable = (
    userPlan: string,
    feature: keyof PlanLimits
): boolean => {
    const plan = PLANS[userPlan]
    if (!plan) return false

    const limit = plan.limits[feature]
    return typeof limit === 'boolean' ? limit : limit !== 0
}

export const getRemainingScans = (
    userPlan: string,
    scanType: 'urlScans' | 'emailScans' | 'invoiceScans' | 'networkScans',
    usedToday: number
): number => {
    const plan = PLANS[userPlan]
    if (!plan) return 0

    const limit = plan.limits[scanType] as number
    if (limit === -1) return Infinity

    return Math.max(0, limit - usedToday)
}

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(price)
}

export const getPlanColor = (planId: string): string => {
    return PLANS[planId]?.color || '#6b7280'
}
