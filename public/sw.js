// Service Worker for Web Push Notifications
console.log('Service Worker loaded')

// Handle push events
self.addEventListener('push', function (event) {
    console.log('Push event received:', event)

    if (!event.data) {
        return
    }

    try {
        const data = event.data.json()

        const options = {
            body: data.body || 'Nueva amenaza detectada',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/dashboard',
                threatId: data.threatId
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Detalles'
                },
                {
                    action: 'dismiss',
                    title: 'Descartar'
                }
            ],
            requireInteraction: data.severity === 'high',
            tag: data.tag || 'cybershield-threat',
            renotify: true
        }

        event.waitUntil(
            self.registration.showNotification(data.title || 'CyberShield Alert', options)
        )
    } catch (error) {
        console.error('Error showing notification:', error)
    }
})

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked:', event)

    event.notification.close()

    if (event.action === 'dismiss') {
        return
    }

    // Open the app or focus existing window
    const urlToOpen = event.notification.data?.url || '/dashboard'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i]
                    if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
                        return client.focus()
                    }
                }
                // Open new window if not already open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen)
                }
            })
    )
})

// Service worker activation
self.addEventListener('activate', function (event) {
    console.log('Service Worker activated')
    event.waitUntil(clients.claim())
})
