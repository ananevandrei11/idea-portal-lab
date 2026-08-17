import crypto from "crypto";
import { prisma } from "../prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Issues a refresh token and stores its hash. Returns the raw token plus the
 * row id so a rotation can point the old row at its replacement.
 */
export async function issueRefreshToken(userId: string) {
  const token = await signRefreshToken(userId);
  const row = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  return { token, id: row.id };
}

/** Revokes every live refresh token for a user. */
export async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export type RotationResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false; reason: "invalid" | "unknown" | "expired" | "reused" };

/**
 * Exchanges a refresh token for a fresh pair, following the OAuth 2.0 BCP:
 *
 * - the token must verify, exist in the database, and not be expired
 * - a valid exchange rotates the token: the old row is revoked and linked to
 *   its replacement, so a stolen cookie is only usable until the victim's
 *   client refreshes once
 * - presenting an already-revoked token means the cookie leaked, so the whole
 *   family is revoked and the caller is forced to log in again
 */
export async function rotateRefreshToken(rawToken: string): Promise<RotationResult> {
  const payload = await verifyRefreshToken(rawToken);
  if (!payload) return { ok: false, reason: "invalid" };

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  // Signature-valid but absent from the database: it was deleted with the
  // account, or never issued by us.
  if (!stored) return { ok: false, reason: "unknown" };

  if (stored.revokedAt !== null) {
    // Reuse detection — the only benign case is a lost response, which we
    // cannot distinguish from theft, so we fail closed.
    await revokeAllUserTokens(stored.userId);
    return { ok: false, reason: "reused" };
  }

  if (stored.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const refreshToken = await signRefreshToken(stored.userId);
  const newHash = hashToken(refreshToken);

  await prisma.$transaction(async (tx) => {
    const replacement = await tx.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedById: replacement.id },
    });
  });

  const accessToken = await signAccessToken(stored.userId);
  return { ok: true, accessToken, refreshToken };
}
