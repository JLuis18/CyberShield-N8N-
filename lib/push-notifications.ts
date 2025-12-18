/**
 * Web Push Notifications Utility
 */

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported')
        return 'denied'
    }

    return await Notification.requestPermission()
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers not supported')
        return null
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
        return registration
    } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
    }
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    try {
        // Request permission first
        const permission = await requestNotificationPermission()
        if (permission !== 'granted') {
            console.warn('Notification permission not granted')
            return null
        }

        // Register service worker
        const registration = await registerServiceWorker()
        if (!registration) {
            return null
        }

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
            // Create new subscription
            const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey.buffer as ArrayBuffer
            })
        }

        return subscription
    } catch (error) {
        console.error('Error subscribing to push:', error)
        return null
    }
}

// Upload subscription to server
export async function saveSubscription(subscription: PushSubscription, token: string): Promise<boolean> {
    try {
        const res = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscription.toJSON())
        })

        return res.ok
    } catch (error) {
        console.error('Error saving subscription:', error)
        return false
    }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(token: string): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) return false

        const subscription = await registration.pushManager.getSubscription()
        if (!subscription) return true

        // Unsubscribe
        await subscription.unsubscribe()

        // Remove from server
        await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        return true
    } catch (error) {
        console.error('Error unsubscribing:', error)
        return false
    }
}

// Check if notifications are enabled
export async function areNotificationsEnabled(): Promise<boolean> {
    if (!('Notification' in window)) return false
    if (Notification.permission !== 'granted') return false

    try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) return false

        const subscription = await registration.pushManager.getSubscription()
        return subscription !== null
    } catch {
        return false
    }
}
