import { signAccessToken, verifyAccessToken, verifyRefreshToken } from '@/lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants/cookies';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function proxy(request: NextRequest) {
  const isPublic = PUBLIC_ROUTES.some(r =>
    request.nextUrl.pathname.startsWith(r));
  if (isPublic) {
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