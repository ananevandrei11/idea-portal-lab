import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: { token: string } }) {
  const { token } = await searchParams;

  return (
    <Suspense fallback={<p className="text-zinc-400 text-sm text-center py-8">Loading…</p>}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}
