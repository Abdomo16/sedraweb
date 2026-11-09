"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import type { Variant } from "@/features/catalog/types";

/** Size picker + sticky buy bar. Cart wiring arrives in Phase 5. */
export function PurchasePanel({ variants }: { variants: Variant[] }) {
  const [sku, setSku] = useState<string | null>(null);
  const [note, setNote] = useState(false);
  const selected = variants.find((v) => v.sku === sku);
  const shown = selected ?? variants.reduce((a, b) => (a.price <= b.price ? a : b));

  return (
    <>
      <Price price={shown.price} compareAt={shown.compareAtPrice} className="text-2xl" />

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-bold">المقاس</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const out = v.stock === 0;
            const active = v.sku === sku;
            return (
              <button
                key={v.sku}
                type="button"
                disabled={out}
                aria-pressed={active}
                onClick={() => {
                  setSku(v.sku);
                  setNote(false);
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

      {note ? (
        <p role="status" className="rounded-card bg-sand-100 mt-3 p-3 text-sm">
          الطلب هيتفعل قريباً. دي نسخة تجريبية من التصميم.
        </p>
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
            onClick={() => (selected ? setNote(true) : setNote(false))}
            disabled={!selected}
          >
            {selected ? "أضف للسلة" : "اختار المقاس"}
          </Button>
        </div>
      </div>
    </>
  );
}
