const webpush = require('web-push')

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys()

console.log('='.repeat(60))
console.log('VAPID KEYS GENERATED - ADD TO .env.local:')
console.log('='.repeat(60))
console.log('')
console.log('# Web Push Notifications')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('')
console.log('⚠️  IMPORTANT: Copy these to your .env.local file')
console.log('⚠️  Also add to Vercel Environment Variables')
console.log('='.repeat(60))
