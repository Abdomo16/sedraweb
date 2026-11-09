# Cedar Kids (سيدرا كيدز) — Project Plan

Kids homewear e-commerce, Egypt only, up to ~500 products, Arabic (RTL) only at launch.
**Top priority: SEO and speed.** Everything below is a plan; nothing is implemented yet.

---

## 1. Goals

1. Rank on page 1 for non-brand and brand queries (e.g. "ملابس منزلية أطفال", "بيجامات أطفال", "Cedar Kids").
2. Sections-based storefront: user browses sections, picks, pays.
3. Payments: **Cash on Delivery**, **Card (Visa/Mastercard)**, **Instant payment (InstaPay / wallets)**.
4. Shipping via **Bosta API** (create shipment, tracking, webhooks).
5. Private admin dashboard (owner + developer only) to manage products, orders, shipping, SEO fields.
6. Design: based on the existing reference site (URL pending), rebuilt as clean components and improved.

## 2. Stack

| Layer      | Choice                                                    | Why                                             |
| ---------- | --------------------------------------------------------- | ----------------------------------------------- |
| Framework  | Next.js (App Router) + TypeScript                         | SSG/ISR, Metadata API, best-in-class SEO + perf |
| Styling    | Tailwind CSS (logical properties for RTL)                 | Small CSS, consistent design tokens             |
| DB         | PostgreSQL (Neon or VPS) + Prisma                         | Typed, simple migrations                        |
| Auth       | Auth.js, admin only (credentials + 2FA later)             | Customers check out as guests                   |
| Images     | Cloudflare R2 / Cloudinary + `next/image` (AVIF/WebP)     | Fast LCP                                        |
| Validation | Zod (shared client/server)                                | One source of truth                             |
| Payments   | Paymob (cards + wallets + InstaPay if available) + COD    | Egypt-native                                    |
| Shipping   | Bosta REST API + webhooks                                 | Requested                                       |
| Email/SMS  | Resend (email), SMS/WhatsApp provider later               | Order confirmations                             |
| Hosting    | Vercel (or VPS + Docker) + CDN                            | Edge caching                                    |
| Monitoring | Sentry, Vercel Analytics / Plausible, Search Console, GA4 | Measure SEO + errors                            |
| Tests      | Vitest (unit), Playwright (e2e: checkout), Lighthouse CI  | Protect speed + checkout                        |

## 3. Folder structure

```
D:\sedar
├─ PLAN.md
├─ .env.example
├─ docker-compose.yml            # local Postgres
├─ next.config.ts                # image domains, headers, redirects
├─ tailwind.config.ts            # design tokens from reference site
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                    # categories, governorates, demo products
├─ public/
│  ├─ fonts/                     # self-hosted Arabic font subsets
│  └─ icons/ , og/               # favicon, manifest icons, default OG
├─ src/
│  ├─ app/
│  │  ├─ (store)/                # PUBLIC, indexable
│  │  │  ├─ layout.tsx           # header, footer, Organization schema
│  │  │  ├─ page.tsx             # Home (sections)
│  │  │  ├─ collections/
│  │  │  │  ├─ page.tsx          # all categories
│  │  │  │  └─ [slug]/page.tsx   # category/listing (ISR)
│  │  │  ├─ products/[slug]/page.tsx   # product page (ISR + Product schema)
│  │  │  ├─ blog/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [slug]/page.tsx   # guides: sizes, fabrics, gifts
│  │  │  ├─ about/ , contact/
│  │  │  ├─ policies/{shipping,returns,privacy,terms}/page.tsx
│  │  │  ├─ cart/page.tsx                  # noindex
│  │  │  ├─ checkout/page.tsx              # noindex
│  │  │  ├─ order/[id]/page.tsx            # noindex (confirmation)
│  │  │  └─ track/page.tsx                 # noindex (order tracking)
│  │  ├─ (admin)/admin/          # PRIVATE, noindex, auth-guarded
│  │  │  ├─ login/
│  │  │  ├─ page.tsx             # dashboard stats
│  │  │  ├─ products/ (list, new, [id])
│  │  │  ├─ categories/
│  │  │  ├─ orders/ ([id]: status, create Bosta shipment, print AWB)
│  │  │  ├─ shipping/            # rates per governorate
│  │  │  ├─ blog/
│  │  │  └─ settings/            # site SEO defaults, redirects
│  │  ├─ api/
│  │  │  ├─ webhooks/paymob/route.ts
│  │  │  ├─ webhooks/bosta/route.ts
│  │  │  ├─ revalidate/route.ts  # on-demand ISR (secret)
│  │  │  └─ upload/route.ts      # signed image upload
│  │  ├─ sitemap.ts              # dynamic: products, collections, blog
│  │  ├─ robots.ts
│  │  ├─ manifest.ts
│  │  ├─ not-found.tsx , error.tsx
│  │  └─ opengraph-image.tsx
│  ├─ components/
│  │  ├─ ui/                     # Button, Input, Badge, Modal (design system)
│  │  ├─ store/                  # ProductCard, Gallery, SizePicker, CartDrawer, sections
│  │  ├─ admin/                  # tables, forms, charts
│  │  └─ seo/                    # JsonLd, Breadcrumbs
│  ├─ features/                  # domain modules, each: queries, actions, schemas, types
│  │  ├─ catalog/
│  │  ├─ cart/                   # client store (cookie/localStorage) + server validation
│  │  ├─ checkout/
│  │  ├─ orders/                 # state machine
│  │  ├─ payments/               # provider-agnostic interface
│  │  ├─ shipping/               # provider-agnostic interface
│  │  ├─ blog/
│  │  └─ admin-stats/
│  ├─ integrations/
│  │  ├─ bosta/                  # client.ts, types.ts, mappers.ts, webhook.ts
│  │  ├─ paymob/                 # client.ts, hmac.ts, webhook.ts
│  │  └─ storage/                # R2/Cloudinary
│  ├─ lib/
│  │  ├─ db.ts , auth.ts , env.ts (zod-validated env)
│  │  ├─ seo/                    # metadata builders, schema generators, slugify
│  │  ├─ format.ts               # EGP, Arabic dates
│  │  └─ rate-limit.ts
│  ├─ config/
│  │  ├─ site.ts                 # name, URL, socials, defaults
│  │  └─ governorates.ts         # matches Bosta city/zone names
│  └─ styles/globals.css
├─ tests/
│  ├─ unit/ , e2e/               # checkout, admin product CRUD
│  └─ lighthouse/                # budgets
└─ docs/
   ├─ seo-checklist.md
   ├─ keywords.md                # keyword map: page → target query
   └─ runbook.md                 # deploy, env, webhooks
```

