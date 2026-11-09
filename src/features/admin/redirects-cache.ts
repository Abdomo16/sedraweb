import { db } from "@/lib/db";

/**
 * In-memory copy of the Redirect table for the proxy, so retired URLs answer with
 * a real HTTP 308 + Location header (a redirect thrown inside a cached page has
 * no Location header, which search engines cannot follow). The table is small;
 * it is reloaded at most every 15 seconds, so admin changes apply almost at once.
 */
const TTL_MS = 15_000;

let map = new Map<string, string>();
let loadedAt = 0;
let loading: Promise<void> | null = null;

async function load() {
  try {
    const rows = await db.redirect.findMany({ select: { fromPath: true, toPath: true } });
    map = new Map(rows.map((r) => [r.fromPath, r.toPath]));
  } catch {
    // Keep the previous copy if the database is briefly unavailable.
  }
  loadedAt = Date.now();
}

export async function findRedirect(pathname: string): Promise<string | undefined> {
  if (Date.now() - loadedAt > TTL_MS) {
    loading ??= load().finally(() => {
      loading = null;
    });
    // First call waits for the data; later refreshes happen in the background.
    if (loadedAt === 0) await loading;
  }
  return map.get(pathname.replace(/\/+$/, "") || "/");
}
