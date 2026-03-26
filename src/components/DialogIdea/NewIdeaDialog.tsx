"use client";

import { useRef, useTransition } from "react";
import { createIdea } from "@/actions/ideas";
import { cn } from "@/lib/cn";
import styles from "./dialog.module.css";

export function NewIdeaDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await createIdea(formData);
      dialogRef.current?.close();
    });
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="btn-primary whitespace-nowrap"
      >
        + New Idea
      </button>

      <dialog
        ref={dialogRef}
        closedby="any"
        className={cn(styles.dialog, "w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800")}
      >
        <div className="p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-4">
            New Idea
          </h2>

          <form action={handleAction} className="space-y-3">
            <input
              name="title"
              required
              placeholder="Title"
              className="form-input"
            />
            <textarea
              name="content"
              required
              rows={4}
              placeholder="What's the idea?"
              className="form-input form-textarea"
            />
            <input
              name="tags"
              placeholder="Tags (comma-separated)"
              className="form-input"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                disabled={isPending}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary"
              >
                {isPending ? "Saving..." : "Add Idea"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
