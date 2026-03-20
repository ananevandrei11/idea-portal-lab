import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../auth/session";

export const getIdeas = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return [];
  return prisma.idea.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
});

export const getIdea = cache(async (id: string) => {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.idea.findUnique({ where: { id, userId: user.id } });
});
