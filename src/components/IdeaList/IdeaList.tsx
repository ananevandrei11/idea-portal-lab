import { getIdeas } from "@/lib/queries/ideas";
import { IdeaCard } from "@/components/IdeaCard/IdeaCard";

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
        <IdeaCard
          parentListName="ideas-card"
          key={idea.id}
          id={idea.id}
          title={idea.title}
          content={idea.content}
          tags={idea.tags}
          createdAt={idea.createdAt}
        />
      ))}
    </>
  );
}
