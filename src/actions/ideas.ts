"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createIdeaSchema, deleteIdeaSchema, parseFormData } from "@/lib/validation/schemas";

export async function createIdea(formData: FormData): Promise<{ error: string } | void> {
  const parsed = parseFormData(createIdeaSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { title, content, tags } = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.idea.create({ data: { title, content, tags, userId: user.id } });
  revalidatePath("/");
}

export async function deleteIdea(formData: FormData): Promise<{ error: string } | void> {
  const parsed = parseFormData(deleteIdeaSchema, formData);
  if (!parsed.success) return { error: parsed.error };
  const { id } = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  await prisma.idea.delete({ where: { id, userId: user.id } });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
  redirect("/");
}
