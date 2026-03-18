import { SignJWT, jwtVerify } from "jose"

export const signAccessToken = async (userId: string): Promise<string> => {
  const secret = new
    TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
  const accessToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret)

  return accessToken;
}

export const signRefreshToken = async (userId: string): Promise<string> => {
  const secret = new
    TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  return refreshToken;
}

export const verifyAccessToken = async (token: string): Promise<{ userId: string }
  | null> => {
  try {
    const secret = new
      TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
    const { payload } = await jwtVerify<{ userId: string }>(token, secret)
    if (typeof payload.userId !== 'string') return null
    return { userId: payload.userId }
  } catch {
    return null;
  }
}