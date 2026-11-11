"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icons";

export type MenuCategory = { slug: string; shortName: string; ageLabel?: string; image?: string };

const extra = [
  { href: "/collections/new", label: "وصل حديثاً" },
  { href: "/collections", label: "كل المنتجات" },
  { href: "/about", label: "من نحن" },
];

/**
 * Phones only: a menu button next to the logo. It drops a panel under the header with every
 * category (photo + age) and a few useful links. Closes on link tap, outside tap or Escape.
 */
export function MobileMenu({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const box = useRef<HTMLDivElement>(null);

  // Navigating to another page closes the menu (state derived from the path, no effect needed).
  if (open && openedAt !== null && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={box} className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "قفل القايمة" : "فتح قايمة الأقسام"}
        onClick={() => {
          setOpen((v) => !v);
          setOpenedAt(pathname);
        }}
        className="tap text-leaf-900 hover:bg-leaf-50 flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="menu-drop border-leaf-900/10 absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b bg-white shadow-[0_24px_40px_-24px_rgb(36_63_23/0.45)]"
        >
          <nav aria-label="الأقسام" className="px-4 pt-3 pb-4">
            <p className="text-ink/60 mb-2 text-xs font-bold">الأقسام</p>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/collections/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="tap hover:bg-leaf-50 border-leaf-900/10 flex items-center gap-2.5 rounded-xl border p-2"
                  >
                    <span className="bg-leaf-50 relative size-11 shrink-0 overflow-hidden rounded-lg">
                      {c.image ? (
                        <Image
                          src={c.image}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover object-[50%_12%]"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="text-leaf-900 block truncate text-sm font-bold">
                        {c.shortName}
                      </span>
                      {c.ageLabel ? (
                        <span className="text-ink/60 block truncate text-[11px]">{c.ageLabel}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="border-leaf-900/10 mt-3 grid border-t pt-2">
              {extra.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-leaf-900 hover:bg-leaf-50 flex min-h-11 items-center justify-between rounded-lg px-2 text-sm font-bold"
                  >
                    {l.label}
                    <Icon name="chevron" className="size-4 rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
