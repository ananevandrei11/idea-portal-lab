"use server";

import { setAuthCookies } from "@/lib/auth/cookies";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import crypto from 'crypto';

export async function register(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  };

  try {
    const isExistUser = await prisma.user.findUnique({ where: { email } });
    if (isExistUser) {
      return { error: "Email already exists" }
    };

    const passwordHash = await hashPassword(password as string);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    await setAuthCookies(accessToken, refreshToken);

    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })
  } catch (error) {
    const err = error instanceof Error ? error.message : "Something went wrong";
    return { error: err };
  }
  redirect("/");
}

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        error: "Invalid credentials"
      }
    };
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        error: "Invalid credentials"
      }
    };

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    await setAuthCookies(accessToken, refreshToken);

    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })
  } catch (error) {
    const err = error instanceof Error ? error.message : "Something went wrong";
    return { error: err };
  }
  redirect("/");
}
