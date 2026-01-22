import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// PENTING: Di Next.js 16+, nama fungsi WAJIB 'proxy' (bukan middleware lagi)
export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // 1. Proteksi Dashboard
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Redirect jika sudah Login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config Matcher tetap sama
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login'
  ],
};