Rule: pages stay thin; logic lives in `features/*`; third parties are isolated in `integrations/*` behind interfaces so providers can be swapped.

## 4. Data model (Prisma, summary)

- `Category` (id, slug, name, description, parentId, image, seoTitle, seoDescription, sortOrder)
- `Product` (id, slug, name, description, categoryId, status, seoTitle, seoDescription, material, ageRange, createdAt)
- `ProductImage` (productId, url, alt, sortOrder)
- `Variant` (productId, sku, size, color, price, compareAtPrice, stock)
- `Order` (id, number, status, paymentMethod, paymentStatus, subtotal, shipping, total, customer name/phone/email, governorate, city, address, notes)
- `OrderItem` (orderId, variantId, name snapshot, price snapshot, qty)
- `Shipment` (orderId, provider, trackingNumber, status, awbUrl, codAmount, raw)
- `Payment` (orderId, provider, providerRef, amount, status, raw)
- `ShippingRate` (governorate, price, freeOver)
- `Post` (blog), `Redirect` (from, to, 301), `AdminUser`, `Setting`.

Order status machine: `PENDING → CONFIRMED → SHIPPED → DELIVERED`, plus `CANCELLED`, `RETURNED`. Stock is decremented on confirmation and restored on cancel/return. Prices are snapshotted on the order.

## 5. SEO strategy (the main focus)

### 5.1 Technical

- **Server-rendered / statically generated** pages with ISR; on-demand revalidation when admin edits a product.
- **URL design**: short, stable, lowercase Latin slugs: `/collections/girls-pajamas`, `/products/cotton-pajama-set-stars`. Arabic content in titles/H1/body.
- **One H1 per page**, logical heading hierarchy, semantic HTML.
- **Metadata API** for every page: unique `title` (≤60 chars) and `description` (≤155), canonical URL, Open Graph, Twitter, `lang="ar" dir="rtl"`.
- **Title templates**
  - Product: `{اسم المنتج} | {نوع القماش} للأطفال | سيدرا كيدز`
  - Collection: `{تصنيف} للأطفال – ملابس منزلية | سيدرا كيدز`
