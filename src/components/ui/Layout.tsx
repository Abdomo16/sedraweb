import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-5xl px-4 ${className}`}>{children}</div>;
}

export function SectionHeading({
  title,
  action,
  as: Tag = "h2",
}: {
  title: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <Tag className="font-display text-leaf-900 text-2xl leading-9 font-extrabold">{title}</Tag>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "sun" }: { children: ReactNode; tone?: "sun" | "leaf" }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
        tone === "sun" ? "bg-sun-400 text-leaf-900" : "bg-leaf-700 text-white"
      }`}
    >
      {children}
    </span>
  );
}
