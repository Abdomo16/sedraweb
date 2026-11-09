import { env } from "@/lib/env";
import type { ProductStatus } from "./types";

/** DRAFT products only show when SHOW_DRAFT_PRODUCTS=true (local development). */
export function visibleStatuses(): ProductStatus[] {
  return env.SHOW_DRAFT_PRODUCTS ? ["ACTIVE", "DRAFT"] : ["ACTIVE"];
}
