"use client";

import { useState, useTransition } from "react";
import { register } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
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
      const response = await register(formData);
      if (response?.error) setError(response.error);
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <main className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create your account
          </p>
        </div>

        <form action={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              className="form-input"
            />
          </div>

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
            {isPending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
