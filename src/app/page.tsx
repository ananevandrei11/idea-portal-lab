import { Suspense } from "react";
import { createIdea } from "./actions";
import { IdeaList } from "./components/IdeaList";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <main className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Idea Portal
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-sm">
            Capture your ideas before they disappear.
          </p>
        </header>

        {/* Create form — renders immediately, no DB dependency */}
        <form action={createIdea} className="space-y-3 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">New Idea</h2>
          <input
            name="title"
            required
            placeholder="Title"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <textarea
            name="content"
            required
            rows={3}
            placeholder="What's the idea?"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
          />
          <input
            name="tags"
            placeholder="Tags (comma-separated)"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Add Idea
          </button>
        </form>

        {/* Ideas list — streamed independently */}
        <section className="space-y-3">
          <Suspense fallback={<p className="text-zinc-400 text-sm text-center py-8">Loading ideas…</p>}>
            <IdeaList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
