import type { ReactNode } from "react";

const widths = {
  /** Browsing pages: grows with big screens so photos can be large. */
  wide: "max-w-5xl lg:max-w-[88rem] lg:px-8",
  /** Forms and reading pages: stay comfortable to read. */
  narrow: "max-w-5xl",
} as const;

export function Container({
  children,
  className = "",
  size = "wide",
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof widths;
}) {
  return <div className={`mx-auto w-full px-4 ${widths[size]} ${className}`}>{children}</div>;
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
      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
        tone === "sun" ? "text-leaf-900 bg-white" : "bg-leaf-900 text-white"
      }`}
    >
      {children}
    </span>
  );
}
