# Web Push Notifications - VAPID Keys Configuration

## Generate VAPID Keys

Run the following command to generate VAPID keys:

```bash
node scripts/generate-vapid-keys.js
```

This will output two keys that you need to add as environment variables.

## Add to Local Environment

Create or update `.env.local`:

```env
# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

## Add to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (value from script)
   - `VAPID_PRIVATE_KEY` (value from script)
3. Redeploy the application

## Test Notifications

1. Login to CyberShield
2. Go to Settings
3. Enable "Notificaciones Push"
4. Allow browser notifications when prompted
5. Scan a malicious URL (will trigger HIGH risk notification)

## How It Works

1. User enables notifications in settings
2. Browser requests permission
3. Service worker registers
4. Push subscription saved to database
5. When HIGH risk threat detected → notification sent
6. User clicks notification → navigates to dashboard

## Notification Triggers

Notifications are sent when:
- URL scan detects HIGH risk
- Email scan detects HIGH risk
- Invoice scan detects HIGH risk
- Network connection BLOCKED

## Browser Support

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop)
- ✅ Safari 16+ (macOS, iOS)
- ⚠️ iOS requires "Add to Home Screen"
