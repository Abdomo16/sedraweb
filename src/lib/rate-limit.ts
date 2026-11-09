/**
 * Tiny in-memory sliding-window limiter (per server process). Enough for one VPS;
 * Cloudflare rate limiting is the second layer in production.
 */
const hits = new Map<string, number[]>();

/** Returns true when the action is allowed, and records it. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
