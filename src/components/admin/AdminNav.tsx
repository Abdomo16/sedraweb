"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icons";

const items: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "الرئيسية", icon: "home", exact: true },
  { href: "/admin/products", label: "المنتجات", icon: "bag" },
  { href: "/admin/categories", label: "الأقسام", icon: "grid" },
];

export function AdminNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "bottom") {
    return (
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={isActive(i.href, i.exact) ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold ${
                isActive(i.href, i.exact) ? "text-leaf-700" : "text-leaf-900/75"
              }`}
            >
              <Icon name={i.icon} className="size-6" />
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-1">
      {items.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            aria-current={isActive(i.href, i.exact) ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
              isActive(i.href, i.exact)
                ? "bg-leaf-700 text-white"
                : "text-leaf-900 hover:bg-leaf-100"
            }`}
          >
            <Icon name={i.icon} className="size-5" />
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
