"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { addLine, openCart } from "@/features/cart/store";
import type { Variant } from "@/features/catalog/types";

/** Size picker, quantity and the add-to-cart bar (sticky on phones). */
export function PurchasePanel({ variants }: { variants: Variant[] }) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const selected = variants.find((v) => v.id === variantId);
  const shown = selected ?? variants.reduce((a, b) => (a.price <= b.price ? a : b));
  const allOut = variants.every((v) => v.stock === 0);
  const max = selected?.stock ?? 1;

  function add() {
    if (!selected) return;
    addLine(selected.id, qty, selected.stock);
    setQty(1);
    openCart();
  }

  return (
    <>
      <Price price={shown.price} compareAt={shown.compareAtPrice} className="text-2xl" />

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-bold">المقاس</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const out = v.stock === 0;
            const active = v.id === variantId;
            return (
              <button
                key={v.id}
                type="button"
                disabled={out}
                aria-pressed={active}
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
                className={`disabled:text-ink/30 min-h-11 min-w-14 rounded-full border px-4 text-sm font-bold transition-colors disabled:line-through ${
                  active
                    ? "border-leaf-700 bg-leaf-700 text-white"
                    : "border-leaf-700/25 text-leaf-900 bg-white"
                }`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </fieldset>

      {selected ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-bold">الكمية</span>
          <div className="border-leaf-700/25 flex items-center rounded-full border bg-white">
            <button
              type="button"
              aria-label="تقليل الكمية"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-11 items-center justify-center text-lg font-bold disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-8 text-center font-bold" aria-live="polite">
              {qty.toLocaleString("ar-EG")}
            </span>
            <button
              type="button"
              aria-label="زيادة الكمية"
              disabled={qty >= max}
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="flex size-11 items-center justify-center text-lg font-bold disabled:opacity-30"
            >
              +
            </button>
          </div>
          {selected.stock <= 5 ? (
            <span className="text-xs font-bold text-amber-700">
              فاضل {selected.stock.toLocaleString("ar-EG")} بس
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="border-leaf-700/10 fixed inset-x-0 bottom-14 z-20 border-t bg-white/95 p-3 backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl items-center gap-3 md:max-w-none">
          <div className="min-w-0 flex-1 md:hidden">
            <Price price={shown.price} compareAt={shown.compareAtPrice} />
            <p className="text-ink/75 truncate text-xs">
              {selected ? `المقاس ${selected.size}` : "اختار المقاس"}
            </p>
          </div>
          <Button
            variant="sun"
            size="lg"
            className="flex-1 md:w-full md:flex-none"
            onClick={add}
            disabled={!selected}
          >
            {allOut ? "غير متاح حالياً" : selected ? "أضف للسلة" : "اختار المقاس"}
          </Button>
        </div>
      </div>
    </>
  );
}
