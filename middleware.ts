import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// MIDDLEWARE - Proper Next.js Auth Protection
// Replaces old proxy.ts with standard middleware
// ============================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicRoutes = ['/register', '/payment', '/api/public'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth session token (NextAuth sets this cookie)
  const sessionToken = request.cookies.get('authjs.session-token') 
    || request.cookies.get('__Secure-authjs.session-token')
    || request.cookies.get('auth_token'); // backward compat

  // 1. Protect Dashboard Routes
  if (pathname.startsWith('/dashboard') && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Redirect logged-in users away from login page
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Redirect root to dashboard or login
  if (pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/payment',
    '/api/public/:path*',
  ],
};