- **Structured data (JSON-LD)**: `Organization` + `WebSite` (sitelinks search), `BreadcrumbList` everywhere, `Product` + `Offer` (price EGP, availability, SKU, brand), `AggregateRating`/`Review` only when real reviews exist, `CollectionPage`/`ItemList`, `Article` for blog, `FAQPage` where genuine FAQs exist, `LocalBusiness` if a physical address exists.
- **sitemap.xml** generated from DB (products, collections, posts, static), with `lastmod`. **robots.txt** blocks `/admin`, `/cart`, `/checkout`, `/order`, `/track`, `/api`, and filter/sort query params.
- **Canonicals + noindex** for filter/sort/pagination variants (`?sort=`, `?size=`); clean pagination (`?page=2`) with self-canonical.
- **Redirect manager** (301s) in admin; custom 404 with category links; no soft-404s.
- **Out-of-stock products stay live** (marked `OutOfStock`), never deleted → keeps rankings. Discontinued → 301 to category.
- **Internal linking**: breadcrumbs, related products, "complete the set", category → blog guides → products, footer category links.
- **Image SEO**: descriptive filenames, mandatory `alt` field in admin, width/height set, AVIF/WebP, lazy-load below the fold, priority for LCP image.
- **HTTPS, www/non-www single canonical host, trailing-slash policy**, security headers.

### 5.2 Content (what actually ranks)

- `docs/keywords.md`: research Arabic queries (Egyptian + MSA variants: "بيجامة أطفال", "بجامة بناتي", "ملابس نوم أطفال قطن", "هوم وير أطفال") and map **one primary keyword per page**.
- Unique product descriptions (material, ages, sizes, care) — never copy supplier or old-site text.
- Category pages get 150–300 words of real intro copy + FAQ.
- Blog/guides targeting buying-intent searches: size guide, best fabric for kids sleepwear, summer vs winter pajamas, gift ideas, newborn sets.
- Size chart and shipping/return policy pages (also trust signals).
- Real reviews from day one (post-delivery review request).

### 5.3 Off-page / entity

- **Google Business Profile**, **Search Console** + sitemap submission, Bing Webmaster.
- Consistent brand name/NAP across social pages (Facebook, Instagram, TikTok) linking to the site.
- Backlinks: parenting blogs/groups, influencer gifting with links, local directories, press.
- **Old competing site**: new domain must differ; do not copy its content. Once it is deleted, nothing to redirect (not ours). Build brand-name signals (social profiles, GBP, mentions) so branded searches resolve to us.

### 5.4 Measurement

Search Console (queries, indexing, CWV), GA4/Plausible, rank tracking for the keyword map, monthly SEO review.

## 6. Performance plan

**Budgets (mobile, 4G):** LCP < 2.0s, INP < 200ms, CLS < 0.05, TTFB < 400ms, JS per page < 120KB gzip on storefront, Lighthouse ≥ 95 (Perf/SEO/A11y/Best Practices). Enforced by Lighthouse CI in CI.

- Server Components by default; client components only for cart, gallery, pickers. Admin code never ships to the storefront.
- ISR/SSG for home, collections, products, blog; cache tags + `revalidateTag` on admin edits.
- `next/image`: responsive `sizes`, AVIF, blur placeholders, `priority` only on LCP image.
- `next/font` with self-hosted Arabic subset (e.g. Cairo/Tajawal), `display: swap`, 1–2 weights.
- No heavy UI libs; Tailwind purged; icons as inline SVG.
- Third-party scripts (analytics, pixels) loaded `afterInteractive`/`lazyOnload`; Paymob loaded only on checkout.
- DB: indexes on `slug`, `categoryId`, `status`, `Order.number`; select only needed fields; pagination.
- CDN caching headers for static assets (immutable) and images; Brotli.
- Prefetch on hover for product links; skeleton-free layouts (reserve space → no CLS).

## 7. Checkout, payments, shipping

**Checkout (guest, one page, mobile-first):** name, phone, governorate/city/address → shipping fee by governorate → choose payment → confirm. Server recalculates prices/stock (never trust client).

**Payment methods**

1. **COD** — order created as `PENDING`, confirmed by WhatsApp/call or auto-confirm; Bosta collects cash.
2. **Card (Visa/Mastercard)** — Paymob hosted checkout/iframe; order confirmed only on **verified HMAC webhook**.
3. **Instant payment / wallets** — Paymob wallets (Vodafone Cash etc.). **InstaPay needs verification**: if the gateway doesn't expose it, fallback is manual transfer + receipt upload reviewed in admin. To confirm when choosing the provider.

**Bosta**: admin presses "Create shipment" → API call with customer data, address mapping, COD amount (0 if prepaid) → tracking number + AWB saved → webhook updates statuses (picked up, out for delivery, delivered, returned) → customer sees status on `/track`. API keys only in env; webhook secret verified; idempotent handlers.

## 8. Security

