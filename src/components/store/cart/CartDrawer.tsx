"use client";

import { useEffect, useRef } from "react";
import { closeCart, useCartOpen } from "@/features/cart/store";
import { CartContents } from "./CartContents";

/** Slide-in cart. Uses the native <dialog>: focus stays inside, Escape and a tap outside close it. */
export default function CartDrawer() {
  const open = useCartOpen();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="سلة التسوق"
      className="cart-drawer bg-cream text-ink fixed inset-y-0 start-auto end-0 m-0 hidden h-dvh max-h-none w-[min(26rem,100vw)] flex-col p-0 open:flex"
      onClose={closeCart}
      onClick={(e) => {
        if (e.target === ref.current) closeCart();
      }}
    >
      <div className="border-leaf-700/10 flex items-center justify-between border-b bg-white px-4 py-3">
        <h2 className="font-display text-leaf-900 text-xl font-extrabold">سلة التسوق</h2>
        <button
          type="button"
          onClick={closeCart}
          aria-label="إغلاق"
          className="bg-leaf-100 text-leaf-900 hover:bg-leaf-500 flex size-10 items-center justify-center rounded-full text-xl font-bold transition-colors hover:text-white"
        >
          ×
        </button>
      </div>
      {open ? <CartContents compact /> : null}
    </dialog>
  );
}
