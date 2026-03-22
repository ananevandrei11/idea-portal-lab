"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/actions/auth";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRegister(formData: FormData) {
    startTransition(async () => {
      setError(null);
      const password = formData.get("password") as string;
      const confirm = formData.get("confirmPassword") as string;

      if (password !== confirm) {
        setError("Passwords do not match");
        return;
      }
      const response = await resetPassword(formData);
      if (response?.error) setError(response.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Set new password!
        </h1>
      </div>

      <form action={handleRegister} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="new-password"
            required
            className="form-input"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            autoComplete="off"
            required
            className="form-input"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending ? "Saving password…" : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
