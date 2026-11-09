import { updateTag } from "next/cache";

/**
 * Expire the cached catalog data that an admin edit touched so the public site
 * shows the change immediately. Must be called from a Server Action.
 */
export function refreshCatalog(opts: { products?: string[]; categories?: string[] } = {}) {
  updateTag("catalog");
  updateTag("categories");
  updateTag("products");
  updateTag("redirects");
  for (const slug of new Set(opts.products ?? [])) updateTag(`product:${slug}`);
  for (const slug of new Set(opts.categories ?? [])) updateTag(`category:${slug}`);
}
