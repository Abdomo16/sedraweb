"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const PendingContext = createContext(0);

export const usePendingOrders = () => useContext(PendingContext);

const BASE_TITLE = "لوحة التحكم | سيدرا كيدز";

/**
 * Keeps the "needs confirmation" count fresh (every 30 seconds while the tab is visible),
 * shows it on the menu badge and in the browser tab title, so new orders are noticed
 * even when the admin is open in the background.
 */
export function PendingOrdersProvider({
  initial,
  children,
}: {
  initial: number;
  children: ReactNode;
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    let stopped = false;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/admin/api/orders/pending", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!stopped) setCount(data.count);
      } catch {
        // offline: keep the last number
      }
    }
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    document.title = count > 0 ? `(${count}) طلب محتاج تأكيد | ${BASE_TITLE}` : BASE_TITLE;
  }, [count]);

  return <PendingContext value={count}>{children}</PendingContext>;
}
