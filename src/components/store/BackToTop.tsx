"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { mobileBottomNav } from "@/config/home";

function subscribe(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const past = () => window.scrollY > 900;

/** Phone-only round button that appears after a long scroll and jumps back to the top. */
export function BackToTop() {
  const show = useSyncExternalStore(subscribe, past, () => false);
  const pathname = usePathname();
  // Pages with their own bottom bar (product, cart, checkout) don't need it.
  if (!show || /^\/(products|cart|checkout|order)/.test(pathname)) return null;
  return (
    <button
      type="button"
      aria-label="العودة لأعلى الصفحة"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`tap bg-leaf-900 fixed end-4 ${mobileBottomNav ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"} z-20 flex size-11 items-center justify-center rounded-xl text-white shadow-[0_10px_22px_-10px_rgb(36_63_23/0.7)] md:hidden`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 14 6-6 6 6" />
      </svg>
    </button>
  );
}
