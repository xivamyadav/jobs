import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  let isLoggedIn = false;

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    isLoggedIn = true;
  }

  // Check for accessToken cookie (set by login page)
  if (!isLoggedIn) {
    const accessToken = request.cookies.get('accessToken');
    if (accessToken?.value) {
      isLoggedIn = true;
    }
  }

  // Define public/auth pages
  // Allow both /verify and /auth/verify as public pages (for OTP)
  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/logout',
    '/verify',
    '/auth/verify'
  ].includes(nextUrl.pathname);

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && isAuthPage && nextUrl.pathname !== '/logout') {
    return NextResponse.redirect(new URL('/employer/dashboard', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};