// Test script for email forwarding endpoint
const testEmailForwarding = async () => {
    // Simulated phishing email
    const phishingEmail = {
        from: 'security@paypa1-verify.tk', // Suspicious domain
        to: 'user@cybershield.app',
        subject: 'URGENTE: Tu cuenta ha sido suspendida', // Urgency
        html: `
      <html>
        <body>
          <p>Estimado cliente,</p>
          <p>Tu cuenta de PayPal ha sido suspendida por actividad sospechosa.</p>
          <p>Por favor <a href="http://192.168.1.100/paypal-login">verifica tu identidad aquí</a> inmediatamente.</p>
          <p>Si no actúas en las próximas 24 horas, tu cuenta será eliminada permanentemente.</p>
          <p>Atentamente,<br>Equipo de Seguridad de PayPal</p>
        </body>
      </html>
    `,
        text: 'Tu cuenta ha sido suspendida. Verifica en http://192.168.1.100/paypal-login',
        attachments: [
            {
                filename: 'invoice.exe',
                contentType: 'application/x-msdownload'
            }
        ]
    }

    try {
        console.log('📧 Enviando email de prueba (phishing)...\n')

        const response = await fetch('http://localhost:3001/api/email/forward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(phishingEmail)
        })

        const result = await response.json()

        console.log('✅ Respuesta del servidor:')
        console.log('Status:', response.status)
        console.log('\nResultado:', JSON.stringify(result, null, 2))

        console.log('\n📊 Análisis:')
        console.log(`- Nivel de Riesgo: ${result.riskLevel.toUpperCase()}`)
        console.log(`- URLs Analizadas: ${result.urlsAnalyzed}`)
        console.log(`- Amenazas Detectadas: ${result.threats?.length || 0}`)

        if (result.threats && result.threats.length > 0) {
            console.log('\n⚠️  Amenazas:')
            result.threats.forEach(threat => {
                console.log(`  ${threat}`)
            })
        }

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

// Test with safe email
const testSafeEmail = async () => {
    const safeEmail = {
        from: 'newsletter@amazon.com',
        to: 'user@cybershield.app',
        subject: 'Your Amazon Order Confirmation',
        html: '<html><body><p>Thank you for your order!</p></body></html>',
        text: 'Thank you for your order!',
        attachments: []
    }

    try {
        console.log('\n\n📧 Enviando email de prueba (seguro)...\n')

        const response = await fetch('http://localhost:3001/api/email/forward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(safeEmail)
        })

        const result = await response.json()

        console.log('✅ Respuesta del servidor:')
        console.log('Status:', response.status)
        console.log('\nResultado:', JSON.stringify(result, null, 2))

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

// Run tests
console.log('🧪 Probando endpoint de análisis de emails\n')
console.log('='.repeat(50))

testEmailForwarding()
    .then(() => testSafeEmail())
    .then(() => console.log('\n\n✅ Pruebas completadas'))
