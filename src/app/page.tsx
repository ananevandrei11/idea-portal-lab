import { Suspense } from "react";
import { NewIdeaDialog } from '@/components/DialogIdea/NewIdeaDialog'
import { IdeaList } from "@/components/IdeaList/IdeaList";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12 overflow-x-clip">
      <main className="max-w-2xl mx-auto space-y-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Idea Portal
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-sm">
              Capture your ideas before they disappear.
            </p>
          </div>
          <NewIdeaDialog />
        </header>

        {/* Ideas list — streams in independently via Suspense */}
        <section className="space-y-3">
          <Suspense fallback={<p className="text-zinc-400 text-sm text-center py-8">Loading ideas…</p>}>
            <IdeaList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
