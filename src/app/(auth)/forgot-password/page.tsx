"use client";

import { forgotPassword } from "@/actions/auth";
import { useActionState } from "react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Forgot password
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email to receive a reset link
        </p>
      </div>

      <form action={formAction} className="space-y-4">
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

        {state?.error && (
          <p className="text-sm text-red-500 dark:text-red-400">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending ? "Sending…" : "Send email"}
        </button>
      </form>
    </div>
  );
}
