"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { formatEgp } from "@/components/ui/Price";
import { closeCart, removeLine, setQty } from "@/features/cart/store";
import type { CartLineView, MiniProduct } from "@/features/cart/types";
import { useCartData } from "@/features/cart/useCartData";

function ShippingBar({ subtotal, freeOver }: { subtotal: number; freeOver: number | null }) {
  if (freeOver === null || subtotal === 0) return null;
  const left = Math.max(freeOver - subtotal, 0);
  const pct = Math.min(100, Math.round((subtotal / freeOver) * 100));
  return (
    <div className="bg-sun-100 rounded-2xl p-3">
      <p className="text-leaf-900 text-sm font-bold">
        {left > 0 ? `فاضل لك ${formatEgp(left)} عشان الشحن يبقى مجاني` : "الشحن مجاني على طلبك"}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="التقدم نحو الشحن المجاني"
        className="mt-2 h-2 overflow-hidden rounded-full bg-white"
      >
        <div
          className="bg-sun-500 h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LineRow({ line, qty }: { line: CartLineView; qty: number }) {
  const soldOut = line.stock === 0;
  return (
    <li className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <Link
        href={`/products/${line.slug}`}
        onClick={closeCart}
        className="bg-leaf-50 relative block h-28 w-[5.25rem] shrink-0 overflow-hidden rounded-xl"
      >
        {line.image ? (
          <Image
            src={line.image.url}
            alt={line.image.alt}
            fill
            sizes="84px"
            className="object-cover"
          />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${line.slug}`}
          onClick={closeCart}
          className="line-clamp-2 text-sm leading-6 font-bold"
        >
          {line.name}
        </Link>
        <p className="text-ink/75 mt-0.5 text-xs">
          المقاس: {line.size}
          {line.color ? ` · ${line.color}` : ""}
        </p>
        <p className="text-leaf-900 mt-1 text-sm font-bold">
          {formatEgp(line.price)}
          {line.compareAt ? (
            <s className="text-ink/70 ms-2 text-xs font-normal">{formatEgp(line.compareAt)}</s>
          ) : null}
        </p>
        {soldOut ? (
          <p role="status" className="mt-1 text-xs font-bold text-red-700">
            خلص من المخزون، شيله من السلة عشان تكمّل.
          </p>
        ) : line.stock <= 5 ? (
          <p className="mt-1 text-xs font-bold text-amber-700">
            فاضل {line.stock.toLocaleString("ar-EG")} بس
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          {soldOut ? (
            <span />
          ) : (
            <div className="border-leaf-700/25 flex items-center rounded-full border bg-white">
              <button
                type="button"
                aria-label="تقليل الكمية"
                onClick={() => setQty(line.variantId, qty - 1)}
                className="flex size-9 items-center justify-center text-lg font-bold"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-bold" aria-live="polite">
                {qty.toLocaleString("ar-EG")}
              </span>
              <button
                type="button"
                aria-label="زيادة الكمية"
                disabled={qty >= line.stock}
                onClick={() => setQty(line.variantId, qty + 1)}
                className="flex size-9 items-center justify-center text-lg font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => removeLine(line.variantId)}
            className="text-ink/75 text-xs font-bold underline underline-offset-4 hover:text-red-700"
          >
            إزالة
          </button>
        </div>
      </div>
    </li>
  );
}

function MiniCarousel({ items }: { items: MiniProduct[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
      {items.map((p) => (
        <li key={p.slug} className="w-32 shrink-0 snap-start">
          <Link href={`/products/${p.slug}`} onClick={closeCart} className="block">
            <div className="bg-leaf-50 relative aspect-[3/4] overflow-hidden rounded-xl">
              {p.image ? (
                <Image
                  src={p.image.url}
                  alt={p.image.alt}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 font-bold">{p.name}</p>
            <p className="text-leaf-900 text-xs font-bold">{formatEgp(p.price)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The cart itself, shared by the slide-in drawer and the /cart page.
 * `compact` is the drawer: it also shows suggestions and recently viewed items.
 */
export function CartContents({ compact }: { compact: boolean }) {
  const { lines, data, loading, failed, notice, clearNotice } = useCartData(true);
  const [tab, setTab] = useState<"suggestions" | "recent">("suggestions");

  const qtyOf = (id: string) => lines.find((l) => l.variantId === id)?.qty ?? 0;
  const views = (data?.lines ?? []).filter((l) => qtyOf(l.variantId) > 0);
  const available = views.filter((l) => l.stock > 0);
  const subtotal = available.reduce((n, l) => n + l.price * qtyOf(l.variantId), 0);
  const blocked = views.length === 0 || views.some((l) => l.stock === 0);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="bg-leaf-100 text-leaf-700 flex size-16 items-center justify-center rounded-full">
          <Icon name="bag" className="size-8" />
        </span>
        <p className="font-display text-leaf-900 text-xl font-extrabold">السلة فاضية</p>
        <p className="text-ink/75 text-sm">ابدأ التسوق وضيف المنتجات اللي تعجبك.</p>
        <ButtonLink href="/collections" onClick={closeCart}>
          تسوّق دلوقتي
        </ButtonLink>
      </div>
    );
  }

  const shown =
    tab === "recent" && (data?.recent.length ?? 0) > 0 ? data!.recent : (data?.suggestions ?? []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {data ? <ShippingBar subtotal={subtotal} freeOver={data.freeOver} /> : null}

        {notice ? (
          <p
            role="status"
            className="bg-sun-100 text-leaf-900 mt-3 rounded-2xl px-3 py-2 text-xs font-bold"
            onClick={clearNotice}
          >
            {notice}
          </p>
        ) : null}
        {failed ? (
          <p
            role="alert"
            className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
          >
            تعذّر تحديث السلة. تأكد من الإنترنت وجرّب تاني.
          </p>
        ) : null}

        {!data && loading ? (
          <div className="mt-3 grid gap-3" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="bg-leaf-50 h-32 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <ul className="mt-3 grid gap-3">
            {views.map((l) => (
              <LineRow key={l.variantId} line={l} qty={qtyOf(l.variantId)} />
            ))}
          </ul>
        )}

        {compact && data && (data.suggestions.length > 0 || data.recent.length > 0) ? (
          <section aria-label="اقتراحات" className="mt-6">
            <div
              role="tablist"
              className="border-leaf-700/15 flex gap-4 border-b text-sm font-bold"
            >
              {(
                [
                  ["suggestions", "قد يعجبك"],
                  ["recent", "شاهدته مؤخراً"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`-mb-px border-b-2 pb-2 ${
                    tab === id ? "border-leaf-700 text-leaf-900" : "text-ink/70 border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              {shown.length ? (
                <MiniCarousel items={shown} />
              ) : (
                <p className="text-ink/70 text-xs">لسه مفيش منتجات هنا.</p>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <div className="border-leaf-700/10 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold">إجمالي المنتجات</span>
          <span className="font-display text-leaf-900 text-xl font-extrabold">
            {formatEgp(subtotal)}
          </span>
        </div>
        <p className="text-ink/70 mt-1 text-xs">سعر الشحن بيتحدد في الخطوة الجاية حسب المحافظة.</p>
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-2" : ""}`}>
          {compact ? (
            <ButtonLink href="/cart" variant="ghost" size="lg" onClick={closeCart}>
              عرض السلة
            </ButtonLink>
          ) : null}
          <ButtonLink
            href={blocked ? "#" : "/checkout"}
            size="lg"
            aria-disabled={blocked}
            onClick={(e) => {
              if (blocked) e.preventDefault();
              else closeCart();
            }}
            className={blocked ? "pointer-events-none opacity-50" : ""}
          >
            إكمال الطلب
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
