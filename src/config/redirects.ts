/**
 * Permanent (308) redirects for URLs that existed on the old sedrakids.com
 * site, so links and rankings carry over to the new URLs.
 *
 * These only take effect on a request that reaches THIS app, so they matter
 * once sedrakids.com itself is pointed at this server (for example if the
 * old domain is acquired after the old site is deleted).
 *
 * `source` supports Next.js path patterns. Redirects created from the admin
 * (for example when a published product is deleted) are stored in the
 * database and added in Phase 4.
 */
export type LegacyRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

export const legacyRedirects: LegacyRedirect[] = [
  // Old collections ("بيبي" / "وسط" / "محير") to the new age + gender collections.
  { source: "/collections/Colecton-baby", destination: "/collections/baby-girls", permanent: true },
  { source: "/collections/Baby-boy", destination: "/collections/baby-boys", permanent: true },
  { source: "/collections/Kids-girl", destination: "/collections/girls", permanent: true },
  { source: "/collections/Kids-boy", destination: "/collections/boys", permanent: true },
  { source: "/collections/Goog-girl", destination: "/collections/older-girls", permanent: true },
  { source: "/collections/god-boy", destination: "/collections/older-boys", permanent: true },
  // "He & She" and the seasonal collection have no dedicated page yet.
  { source: "/collections/He-she", destination: "/collections", permanent: true },
  { source: "/collections/isdal-ramdan", destination: "/collections", permanent: true },
  { source: "/search", destination: "/collections", permanent: true },
];
