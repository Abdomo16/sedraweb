"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { openCart, useCartCount } from "@/features/cart/store";

/**
 * Opens the cart drawer. Without JavaScript (or with a modified click) it is a normal
 * link to /cart, so the cart is always reachable.
 */
export function CartButton({
  className,
  children,
  badgeClassName = "",
}: {
  className: string;
  children: ReactNode;
  badgeClassName?: string;
}) {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count ? `السلة، ${count.toLocaleString("ar-EG")} منتج` : "السلة"}
      className={`relative ${className}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        openCart();
      }}
    >
      {children}
      {count > 0 ? (
        <span
          key={count}
          aria-hidden="true"
          className={`badge-pop bg-sun-400 text-leaf-900 absolute -end-1 -top-1 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-5 font-bold ${badgeClassName}`}
        >
          {count > 99 ? "99+" : count.toLocaleString("ar-EG")}
        </span>
      ) : null}
    </Link>
  );
}
