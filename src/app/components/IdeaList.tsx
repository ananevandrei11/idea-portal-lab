import Link from "next/link";
import { getIdeas } from "@/lib/queries/ideas";

export async function IdeaList() {
  const ideas = await getIdeas();

  if (ideas.length === 0) {
    return (
      <p className="text-zinc-400 text-sm text-center py-8">No ideas yet. Add one above.</p>
    );
  }

  return (
    <>
      {ideas.map((idea) => (
        <Link
          key={idea.id}
          href={`/ideas/${idea.id}`}
          className="block bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{idea.title}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{idea.content}</p>
          {idea.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {idea.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-400">
            {new Date(idea.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "medium" })}
          </p>
        </Link>
      ))}
    </>
  );
}
