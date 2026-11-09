"use client";

import { useEffect, useMemo, useState } from "react";
import { recentProducts, removeLine, setQty, useCartLines } from "./store";
import type { StorefrontCart } from "./types";

type Result = { key: string; data: StorefrontCart | null; failed: boolean };

/**
 * Loads live names, prices and stock for what is in the cart (only while `enabled`),
 * and tidies the cart: sizes that are no longer sold are removed and quantities above
 * the available stock are lowered.
 */
export function useCartData(enabled: boolean) {
  const lines = useCartLines();
  const key = useMemo(() => JSON.stringify(lines), [lines]);
  const [result, setResult] = useState<Result | null>(null);
  const [lastData, setLastData] = useState<StorefrontCart | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/storefront/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, recent: recentProducts() }),
    })
      .then((r) =>
        r.ok ? (r.json() as Promise<StorefrontCart>) : Promise.reject(new Error("bad")),
      )
      .then((next) => {
        if (cancelled) return;
        setResult({ key, data: next, failed: false });
        setLastData(next);
        const messages: string[] = [];
        for (const id of next.missing) {
          removeLine(id);
          messages.push("اتشال من السلة منتج لم يعد متاحاً.");
        }
        for (const line of next.lines) {
          if (line.stock > 0 && line.qty > line.stock) {
            setQty(line.variantId, line.stock);
            messages.push(
              `المتاح من ${line.name} (مقاس ${line.size}) ${line.stock} قطعة، عدّلنا الكمية.`,
            );
          }
        }
        if (messages.length) setNotice([...new Set(messages)].join(" "));
      })
      .catch(() => {
        if (!cancelled) setResult({ key, data: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
    // `key` covers `lines`; refetch whenever the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  return {
    lines,
    // Keep showing the previous answer while a newer one loads (no flicker on quantity changes).
    data: result?.data ?? lastData,
    loading: enabled && result?.key !== key,
    failed: result?.key === key && result.failed,
    notice,
    clearNotice: () => setNotice(null),
  };
}
