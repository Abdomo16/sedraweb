/**
 * Permanent (308) redirects for URLs that existed on the old sedrakids.com
 * site, so links and rankings carry over to the new URLs.
 *
 * `source` supports Next.js path patterns, e.g. "/product/:slug".
 * Redirects created from the admin (for example when a published product is
 * deleted) are stored in the database and added in Phase 4.
 */
export type LegacyRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

export const legacyRedirects: LegacyRedirect[] = [];
