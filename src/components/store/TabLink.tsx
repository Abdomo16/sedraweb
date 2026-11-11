"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Bottom tab with a highlighted pill behind the icon on the page you are on. */
export function TabLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`tap relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
        active ? "text-leaf-900" : "text-ink/55"
      }`}
    >
      {active ? (
        <span aria-hidden="true" className="bg-leaf-900 absolute inset-x-6 top-0 h-0.5 rounded-full" />
      ) : null}
      {children}
      {label}
    </Link>
  );
}
