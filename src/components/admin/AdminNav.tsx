"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icons";
import { usePendingOrders } from "./PendingOrdersProvider";

const items: { href: string; label: string; icon: IconName; exact?: boolean; badge?: boolean }[] = [
  { href: "/admin", label: "الرئيسية", icon: "home", exact: true },
  { href: "/admin/orders", label: "الطلبات", icon: "truck", badge: true },
  { href: "/admin/products", label: "المنتجات", icon: "bag" },
  { href: "/admin/categories", label: "الأقسام", icon: "grid" },
  { href: "/admin/shipping", label: "الشحن", icon: "return" },
];

export function AdminNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  const pending = usePendingOrders();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const badge = (show?: boolean) =>
    show && pending > 0 ? (
      <span
        aria-label={`${pending} طلب محتاج تأكيد`}
        className="bg-sun-400 text-leaf-900 absolute -end-2 -top-1.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-5 font-bold"
      >
        {pending > 99 ? "99+" : pending.toLocaleString("ar-EG")}
      </span>
    ) : null;

  if (variant === "bottom") {
    return (
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={isActive(i.href, i.exact) ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
                isActive(i.href, i.exact) ? "text-leaf-700" : "text-leaf-900/75"
              }`}
            >
              <span className="relative">
                <Icon name={i.icon} className="size-6" />
                {badge(i.badge)}
              </span>
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
            <span className="relative">
              <Icon name={i.icon} className="size-5" />
              {badge(i.badge)}
            </span>
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
