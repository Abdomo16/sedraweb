import type { ReactNode } from "react";

export const inputCls =
  "border-leaf-700/25 focus:border-leaf-700 focus:ring-leaf-500/30 mt-1 block min-h-11 w-full rounded-xl border bg-white px-3 text-base outline-none focus:ring-4 aria-[invalid=true]:border-red-500";

export const primaryBtn =
  "bg-leaf-700 hover:bg-leaf-900 inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold text-white transition-colors disabled:opacity-60";
export const softBtn =
  "bg-leaf-100 text-leaf-900 hover:bg-leaf-500 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition-colors hover:text-white";
export const dangerBtn =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-red-50 px-5 text-sm font-bold text-red-700 hover:bg-red-100";

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-bold ${className}`}>
      {label}
      {children}
      {hint && !error ? (
        <span className="text-ink/70 mt-1 block text-xs font-normal">{hint}</span>
      ) : null}
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-bold text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function Section({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="shadow-soft rounded-3xl bg-white p-4 md:p-6">
      <h2 className="font-display text-leaf-900 text-lg font-extrabold">{title}</h2>
      {description ? <p className="text-ink/70 mt-1 text-sm">{description}</p> : null}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

export function Notice({
  tone = "ok",
  children,
}: {
  tone?: "ok" | "warn" | "error";
  children: ReactNode;
}) {
  const cls = {
    ok: "bg-leaf-100 text-leaf-900",
    warn: "bg-sun-100 text-leaf-900",
    error: "bg-red-50 text-red-700",
  }[tone];
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm font-bold ${cls}`}
    >
      {children}
    </p>
  );
}

const badgeTones = {
  ok: "bg-leaf-100 text-leaf-900",
  warn: "bg-sun-100 text-leaf-900",
  muted: "bg-gray-100 text-gray-700",
  danger: "bg-red-50 text-red-700",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}
