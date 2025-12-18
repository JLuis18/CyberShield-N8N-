// Script to clear all users from database (for testing)
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearUsers() {
    try {
        // Delete in correct order to avoid foreign key constraints
        await prisma.pushSubscription.deleteMany({})
        await prisma.reportSchedule.deleteMany({})
        await prisma.report.deleteMany({})
        await prisma.apiKey.deleteMany({})
        await prisma.usageLog.deleteMany({})
        await prisma.notification.deleteMany({})
        await prisma.userConfig.deleteMany({})
        await prisma.securityHistory.deleteMany({})
        await prisma.connection.deleteMany({})
        await prisma.email.deleteMany({})
        await prisma.threat.deleteMany({})
        await prisma.user.deleteMany({})

        console.log('✅ Todos los usuarios han sido eliminados de la base de datos')
        console.log('Ahora puedes registrarte de nuevo')
    } catch (error) {
        console.error('Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

clearUsers()
