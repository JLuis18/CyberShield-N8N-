import { NextRequest } from 'next/server'
import { prisma } from './db'
import crypto from 'crypto'

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
    return `cs_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Verify API key from request headers
 */
export async function verifyApiKey(request: NextRequest): Promise<{
    valid: boolean
    userId?: string
    apiKeyId?: string
    error?: string
}> {
    try {
        // Check for API key in Authorization header
        const authHeader = request.headers.get('authorization')
        const apiKeyHeader = request.headers.get('x-api-key')

        let apiKey: string | null = null

        // Support both Authorization: Bearer <key> and X-API-Key: <key>
        if (authHeader?.startsWith('Bearer ')) {
            apiKey = authHeader.substring(7)
        } else if (apiKeyHeader) {
            apiKey = apiKeyHeader
        }

        if (!apiKey) {
            return {
                valid: false,
                error: 'API key required. Use Authorization: Bearer <key> or X-API-Key: <key>'
            }
        }

        // Hash the key to compare with stored hash
        const hashedKey = hashApiKey(apiKey)

        // Find the API key in database
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: hashedKey },
            include: { user: true }
        })

        if (!keyRecord) {
            return {
                valid: false,
                error: 'Invalid API key'
            }
        }

        // Check if key is active
        if (!keyRecord.isActive) {
            return {
                valid: false,
                error: 'API key is inactive'
            }
        }

        // Check expiration
        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            return {
                valid: false,
                error: 'API key has expired'
            }
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() }
        })

        return {
            valid: true,
            userId: keyRecord.userId,
            apiKeyId: keyRecord.id
        }
    } catch (error) {
        console.error('API key verification error:', error)
        return {
            valid: false,
            error: 'Internal server error'
        }
    }
}

/**
 * Simple in-memory rate limiter
 * TODO: Replace with Redis for production
 */
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

export function checkRateLimit(apiKeyId: string, limit: number): {
    allowed: boolean
    remaining: number
    resetTime: number
} {
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute window

    const record = rateLimitMap.get(apiKeyId)

    if (!record || now > record.resetTime) {
        // New window
        rateLimitMap.set(apiKeyId, {
            count: 1,
            resetTime: now + windowMs
        })
        return {
            allowed: true,
            remaining: limit - 1,
            resetTime: now + windowMs
        }
    }

    if (record.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime
        }
    }

    record.count++
    return {
        allowed: true,
        remaining: limit - record.count,
        resetTime: record.resetTime
    }
}
