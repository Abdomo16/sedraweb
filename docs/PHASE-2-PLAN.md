# Phase 2: Design system + static storefront (mobile-first)

**Goal:** a complete, fast, SEO-ready storefront that looks great at 390px, running on **mock data** shaped exactly like the database, so Phase 4 only swaps the data source.
**Not in this phase:** cart logic, checkout, payments, admin, real photos (placeholders for now).

## 1. Design tokens (already in `globals.css`, refined here)
- Colors: cream `#FBF6EC`, ink `#1D2A24`, cedar green scale, coral accent. Soft tinted section backgrounds (cedar-50, a warm sand, a pale coral).
- Radius: cards 20px, buttons pill, chips pill. Shadows: one soft elevation only.
- Type scale (mobile): H1 30/36, H2 22/30, body 16/26, small 13. Headings Baloo Bhaijaan 2, body Cairo.
- Spacing: 16px gutters, 8px grid, min tap target 44px.
- Motion: CSS only, `prefers-reduced-motion` respected.

## 2. UI components (`components/ui`)
`Button` (primary / soft / ghost, sizes), `Chip` (selectable, link or button), `Badge`, `Container`, `SectionHeading`, `Price` (EGP, Arabic digits option, strike-through compare price), `Icon` set (inline SVG: search, bag, heart, home, grid, user, check, truck, shield, return), `ImagePlaceholder` (illustrated SVG tile per category/colour, replaced by real photos later).

## 3. Layout shell (`components/store`)
- `AnnouncementBar`: free-shipping message, dismissible without layout shift.
- `Header`: logo wordmark at start, always-visible search field, bag icon with count (static 0).
- `BottomTabBar` (mobile only): Home, Categories, Search, Cart, Account.
- `Footer`: category links, policies, contact, payment badges (COD / card / InstaPay), social links.
- Skip link, landmarks, focus states for accessibility.

## 4. Home page sections (order)
1. Announcement bar + header
2. **Hero**: one static block (LCP-safe), headline, subline, single CTA, illustration
3. **Shop by age**: circular story-style entries (Baby / Kids / Older) with girls/boys toggle
4. **Category cards**: 2-column rounded cards for the 7 collections
5. **New arrivals** carousel (CSS scroll-snap, zero JS)
6. **Why Cedar Kids** trust strip: soft cotton, fast shipping, easy returns, COD
7. **Best sellers** grid
8. **Short brand/SEO text** block with internal links to collections
9. **FAQ** (details/summary, no JS) with FAQPage schema
10. Footer

## 5. Collection page `/collections/[slug]`
H1 + 1-paragraph intro, breadcrumb, filter chips (size, sort) as plain links (no JS, crawl-safe, noindex variants), 2-column product grid, SEO text + FAQ at the bottom, related collections.

## 6. Product page `/products/[slug]`
Swipe gallery (scroll-snap) with dots, name, price, colour + size pickers (small client component), **sticky add-to-cart bar** (stub, wired in Phase 5), delivery/payment badges, accordion (details, material and care, size guide, shipping and returns), related products, breadcrumb.

## 7. Mock data layer
`features/catalog/types.ts` (mirrors Prisma), `features/catalog/mock.ts` (7 categories from the seed + ~12 products with variants), and `features/catalog/queries.ts` exposing `getCategories`, `getCategory`, `getProducts`, `getProduct`, `getRelated`. Pages only call `queries.ts`, so Phase 4 replaces the internals with Prisma.

## 8. SEO in this phase
- `generateMetadata` for every page (unique title, description, canonical, OG).
- JSON-LD: `WebSite` + `Organization` (already), `BreadcrumbList`, `ItemList` (collections), `Product` + `Offer` (product pages), `FAQPage`.
- `generateStaticParams` so all pages are statically generated.
- `sitemap.ts` lists collections and products from `queries.ts`.
- Single H1 per page, semantic landmarks, `alt` on all images.

## 9. Performance rules
Server Components by default; client components only for size picker and header search focus; no carousel library; fixed aspect ratios to prevent CLS; hero is static with no image blocking LCP; fonts already subsetted via `next/font`.

## 10. Files created/changed
```
src/components/ui/*          Button, Chip, Badge, Container, Price, Icons, ImagePlaceholder, SectionHeading
src/components/store/*       AnnouncementBar, Header, BottomTabBar, Footer, ProductCard, ProductCarousel,
                             AgeShortcuts, CategoryCards, TrustStrip, Faq, Gallery, SizePicker, StickyBuyBar
src/components/seo/JsonLd.tsx
src/features/catalog/*       types, mock, queries
src/lib/seo/*                breadcrumbs, product/collection schema builders
src/app/(store)/layout.tsx   shell
src/app/(store)/page.tsx     home
src/app/(store)/collections/[slug]/page.tsx
src/app/(store)/products/[slug]/page.tsx
src/app/sitemap.ts           extended
```

## 11. Definition of done
- Home, 7 collection pages, product pages render at 375px with no horizontal scroll.
- `typecheck`, `lint`, `build` pass; all pages statically generated.
- Valid JSON-LD present on each page type.
- Lighthouse mobile: Performance, SEO, Accessibility, Best Practices ≥ 95 (checked on the production build).
- Reviewed visually at 375px and 768px.

## 12. Decisions made (change if you disagree)
- Placeholders instead of photos until you provide real product images.
- Text wordmark as logo until you provide the real one.
- No popups, no carousel library, no cart yet.
