"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/features/admin/auth/actions";

const field =
  "border-leaf-700/25 focus:border-leaf-700 focus:ring-leaf-500/30 mt-1 block min-h-12 w-full rounded-xl border bg-white px-4 text-base outline-none focus:ring-4";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 grid gap-4" noValidate>
      <label className="text-sm font-bold">
        الإيميل
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          dir="ltr"
          className={field}
        />
      </label>
      <label className="text-sm font-bold">
        كلمة السر
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className={field}
        />
      </label>
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-leaf-700 hover:bg-leaf-900 min-h-12 rounded-full px-6 font-bold text-white transition disabled:opacity-60"
      >
        {pending ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
