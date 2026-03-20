import { DeleteAccountDialog } from "@/components/DialogIAccount/DeleteAccountDialog";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import { Suspense } from "react";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Account
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            You are not logged in.
          </p>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            → Login
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <Suspense fallback={<p className="text-zinc-400 text-sm text-center py-8">Loading account…</p>}>
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Account
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {user.email}
          </p>
          <DeleteAccountDialog />
        </section>
      </Suspense>
    </div>
  );
}
