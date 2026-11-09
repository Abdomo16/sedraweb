/**
 * Small in-memory limiter for login attempts. It is per server process, which is
 * enough for a single VPS; Cloudflare adds a second layer in production.
 */
type Entry = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, Entry>();

function entry(key: string): Entry | undefined {
  const e = failures.get(key);
  if (e && e.resetAt < Date.now()) {
    failures.delete(key);
    return undefined;
  }
  return e;
}

export function isBlocked(...keys: string[]): boolean {
  return keys.some((k) => (entry(k)?.count ?? 0) >= MAX_FAILURES);
}

export function recordFailure(...keys: string[]) {
  for (const k of keys) {
    const e = entry(k);
    if (e) e.count += 1;
    else failures.set(k, { count: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

export function clearFailures(...keys: string[]) {
  for (const k of keys) failures.delete(k);
}
