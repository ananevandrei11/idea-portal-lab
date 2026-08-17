"use server";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import { hashToken, issueRefreshToken } from "@/lib/auth/refresh";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import crypto from 'crypto';
import { REFRESH_TOKEN_COOKIE } from "@/lib/constants/cookies";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { Prisma } from "@/generated/prisma/client";
import {
  forgotPasswordSchema,
  loginSchema,
  parseFormData,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas";

/**
 * Signs the user in: issues the token pair, records the refresh token so it can
 * be revoked, and sets both cookies.
 */
async function startSession(userId: string) {
  const accessToken = await signAccessToken(userId);
  const { token: refreshToken } = await issueRefreshToken(userId);
  await setAuthCookies(accessToken, refreshToken);
}

export async function register(formData: FormData): Promise<{ error: string } | void> {
  const parsed = parseFormData(registerSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { email, password } = parsed.data;

  try {
    const isExistUser = await prisma.user.findUnique({ where: { email } });
    if (isExistUser) {
      return { error: "Email already exists" }
    };

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    await startSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientUnknownRequestError) {
      return { error: "Something went wrong. Please try again later." };
    }
    return { error: "Something went wrong" };
  }
  redirect("/");
}

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const parsed = parseFormData(loginSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { email, password } = parsed.data;

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

    await startSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientUnknownRequestError) {
      return { error: "Something went wrong. Please try again later." };
    }
    return { error: "Something went wrong" };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const refreshToken =
      cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken) },
        data: { revokedAt: new Date() }
      })
    }
  } catch (error) {
    // A failed revocation leaves the session usable, so it must not stay silent.
    console.error("logout: failed to revoke refresh token", error);
  }

  try {
    await clearAuthCookies();
  } catch (error) {
    console.error("logout: failed to clear auth cookies", error);
  }
  redirect("/login");
}


export async function deleteAccount(): Promise<{ error: string } | void> {

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const userId = user.id;

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    // Never redirect on failure: telling the user their account is gone while it
    // still exists is worse than surfacing the error.
    console.error("deleteAccount failed", error);
    return { error: "Could not delete your account. Please try again later." };
  }

  // The account is gone, so the session must not outlive it, even if this throws.
  try {
    await clearAuthCookies();
  } catch (error) {
    console.error("deleteAccount: failed to clear auth cookies", error);
  }
  redirect("/register");
}

export async function forgotPassword(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const parsed = parseFormData(forgotPasswordSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          userId: user.id,
        }
      });
      console.log('Reset link: ', "/reset-password?token=" + rawToken);
    }
  } catch {
    return { error: "Something went wrong" };
  }

  return { success: "If this email exists, you will receive a reset link" };
}

export async function resetPassword(formData: FormData): Promise<{ error: string } | void> {
  const parsed = parseFormData(resetPasswordSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { token, password } = parsed.data;

  try {
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { tokenHash }
    })
    if (!resetToken) {
      return { error: "Token does not exists" };
    };
    if (resetToken.expiresAt < new Date()) {
      return { error: "Token has expired" };
    };
    if (resetToken.usedAt !== null) {
      return { error: "Token has already been used" };
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      }),
      // Resetting a password must end every existing session: an attacker
      // holding a refresh token would otherwise keep access after the reset.
      prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      }),
    ])
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientUnknownRequestError) {
      return { error: "Something went wrong. Please try again later." };
    }
    return { error: "Something went wrong" };
  }
  redirect("/login");
}
