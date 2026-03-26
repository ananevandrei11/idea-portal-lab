import { signAccessToken, verifyAccessToken, verifyRefreshToken } from '@/lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants/cookies';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimitForgotPassword, ratelimitLogin, ratelimitRegister } from './lib/ratelimit';
import { Ratelimit } from '@upstash/ratelimit';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
const getRouteMethod = (pathname: string) => pathname.split('/')[1];
const RATE_LIMIT_ROUTES_METHOD: Record<string, Ratelimit |
  undefined> = {
  'login': ratelimitLogin,
  'register': ratelimitRegister,
  'forgot-password': ratelimitForgotPassword
}

export async function proxy(request: NextRequest) {
  const isPublic = PUBLIC_ROUTES.some(r =>
    request.nextUrl.pathname.startsWith(r));
  if (isPublic) {
    const requestIP = request.headers.get('x-forwarded-for')?.split(',')[0]
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1';

    const routeMethod = getRouteMethod(request.nextUrl.pathname);
    const ratelimit = RATE_LIMIT_ROUTES_METHOD[routeMethod];

    if (!ratelimit) {
      return NextResponse.next();
    }
    if (request.method !== 'POST') {
      return NextResponse.next();
    }
    const { success } = await ratelimit.limit(requestIP);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.next();
  }

  const accessToken =
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const payload = accessToken ? await verifyAccessToken(accessToken) : null;
  if (payload) {
    return NextResponse.next();
  }

  const refreshToken =
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const newAccessToken = await
    signAccessToken(refreshPayload.userId);
  const response = NextResponse.next();
  response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15,
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};