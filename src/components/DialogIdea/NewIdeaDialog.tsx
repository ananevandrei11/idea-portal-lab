"use client";

import { useRef } from "react";
import { createIdea } from "@/actions/ideas";
import { cn } from "@/lib/cn";
import styles from "./dialog.module.css";

export function NewIdeaDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className={styles.btnPrimary}
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

          <form action={createIdea} className="space-y-3">
            <input
              name="title"
              required
              placeholder="Title"
              className={styles.input}
            />
            <textarea
              name="content"
              required
              rows={4}
              placeholder="What's the idea?"
              className={styles.textarea}
            />
            <input
              name="tags"
              placeholder="Tags (comma-separated)"
              className={styles.input}
            />

            <div className="flex gap-2 justify-end pt-2">
              {/* type="button" — does not submit the form, closes the dialog via JS */}
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => dialogRef.current?.close()}
                className={styles.btnPrimary}
              >
                Add Idea
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
