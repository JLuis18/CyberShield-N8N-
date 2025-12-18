import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware disabled - using client-side authentication with localStorage
// To enable, uncomment and switch to cookie-based authentication

export function middleware(request: NextRequest) {
    // Skip middleware - authentication handled client-side
    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/scanner/:path*', '/security/:path*', '/settings/:path*', '/login', '/register'],
}
