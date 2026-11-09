"use client";

import { CartContents } from "./CartContents";

export function CartPageView() {
  return (
    <div className="shadow-soft mx-auto flex min-h-[28rem] max-w-2xl flex-col overflow-hidden rounded-3xl bg-white/70">
      <CartContents compact={false} />
    </div>
  );
}
