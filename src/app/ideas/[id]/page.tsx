import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdea, getIdeas } from "@/lib/queries/ideas";
import { DeleteConfirmDialog } from "@/components/DialogIdea/DeleteConfirmDialog";
import { Tag } from "@/components/Tag/Tag";

export const revalidate = 60;

export async function generateStaticParams() {
  const ideas = await getIdeas();
  return ideas.map((idea) => ({ id: idea.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const idea = await getIdea(id);
  return { title: idea?.title ?? "Idea not found" };
}

export default async function IdeaPage({ params }: Props) {
  const { id } = await params;
  const idea = await getIdea(id);

  if (!idea) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        ← Back
      </Link>

      <article className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{idea.title}</h1>

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {idea.tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        )}

        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{idea.content}</p>

        <p className="text-xs text-zinc-400">
          Created {new Date(idea.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" })}
        </p>
      </article>

      <DeleteConfirmDialog id={id} />
    </div>
  );
}
