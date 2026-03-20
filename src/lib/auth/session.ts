import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "../constants/cookies";
import { verifyAccessToken } from "./tokens";
import { prisma } from "../prisma";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE);
  const accessTokenValue = accessToken?.value;

  if (!accessTokenValue) {
    return null;
  }
  const userId = await verifyAccessToken(accessTokenValue);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId.userId } });
  return user;
});