Zod validation on every input, rate limiting on checkout/login, CSRF-safe server actions, admin auth + optional 2FA, hashed passwords, signed uploads, webhook signature checks, secrets only in `.env`, no PII in logs, regular DB backups.

## 9. Phases

| #   | Phase                             | Output                                                                            |
| --- | --------------------------------- | --------------------------------------------------------------------------------- |
| 0   | Reference analysis                | Design tokens + section inventory from the reference site (**need URL**)          |
| 1   | Foundation                        | Next.js + TS + Tailwind RTL, Prisma, env, CI, folder skeleton                     |
| 2   | Design system + static storefront | Header/footer, home sections, collection, product pages with mock data            |
| 3   | SEO layer                         | Metadata, JSON-LD, sitemap, robots, breadcrumbs, redirects                        |
| 4   | Admin + catalog                   | Auth, product/category CRUD, image upload, SEO fields                             |
| 5   | Cart + checkout + COD             | Orders, stock, confirmation                                                       |
| 6   | Bosta                             | Shipment creation, AWB, tracking webhooks, `/track`                               |
| 7   | Online payments                   | Paymob card/wallet (+ InstaPay path)                                              |
| 8   | Content + launch                  | Blog, policies, keyword-mapped copy, Search Console, GBP, Lighthouse pass, deploy |
| 9   | Post-launch                       | Reviews, backlinks, monthly SEO iterations                                        |

Current scope: **Phases 0–3 (design + SEO-ready storefront)**, then 4 onward.

## 9b. Reference analysis (Phase 0 findings)

**UI reference: 2segypt.com** (Shopify theme, font Almarai, white background, black text, square 0px buttons, minimal/editorial look, full-bleed photography). Sections on its home page, in order:

1. Announcement bar (free-shipping message, language switch, social icons)
2. Header: logo centered, cart/account left, search + menu right
3. Hero slideshow (seasonal campaign banner)
4. Collection tabs (product carousel switchable by collection)
5. Rich-text intro line
6. Scrolling promo strip (brand/character logos)
7. Featured collections (big photo cards per category)
8. Full-width banner + second featured collections grid
9. "New arrivals" tabs by category
10. Banner grid, "all sections" shortcut
11. Advantages strip (shipping, returns, payment), newsletter/rich text, footer

Product card: photo, name, price (EGP), colour swatches, size chips, "new" badge, quick-add button, rating count. Popup promo modal (we will **not** copy: hurts mobile UX/CLS).

**Our changes (to make it ours, not a clone):** kids-only identity; warmer playful palette and soft rounded shapes (instead of 0px square), different type pairing, new hero/section composition, age-based navigation, sticky mobile "add to cart" bar, size guide inline, faster page (no theme bloat), no popups/cookie wall beyond what law requires. No images or copy are reused from 2S.

**Catalog reference: sedrakids.com (old site, content/taxonomy only, UI discarded).**
Categories seen: بيبي بناتي، بيبي ولادي، وسط بناتي، وسط ولادي، محير بناتي، محير ولادي، محير He&She (age bands: baby / middle / older).
Sizes seen: 3–8. Prices seen: ~435–575 EGP. Product naming pattern: "طقم أولادي جرافيك عصري – لون × لون".
Note: category names ("وسط", "محير") are internal jargon and weak for search. Plan: use searchable names in URLs/titles, e.g. "بيجامات أولادي 3–8 سنين", "بيجامات بناتي", "ملابس بيبي رضع", and keep a mapping to the old names for admin.
Remaining: confirm the age ranges per band, and whether products are sets/pyjamas (homewear) only.

## 9c. Design direction: mobile-first, similar structure but a distinct look

Most Egyptian shoppers arrive on phones, so every screen is designed at 390px first, then scaled up. Previews and reviews are done in the browser pane at mobile size (375x812).

Keep (structure only, same as any shop): announcement bar, header, hero, collection cards, product carousels, trust strip, footer.

Differentiate so it does not read as a copy of 2S:

| Area         | 2S                              | Ours                                                                                                         |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Palette      | white/black, red campaigns      | warm cream background, deep cedar green + soft coral accent                                                  |
| Shapes       | square 0px                      | rounded 16–24px cards, pill buttons                                                                          |
| Type         | Almarai everywhere              | rounded Arabic display font for headings (e.g. Baloo Bhaijaan 2 / Lalezar) + Almarai or Cairo for body       |
| Header       | centered logo, icons both sides | logo at start, search bar always visible, bottom tab bar on mobile (Home, Categories, Search, Cart, Account) |
| Navigation   | text menu                       | age-first: horizontal story-style circles (Baby / Kids / Older) with girls/boys toggle                       |
| Hero         | full-bleed campaign slider      | single static hero (faster LCP) with one clear CTA, plus "shop by age" cards                                 |
| Product card | photo, swatches, size chips     | photo, name, price, quick size picker sheet, heart/wishlist                                                  |
| Product page | standard                        | swipe gallery, sticky "add to cart" bar, inline size guide, delivery estimate, COD/Instapay/card badges      |
| Extras       | popup promos                    | no popups; small dismissible banner only                                                                     |

