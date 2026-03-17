import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getIdeas = cache(() =>
  prisma.idea.findMany({ orderBy: { createdAt: "desc" } })
);

export const getIdea = cache((id: string) =>
  prisma.idea.findUnique({ where: { id } })
);
