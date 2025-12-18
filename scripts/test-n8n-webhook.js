/**
 * Test script for n8n webhook endpoint
 * Simulates emails as they would come from n8n Gmail Trigger
 * 
 * Run: node scripts/test-n8n-webhook.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000'

// Test 1: Phishing email (should be HIGH risk)
const phishingEmail = {
    from: 'security-alert@paypa1-verify.tk',
    to: 'victim@gmail.com',
    subject: 'URGENTE: Tu cuenta será suspendida en 24 horas',
    body: `
        Estimado cliente,
        
        Hemos detectado actividad inusual en tu cuenta bancaria.
        Por favor verifica tu contraseña y número de tarjeta de crédito 
        inmediatamente para evitar el bloqueo.
        
        Haz clic aquí: http://192.168.1.100/verify-account
        
        Si no actúas ahora, tu cuenta será suspendida permanentemente.
        
        Atentamente,
        Equipo de Seguridad
    `,
    date: new Date().toISOString(),
    attachments: [
        { filename: 'invoice.exe', mimeType: 'application/x-msdownload', size: 1024 }
    ]
}

// Test 2: Normal email (should be LOW risk)
const normalEmail = {
    from: 'newsletter@amazon.com',
    to: 'user@gmail.com',
    subject: 'Tus recomendaciones semanales de Amazon',
    body: `
        Hola Juan,
        
        Basado en tus compras recientes, te recomendamos estos productos:
        
        - Libro: "El Arte de la Programación"
        - Auriculares inalámbricos
        
        Visita amazon.com para ver más.
        
        Gracias por ser cliente de Amazon.
    `,
    date: new Date().toISOString()
}

// Test 3: Medium risk email
const suspiciousEmail = {
    from: 'notifications@email-service.com',
    to: 'user@gmail.com',
    subject: 'Actualiza tu información de pago',
    body: `
        Estimado cliente,
        
        Tu método de pago necesita ser actualizado.
        Por favor actualiza tu tarjeta de crédito en tu cuenta.
        
        Visita: https://account-update.example.com
        
        Saludos
    `,
    date: new Date().toISOString()
}

async function testWebhook(testName, emailData) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📧 Test: ${testName}`)
    console.log(`${'='.repeat(60)}`)
    console.log(`From: ${emailData.from}`)
    console.log(`Subject: ${emailData.subject}`)

    try {
        const response = await fetch(`${BASE_URL}/api/webhook/n8n`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        })

        const result = await response.json()

        console.log(`\n📊 Resultado:`)
        console.log(`   Status: ${response.status}`)
        console.log(`   Risk Level: ${result.riskLevel?.toUpperCase() || 'N/A'}`)
        console.log(`   Risk Score: ${result.riskScore || 0}`)
        console.log(`   Message: ${result.message}`)

        if (result.threats && result.threats.length > 0) {
            console.log(`\n   ⚠️ Amenazas detectadas:`)
            result.threats.forEach(threat => {
                console.log(`      - ${threat}`)
            })
        }

        if (result.recommendations && result.recommendations.length > 0) {
            console.log(`\n   📋 Recomendaciones:`)
            result.recommendations.forEach(rec => {
                console.log(`      ${rec}`)
            })
        }

        return result

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`)
        console.error(`   Asegúrate de que el servidor esté corriendo en ${BASE_URL}`)
        return null
    }
}

async function runTests() {
    console.log('\n🧪 CyberShield n8n Webhook Test Suite')
    console.log('=====================================\n')
    console.log(`Testing against: ${BASE_URL}`)

    // First, check if server is running
    try {
        const healthCheck = await fetch(`${BASE_URL}/api/webhook/n8n`)
        const health = await healthCheck.json()
        console.log(`✅ Server status: ${health.status}`)
    } catch (e) {
        console.log('\n❌ Server is not running!')
        console.log('   Please start the server first: npm run dev')
        return
    }

    // Run tests
    const results = {
        phishing: await testWebhook('Email de Phishing (ALTO RIESGO esperado)', phishingEmail),
        normal: await testWebhook('Email Normal (BAJO RIESGO esperado)', normalEmail),
        suspicious: await testWebhook('Email Sospechoso (MEDIO RIESGO esperado)', suspiciousEmail)
    }

    // Summary
    console.log('\n\n📊 RESUMEN DE PRUEBAS')
    console.log('=====================')
    console.log(`Phishing:   ${results.phishing?.riskLevel === 'high' ? '✅ PASS' : '❌ FAIL'} (${results.phishing?.riskLevel || 'error'})`)
    console.log(`Normal:     ${results.normal?.riskLevel === 'low' ? '✅ PASS' : '⚠️ CHECK'} (${results.normal?.riskLevel || 'error'})`)
    console.log(`Suspicious: ${results.suspicious?.riskLevel === 'medium' || results.suspicious?.riskLevel === 'high' ? '✅ PASS' : '⚠️ CHECK'} (${results.suspicious?.riskLevel || 'error'})`)

    console.log('\n✅ Pruebas completadas!')
    console.log('\n💡 Ahora puedes configurar n8n siguiendo N8N_INTEGRATION.md')
}

runTests()
