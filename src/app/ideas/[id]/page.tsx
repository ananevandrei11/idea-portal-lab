import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteIdea } from "@/app/actions";
import { getIdea, getIdeas } from "@/lib/queries/ideas";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <main className="max-w-2xl mx-auto space-y-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          ← Back
        </Link>

        <article className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{idea.title}</h1>

          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {idea.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{idea.content}</p>

          <p className="text-xs text-zinc-400">
            Created {new Date(idea.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" })}
          </p>
        </article>

        <form action={deleteIdea}>
          <input type="hidden" value={id} name="id" />
          <button
            type="submit"
            className="rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Delete idea
          </button>
        </form>
      </main>
    </div>
  );
}
