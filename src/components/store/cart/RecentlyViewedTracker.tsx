"use client";

import { useEffect } from "react";
import { rememberProduct } from "@/features/cart/store";

/** Remembers (on this device only) which products were opened, for "شاهدته مؤخراً". */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    rememberProduct(slug);
  }, [slug]);
  return null;
}
