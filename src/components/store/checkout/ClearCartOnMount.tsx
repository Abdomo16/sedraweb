"use client";

import { useEffect } from "react";
import { clearCart } from "@/features/cart/store";

/** The order is saved: empty the cart and forget the checkout attempt. */
export function ClearCartOnMount() {
  useEffect(() => {
    clearCart();
    try {
      window.sessionStorage.removeItem("sedra-checkout-key");
    } catch {
      // ignore
    }
  }, []);
  return null;
}
