"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createIdea(formData: FormData): Promise<{ error: string } | void> {
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  const tagsRaw = (formData.get("tags") as string).trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!title || !content) return { error: "Title and content are required" };
  if (title.length > 200) return { error: "Title is too long (max 200 chars)" };
  if (content.length > 10000) return { error: "Content is too long (max 10,000 chars)" };

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.idea.create({ data: { title, content, tags, userId: user.id } });
  revalidatePath("/");
}

export async function deleteIdea(formData: FormData): Promise<{ error: string } | void> {
  const id = formData.get("id") as string;
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  await prisma.idea.delete({ where: { id, userId: user.id } });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
  redirect("/");
}
