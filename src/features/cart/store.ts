"use client";

import { useSyncExternalStore } from "react";

/**
 * Cart kept on the customer's device (localStorage), shared between tabs.
 * It only stores which size and how many. Names, prices and stock always come
 * from the server, and the server recalculates everything when the order is placed.
 */
export type CartLine = { variantId: string; qty: number };

const KEY = "sedra-cart-v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    if (Array.isArray(raw)) {
      lines = raw
        .filter(
          (l): l is CartLine =>
            typeof l?.variantId === "string" && Number.isInteger(l?.qty) && l.qty > 0,
        )
        .slice(0, 30);
    }
  } catch {
    lines = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      emit();
    }
  });
}

function emit() {
  for (const l of listeners) l();
}

function save(next: CartLine[]) {
  lines = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or full storage: the cart still works for this visit.
  }
  emit();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => {
  load();
  return lines;
};
const getServerSnapshot = () => EMPTY;

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  return useCartLines().reduce((n, l) => n + l.qty, 0);
}

/** Adds `qty` of a size, never going above `max` (the stock the page knows about). */
export function addLine(variantId: string, qty: number, max: number) {
  load();
  const current = lines.find((l) => l.variantId === variantId)?.qty ?? 0;
  const nextQty = Math.min(current + qty, Math.max(max, 1));
  const rest = lines.filter((l) => l.variantId !== variantId);
  save([...rest, { variantId, qty: nextQty }]);
}

export function setQty(variantId: string, qty: number) {
  load();
  if (qty <= 0) return removeLine(variantId);
  save(lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l)));
}

export function removeLine(variantId: string) {
  load();
  save(lines.filter((l) => l.variantId !== variantId));
}

export function clearCart() {
  load();
  save([]);
}

/* Drawer open/close state */
let open = false;
const uiListeners = new Set<() => void>();
const emitUi = () => {
  for (const l of uiListeners) l();
};
export function openCart() {
  open = true;
  emitUi();
}
export function closeCart() {
  open = false;
  emitUi();
}
export function useCartOpen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      uiListeners.add(cb);
      return () => uiListeners.delete(cb);
    },
    () => open,
    () => false,
  );
}

/* Recently viewed products (slugs), newest first */
const RECENT_KEY = "sedra-recent-v1";
export function rememberProduct(slug: string) {
  try {
    const raw = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
    const list = Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 12)),
    );
  } catch {
    // ignore
  }
}
export function recentProducts(): string[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}
