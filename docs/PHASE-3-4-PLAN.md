# Phase 3 + 4: SEO layer finish, then Admin + real catalog

**Branch:** `phase-3-4-seo-admin` (cut from `phase-1-foundation`).
**Goal:** the owner can log in to a private dashboard, create categories and products with photos, and the public storefront reads them from PostgreSQL. SEO foundations are finished and measured.
**Not in this phase:** cart, checkout, payments, Bosta (Phases 5-7).

Work is split into small parts. Each part is one commit and leaves the app building.

---

## Part A: SEO layer finish (Phase 3)

Most basics already exist (metadata, JSON-LD, sitemap, robots, breadcrumbs). What is left:

| # | Task | Done when |
|---|------|-----------|
| A1 | `Redirect` table wired into `next.config` / proxy: old sedrakids.com-style URLs map 301 to new URLs | A test old URL returns 301 to the right new page |
| A2 | Canonical + `noindex` rules for filter/sort variants, cart, admin, search | Verified in page source |
| A3 | Per-page metadata review: unique title and description, OG image, Arabic `og:locale` | No duplicate titles across the site |
| A4 | `llms.txt`-free basics: `humans`-style brand page text for "سيدرا كيدز" (About page) to reinforce the brand query | `/about` indexable with Organization schema link |
| A5 | Lighthouse CI run on home, collection, product at 375px | Perf >= 95, SEO = 100, a11y >= 95 recorded in `docs/` |
| A6 | Wide-desktop and tablet visual pass | No layout breaks at 1280 / 1440 |

## Part B: Database becomes the source of truth

| # | Task |
|---|------|
| B1 | Finalize Prisma schema for catalog: product SEO fields (`seoTitle`, `seoDescription`, `slug`), image `alt`, `position`, variant `sku` unique, soft publish status (`DRAFT` / `ACTIVE` / `ARCHIVED`) |
| B2 | New migration + seed that loads the categories and the **real product photos from `data/`** (140 images) with **placeholder prices**, see "Data strategy and owner handoff" below. The 12 mock products are dropped |
| B3 | Rewrite `features/catalog/queries.ts` to read via Prisma (same function signatures, so pages do not change) |
| B4 | Caching: `cacheComponents` + `cacheTag("products")` / `cacheTag("category:slug")`, with `revalidateTag` on every admin write, so pages stay static-fast but update instantly |
| B5 | Delete `mock.ts` once the seed covers it |

## Part C: Admin foundation

| # | Task |
|---|------|
| C1 | Auth.js (credentials), one `ADMIN` role, password hashed with argon2/bcrypt, rate-limited login, session cookie httpOnly + secure |
| C2 | Admin is served only on **`admin.sedrakidsegypt.com`** (same codebase, host-based routing in `proxy`); the main domain returns 404 for `/admin`. Everything admin is `noindex`, excluded from sitemap and robots-blocked. Production adds a Cloudflare Access gate in front of the login |
| C3 | Admin shell (Arabic RTL, simple sidebar on desktop, bottom nav on mobile): Dashboard, Products, Categories, Settings |
| C4 | Create the owner account through a one-off script reading email + password from env (never committed, never typed in chat) |

## Part D: Catalog management

| # | Task |
|---|------|
| D1 | Categories CRUD (name, slug, intro, SEO fields, age band, gender, order) |
| D2 | Products list: search, filter by category/status, pagination |
| D3 | Product form: name, slug (auto from Arabic with manual override), description, material, category, status, SEO fields, live preview of search snippet |
| D4 | Variants editor: size, color, SKU, price (entered in EGP, stored in piastres), compare-at price, stock |
| D5 | Image upload: drag/drop, multiple, reorder, alt text; server-side resize to WebP/AVIF sizes; first image is the LCP image |
| D6 | Server Actions with zod validation, permission check on every action, `revalidateTag` after write |
| D7 | Bulk actions: publish/unpublish, change price by %, mark out of stock |
| D8 | One-click "out of stock" toggle per variant and per product (page stays live and indexable, shows "غير متاح حالياً") |
| D9 | Delete product = soft delete (recoverable) + automatic 301 to its category if it was published |
| D10 | Hide/unhide category without deleting; all-categories list with product counts |

Full admin requirements live in `PLAN.md` section 9d.

## Part E: Hardening and handoff

| # | Task |
|---|------|
| E1 | Tests: unit tests for price/slug helpers, integration tests for the main admin actions |
| E2 | Error and empty states, optimistic UI where cheap, loading skeletons |
| E3 | Backup note: how to dump/restore Postgres; `.env.example` updated |
| E4 | Update `PLAN.md` to the Sedra Kids brand and palette |
| E5 | Final run: build, lint, typecheck, Lighthouse, manual test of the full create-product-to-live-page flow |

