"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCartOpen } from "@/features/cart/store";

// The drawer code is only downloaded the first time someone opens the cart.
const CartDrawer = dynamic(() => import("./CartDrawer"));

export function CartDrawerHost() {
  const open = useCartOpen();
  const [wanted, setWanted] = useState(false);
  // Once opened, keep it mounted so closing animates and reopening is instant.
  if (open && !wanted) setWanted(true);
  return wanted ? <CartDrawer /> : null;
}
