"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createIdea(formData: FormData) {
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  const tagsRaw = (formData.get("tags") as string).trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!title || !content) return;

  await prisma.idea.create({ data: { title, content, tags } });
  revalidatePath("/");
  revalidatePath("/ideas/[id]", "page");
}

export async function deleteIdea(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.idea.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
  redirect("/");
}