---

## Part G: Orders and statistics (owner access)

The owner sees every order with the customer's data, and a statistics dashboard. Full requirements: `PLAN.md` section 9d. Real orders only exist after Phase 5 (checkout), so in this phase we build the screens against sample orders; they fill with real data as soon as checkout goes live.

| # | Task |
|---|------|
| G1 | Prisma: make sure `Order`, `OrderItem` (price snapshot), customer fields (name, phone, address, governorate, notes), `status` history and internal notes are modeled; add an `AuditLog` table for customer-data views/exports |
| G2 | Orders list: search (name, phone, order number), filters (date, status, payment, governorate), pagination |
| G3 | Order detail page: customer data, items, totals, payment, status history, internal notes, status change, print view |
| G4 | CSV/Excel export of orders (admin only, logged) |
| G5 | Statistics dashboard: orders, revenue, average order value, top products, sales by category/age band/brand line, by governorate and payment method, new vs returning customers, low-stock alerts, date range filter |
| G6 | Sample-order seed (dev only) to test G2-G5; removed before launch |
| G7 | Link to Google Search Console for search and traffic data (no custom tracking of personal data) |

## Data strategy and owner handoff

**Decision:** we do not wait for the price sheet. The developer uploads the real photos now and uses **random placeholder prices**. The **company owner** receives the admin and sets the real prices, sizes, stock and names himself.

**Developer side (this phase)**
- Import the 140 photos from `data/` (5 folders = 5 category groups: baby 6m-2y, kids 3-8, 9-14, HE 11-16, SHE 11-16). Group photos into products by the code printed on each image (e.g. "MODEL: 102"); the grouping is shown to the owner for confirmation, not assumed.
- Process images: strip nothing from the originals, create WebP/AVIF sizes, keep the code/size text out of the storefront crop when clean originals are not available.
- Each imported product gets: placeholder price, placeholder sizes taken from the image text (e.g. "3Y to 8Y"), stock 0 or a dummy value, and a **`needsReview` flag**.

**Safety rule (important):** placeholder prices must never go live by accident.
- Imported products are created as **DRAFT** with `needsReview = true`.
- The admin refuses to publish a product while `needsReview` is true or its price is still a placeholder; publishing clears the flag only after the owner confirms the price.
- A dashboard counter shows "X products still need price/size review".
- Before launch, a check confirms zero products are DRAFT-with-placeholder on the public site and in the sitemap.
- During development the storefront only shows these products on local/staging, never on the production domain.

**Owner side (handoff)**
- A second admin account is created for the owner (his own email, password set by him on first login, not shared in chat). The developer account stays for support and can be removed later.
- The admin UI is Arabic, simple, and designed for non-technical use (big buttons, clear labels, confirmations before destructive actions).
- Owner tasks: set price and compare-at price, confirm sizes and stock per size, rename products, choose category, publish, mark out of stock, add/remove products and categories.
- A short Arabic user guide (one page with screenshots) is delivered with the admin.

New tasks:
| # | Task |
|---|------|
| F1 | Image import script: reads `data/`, groups by product code, writes products as DRAFT + `needsReview` with placeholder prices, generates optimized images |
| F2 | `needsReview` flag + publish guard + "needs review" counter in the admin |
| F3 | Owner account creation flow (invite or one-off script), forced password change on first login |
| F4 | One-page Arabic admin guide for the owner |
| F5 | Pre-launch check: no placeholder price or DRAFT product reachable publicly |

## Decisions needed from the owner

1. **Domain name** (canonicals, sitemap, Search Console). Can be a placeholder for now.
2. **Image storage:** Cloudflare R2 (recommended: cheap, no egress fee), Cloudinary (easiest, built-in resizing), or local disk for development only.
3. **Hosting + production database** (affects Part B/E only): e.g. VPS with Docker, or Vercel + managed Postgres. Needed by Phase 8, but it shapes the image-storage choice.
4. **Owner admin email** (the password is set locally through env, not shared).
5. **Real products:** no longer blocking. Photos are imported with placeholder prices; the owner sets real prices, sizes and stock in the admin (see "Data strategy and owner handoff").
6. **Confirm sizes:** age range per band and the real older-kids sizes (currently assumed 8/10/12/14).
7. **Old-site URLs** worth redirecting (I can extract the list from sedrakids.com myself if you approve).
8. **Hi-res logo or SVG** (current one is low-res).

## Definition of done

- Owner logs in at `/admin`, creates a product with photos and sizes, and sees it live on the storefront within seconds.
- Storefront has no mock data left.
- Lighthouse mobile: Performance >= 95, SEO 100, Accessibility >= 95.
- Old URLs redirect 301. Admin, cart and filter variants are noindex.
- Build, lint, typecheck all pass.
