import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.reportSchedule.deleteMany();
    await prisma.report.deleteMany();
    await prisma.pushSubscription.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.usageLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.userConfig.deleteMany();
    await prisma.securityHistory.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.email.deleteMany();
    await prisma.threat.deleteMany();
    await prisma.user.deleteMany();

    // Create Plans
    console.log('Creating plans...');
    const basicPlan = await prisma.plan.create({
        data: {
            name: 'basic',
            displayName: 'Plan Básico',
            price: 0,
            features: JSON.stringify([
                'Escaneo de URLs',
                'Análisis básico de amenazas',
                'Historial limitado (30 días)',
                'Soporte por email'
            ]),
            limits: JSON.stringify({
                scansPerDay: 100,
                historyDays: 30,
                apiCallsPerDay: 50
            }),
            isActive: true
        }
    });

    const professionalPlan = await prisma.plan.create({
        data: {
            name: 'professional',
            displayName: 'Plan Profesional',
            price: 29.99,
            features: JSON.stringify([
                'Todo en Plan Básico',
                'Análisis de emails',
                'Validación de facturas',
                'Historial completo (1 año)',
                'API REST completa',
                'Notificaciones push',
                'Reportes semanales',
                'Soporte prioritario'
            ]),
            limits: JSON.stringify({
                scansPerDay: 1000,
                historyDays: 365,
                apiCallsPerDay: 500
            }),
            isActive: true
        }
    });

    const enterprisePlan = await prisma.plan.create({
        data: {
            name: 'enterprise',
            displayName: 'Plan Empresarial',
            price: 99.99,
            features: JSON.stringify([
                'Todo en Plan Profesional',
                'Análisis de tráfico de red',
                'Gestión de equipos',
                'Reportes personalizados',
                'Integración con SIEM',
                'Auditoría completa',
                'SLA garantizado',
                'Soporte 24/7',
                'Consultoría de seguridad'
            ]),
            limits: JSON.stringify({
                scansPerDay: -1, // unlimited
                historyDays: -1, // unlimited
                apiCallsPerDay: -1 // unlimited
            }),
            isActive: true
        }
    });

    console.log(`✓ Plans created: ${basicPlan.name}, ${professionalPlan.name}, ${enterprisePlan.name}`);

    // Create test user
    console.log('Creating test user...');
    const testUser = await prisma.user.create({
        data: {
            name: 'Demo User',
            email: 'demo@cybershield.com',
            password: '$2a$10$YourHashedPasswordHere', // In production, use proper bcrypt hashing
            role: 'user',
            currentPlan: 'professional',
            config: {
                create: {
                    theme: 'dark',
                    language: 'es',
                    notifications: true
                }
            }
        }
    });

    // Create subscription for test user
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.subscription.create({
        data: {
            userId: testUser.id,
            planId: professionalPlan.id,
            status: 'active',
            startDate: new Date(),
            endDate: nextMonth,
            autoRenew: true
        }
    });

    console.log(`✓ Test user created: ${testUser.email}`);

    // Create sample security history
    console.log('Creating security history...');
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    for (const date of dates) {
        await prisma.securityHistory.create({
            data: {
                userId: testUser.id,
                score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
                date
            }
        });
    }

    // Create sample threats
    console.log('Creating sample threats...');
    await prisma.threat.createMany({
        data: [
            {
                userId: testUser.id,
                type: 'phishing',
                origin: 'suspicious-site.com',
                description: 'Sitio de phishing detectado intentando robar credenciales',
                severity: 'high',
                status: 'blocked'
            },
            {
                userId: testUser.id,
                type: 'malware',
                origin: 'malicious-download.net',
                description: 'Descarga de malware bloqueada',
                severity: 'critical',
                status: 'blocked'
            },
            {
                userId: testUser.id,
                type: 'suspicious_url',
                origin: 'fake-bank.com',
                description: 'URL sospechosa detectada',
                severity: 'medium',
                status: 'quarantine'
            }
        ]
    });

    // Create sample notifications
    console.log('Creating sample notifications...');
    await prisma.notification.createMany({
        data: [
            {
                userId: testUser.id,
                type: 'threat',
                title: 'Amenaza bloqueada',
                message: 'Se bloqueó un sitio de phishing',
                severity: 'high',
                read: false
            },
            {
                userId: testUser.id,
                type: 'security',
                title: 'Escaneo completado',
                message: 'Se completó el escaneo de seguridad diario',
                severity: 'info',
                read: true
            }
        ]
    });

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
