"use client";

import { useRef, useTransition } from "react";
import { cn } from "@/lib/cn";
import styles from "./dialog.module.css";
import { deleteAccount } from "@/actions/auth";

export function DeleteAccountDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="btn-danger-outline"
      >
        Delete Account
      </button>

      <dialog
        ref={dialogRef}
        closedby="any"
        className={cn(styles.dialog, "w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800")}
      >
        <div className="p-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Delete this account and all of your ideas?
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This action cannot be undone.
          </p>

          <div className="mt-6 flex gap-2 justify-end">
            <form method="dialog">
              <button
                type="submit"
                disabled={isPending}
                className="btn-secondary"
              >
                Cancel
              </button>
            </form>

            <form action={handleDelete}>
              <button
                type="submit"
                disabled={isPending}
                className="btn-danger"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