Rules: no 2S images, copy, section names or icon set; thumb-reachable controls; minimum 44px tap targets; fixed aspect ratios to avoid layout shift; Arabic RTL polish (numerals, spacing); light motion only.

## 9d. Admin dashboard requirements (owner-controlled catalog)

Top business priority stays **SEO: rank #1 for "سيدرا كيدز"**. Everything below must keep SEO intact (slugs, redirects, cache revalidation).

The owner manages the whole store from `/admin`, with no developer needed for daily work:

**Categories**
- See all categories in one list (name, age band, gender, product count, status).
- Add, edit and reorder categories; edit name, slug, intro text, SEO title/description, image.
- Hide a category (it disappears from the menu and sitemap) instead of deleting when it has products.
- Brand lines such as "HE and SHE" are supported as their own category group.

**Products**
- See all products in one list with search, filter (category, status, stock) and pagination.
- Add a product (name, code/SKU, description, material, category, images, SEO fields).
- Edit anything on a product at any time (text, price, images, order of images).
- Variants per size/colour with price, compare-at price and stock quantity.
- **Mark out of stock:** per variant or for the whole product with one toggle; the page stays live and indexable and shows "غير متاح حالياً" (no 404, no ranking loss), and it can be restored just as fast.
- **Hide / unpublish** a product without deleting it (status DRAFT/ARCHIVED).
- **Delete a product**: soft-delete first (recoverable); when it was published, a redirect to its category is created automatically so Google never hits a 404.
- Bulk actions: publish/unpublish, mark out of stock, change prices by a percentage.

**Safety**
- Admin only (login, rate limiting), every action validated and permission-checked on the server.
- Confirmation before delete; every write triggers cache revalidation so the storefront updates immediately.
- Old category names used internally by the company (e.g. "محير" for 9-14 years) are kept as an admin-only label; public names use searchable Arabic wording.

**Orders (owner access to every order and the customer data)**
- Orders list: number, date, customer name, phone, governorate, total, payment method and status, order status; search by name/phone/order number; filters by date, status, payment method, governorate.
- Order detail: full customer data (name, phone, full address, notes), items with sizes and quantities, totals, payment info, shipment/tracking (from Phase 6), and a status history.
- Change status (new, confirmed, shipped, delivered, returned, cancelled), add internal notes, print the order, export orders to CSV/Excel.
- New-order alert in the dashboard (and an email/WhatsApp notification to the owner, later phase).

**Statistics dashboard**
- Date range filter (today, 7 days, 30 days, custom).
- Number of orders, revenue, average order value, cancelled/returned rate.
- **Top products** (most ordered, by quantity and revenue) and slowest products; sales by category, by age band and by brand line (Sedra / HE and SHE).
- Orders by governorate and by payment method (COD vs card vs wallet).
- Customers: new vs returning, repeat buyers.
- Stock alerts: low stock and out-of-stock products.
- Traffic and search performance (visits, Google queries for "سيدرا كيدز", rankings) are read from Google Search Console / analytics, linked from the dashboard, not rebuilt.

**Privacy of customer data:** customer details are visible only to admin accounts, every view/export is logged, no personal data goes to logs or analytics, and CSV exports are admin-only.

**Handoff to the owner:** the developer imports the real photos with placeholder prices (as DRAFT, flagged `needsReview`); the company owner gets his own admin account and sets the real prices, sizes and stock. Products with placeholder prices can never be published until the owner confirms them (see `PHASE-3-4-PLAN.md`, "Data strategy and owner handoff").

Delivered in Phase 4 (parts C, D, F and G of `PHASE-3-4-PLAN.md`): catalog management plus the orders and statistics screens (built and tested with sample data). Real orders start flowing in Phase 5, so those screens fill with real data then; shipment and payment details are added in Phases 6-7.

## 10. Open items

1. Reference site URL + what to keep/improve.
2. Final domain name.
3. Logo, colors, brand assets.
4. Payment provider decision (Paymob vs alternatives) and InstaPay path.
5. Bosta account/API access (not needed until Phase 6).
6. Physical address / phone for `LocalBusiness` and trust pages.
