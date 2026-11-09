# Phase 4: Admin dashboard (auth + catalog management), SEO-first

**Goal:** the owner manages the whole catalog from a private dashboard: add or hide categories (for example a new "إسدالات" category), add products with photos, sizes, prices and stock, mark items out of stock, hide or delete products. Every change shows on the public site immediately and **never hurts SEO**.

**Top priority:** rank #1 for "سيدرا كيدز". Every admin feature below is designed so the owner cannot accidentally damage rankings.

## 1. Architecture decisions

| Topic | Decision | Why |
|---|---|---|
| Auth | Custom, no heavy library: scrypt password hashes (Node crypto), HMAC-signed httpOnly session cookie, `AUTH_SECRET` | Fewest dependencies, no compatibility risk with this Next.js version, fully auditable |
| Where admin runs | Same codebase, served on `admin.sedrakidsegypt.com` (host check in `src/proxy.ts`). The main domain returns 404 for `/admin`. Local dev: `/admin` works on localhost | Hidden from Google and bots; one codebase, one database |
| Data access | Every page and every Server Action calls `requireAdmin()` itself (the proxy is only a first, optimistic filter) | The proxy alone is never trusted |
| Writes | Server Actions with zod validation, then `updateTag(...)` so the public site updates at once | Read-your-own-writes, no manual cache clearing |
| Image upload | Route Handler `POST /admin/api/upload` (no 1 MB action limit): sharp resize (max 1600px), convert to WebP, strip metadata, unique SEO file name | Fast pages, safe files, image SEO |
| Image storage | `MEDIA_DIR` on the server disk, served at `/media/...` (Cloudflare caches in front) | Simple, enough for 500 products |
| UI | Arabic RTL, plain Tailwind, big touch targets, works on a phone | Owner will use it from a phone |

## 2. SEO guardrails built into the admin (rank #1 focus)

1. **Slugs are permanent.** Renaming a product or category slug automatically creates a 301 redirect old to new (stored in the `Redirect` table, consulted by the product and collection pages).
2. **Deleting or archiving a published product** creates a 301 to its category, so Google never meets a 404 and keeps the link value.
3. **Out of stock never removes the page.** It stays live and indexable, shows "غير متاح حالياً", and the structured data switches to OutOfStock.
4. **SEO title and description fields** on every product and category, with a live Google-style preview and character counters (title 60, description 155). Empty fields get good automatic defaults.
5. **Thin-content warning** when a category intro is under 80 characters.
6. **Image SEO:** alt text is required (auto-suggested from the product name); file names include the product slug.
7. **New categories and products appear in `sitemap.xml` immediately** with a real `lastmod`; draft and archived items never appear and are `noindex`.
8. **Imported products with placeholder prices cannot be published** until the owner confirms price and sizes.
9. **One URL per page** (canonical set everywhere), no duplicate content.
10. Brand lines such as "HE and SHE" keep their own brand in structured data.

## 3. Security

- scrypt hashing with random salt, constant-time comparison; no plain text anywhere.
- Login rate limit (5 failures per 15 minutes per email and per IP) with generic error messages.
- Cookie: httpOnly, SameSite=Strict, Secure in production, 7-day expiry, server-side user check on every request.
- Upload endpoint: admin only, same-origin only, 10 MB limit, real image decoding (not just the extension), random file names.
- Server Actions are same-origin by framework default, all inputs validated, all actions admin-only.
- Admin responses carry `X-Robots-Tag: noindex`, and `robots.txt` on the admin host disallows everything.
- Production rule: weak passwords are rejected by the account script (allowed on localhost only).

## 4. Work breakdown (each step builds and passes lint/typecheck)

**C: access**
- C1 `AUTH_SECRET`, `lib/auth` (hash, session, guard), login page, logout, rate limiting.
- C2 `src/proxy.ts` host logic and admin `robots`/noindex headers.
- C3 `npm run admin:create` script (reads `.env`, prompts for the password when not set).
- C4 Admin shell (sidebar on desktop, bottom bar on phone) and dashboard with counters.

**D: catalog management**
- D1 Upload endpoint and reusable image uploader (multiple files, reorder, delete, alt text).
- D2 Categories: list, add (for example إسدالات), edit, reorder, hide/show, cover image, delete when empty.
- D3 Products list: search, filter (category, status, stock), pagination, quick actions (out of stock, publish/hide).
- D4 Product form: name, slug, code, category, description, material, status, "new" flag, SEO fields, variants (size, color, price, compare-at price, stock), images.
- D5 Safe delete: archive (recoverable) or permanent delete with confirmation, automatic redirect.
- D6 Public side: redirect lookup in product and collection pages, `isActive` categories, sitemap `lastmod`, new pages render on demand.

**Later (separate steps in the master plan):** orders and statistics (Part G), owner account handoff and Arabic guide (F3, F4), tests and hardening (E).

## 5. Definition of done

- Owner logs in at the admin host, creates the category "إسدالات", adds a product with 3 photos, sizes, prices and stock, publishes it, and sees it on the site within seconds, in the menu, the category page, and `sitemap.xml`.
- Marking it out of stock keeps the page live; archiving it redirects to its category.
- Renaming a slug redirects the old URL.
- No admin URL is reachable from the main domain; wrong password attempts are limited.
- Build, lint and typecheck pass; Lighthouse for public pages stays at the current level.

## 6. Status (end of this work session)

**Done and verified in the browser and with curl**
- C1 to C4: login (scrypt + signed cookie, rate limit), `requireAdmin()` on every page and action, host routing in `src/proxy.ts`, `npm run admin:create`, admin shell and dashboard.
- D1 to D5: image upload (WebP, SEO file names), categories CRUD (add, edit, hide, delete when empty), products list with search/filters, product form (variants, prices in EGP, stock, images, SEO fields with live preview), out of stock, publish/hide, archive, delete.
- D6: hidden categories and their products leave the site and sitemap; new categories and products appear in the menu, the pages and `sitemap.xml` (with `lastmod`) at once; new URLs render on demand.
- SEO guardrails: renamed slugs and removed products answer with a real **HTTP 308 + Location** (done in the proxy from an in-memory copy of the `Redirect` table, because a redirect thrown inside a cached page carries no Location header); redirect chains are collapsed; out of stock keeps the page live with `OutOfStock` structured data; drafts stay `noindex`.

**Not done yet**
- Orders and statistics screens (Part G), tests (E), the owner account and the Arabic guide (F3, F4).
- Bulk actions (change prices by percentage, publish many at once).
- Cloudflare Access in front of the admin host (deployment step).

