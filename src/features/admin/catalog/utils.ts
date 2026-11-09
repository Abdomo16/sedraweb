/** Arabic-Indic and Persian digits to plain ASCII, so "٣٧٥" or "375" both work. */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫،]/g, ".");
}

/** "375" or "٣٧٥٫٥" (EGP) to piastres, or null when it is not a valid positive amount. */
export function parseEgp(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") return null;
  const n = Number(normalizeDigits(String(input)).trim());
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return null;
  return Math.round(n * 100);
}

export function parseInteger(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") return null;
  const n = Number(normalizeDigits(String(input)).trim());
  return Number.isInteger(n) ? n : null;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Latin, lower-case, hyphen separated. Returns "" when nothing usable is left. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function emptyToNull(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  return v ? v : null;
}

/** Piastres to an EGP string for form fields: 37500 -> "375". */
export function egpString(piastres: number | null | undefined): string {
  if (piastres === null || piastres === undefined) return "";
  return String(piastres / 100);
}
