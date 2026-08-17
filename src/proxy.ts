import { verifyAccessToken } from '@/lib/auth/tokens';
import { rotateRefreshToken } from '@/lib/auth/refresh';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants/cookies';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimitForgotPassword, ratelimitLogin, ratelimitRegister } from './lib/ratelimit';
import { Ratelimit } from '@upstash/ratelimit';
import { getClientIp } from '@/lib/client-ip';

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
    const routeMethod = getRouteMethod(request.nextUrl.pathname);
    const ratelimit = RATE_LIMIT_ROUTES_METHOD[routeMethod];

    if (!ratelimit) {
      return NextResponse.next();
    }
    if (request.method !== 'POST') {
      return NextResponse.next();
    }

    const clientIp = getClientIp(request);
    if (!clientIp) {
      // No trustworthy address. In production that means the proxy setup is
      // wrong, and serving the request unlimited is worse than refusing it.
      // Locally there are no forwarding headers at all, so fall back to a
      // single bucket rather than blocking development.
      if (process.env.NODE_ENV === 'production') {
        console.error('rate limit: could not determine client IP; refusing request');
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      const { success } = await ratelimit.limit('local-dev');
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      return NextResponse.next();
    }

    const { success } = await ratelimit.limit(clientIp);
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

  // The exchange checks the database, so a revoked session stops working as
  // soon as its access token expires rather than lasting the refresh token's
  // full lifetime.
  const rotated = await rotateRefreshToken(refreshToken);
  if (!rotated.ok) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set(ACCESS_TOKEN_COOKIE, rotated.accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, rotated.refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};