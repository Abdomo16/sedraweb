# Phase 5: Cart, checkout and cash-on-delivery with manual confirmation

**Goal:** a customer can add items to a cart, check out in under a minute on a phone, and place a cash-on-delivery order. The order lands in the admin as "needs confirmation"; a team member calls the customer, confirms (optionally records a deposit) and presses **Confirm** in the admin.

**Not in this phase:** Bosta shipments (Phase 6), card and wallet payments (Phase 7). The data model leaves room for both.

**Rules:** retail only. Any quantity from 1 up to the available stock of that size. Shipping prices and the confirmation policy are not agreed yet, so both are editable in the admin and guarded before launch.

---

## 1. What 2S does (observed, structure only)

**Cart page:** dark title banner; one row per item (title, price, colour, size, quantity stepper, remove); a summary card with a free-shipping progress bar ("spend X more for free delivery"), subtotal, "shipping is calculated at checkout", a checkout button, a discount code box, an exchange-order note and a gift-card box.

**Mini-cart drawer (opens after "add to cart"):** a slide-over with a close button; a free-shipping progress bar on top ("spend X more"); item cards with photo, name, price, colour, size, a low-stock warning ("only 9 left"), quantity stepper and remove; a discount code row and an exchange note row; two tabs of suggestions ("you may also like" and "recently viewed") as a photo carousel; a sticky bottom bar with the total, "View cart" and "Complete purchase".

**Checkout (generic Shopify page):** collapsed order summary at the top on mobile with the total; a banner "pay online and save 5%"; contact info (email **or** phone); newsletter checkbox; delivery: country (Egypt, Kuwait, Saudi Arabia, UAE), first name (optional), last name, address, apartment (optional), city, governorate, postal code (optional), phone (again), "save info" checkbox; one flat shipping method (75 EGP); payment list: card, wallets/instalments, Sympl, valU, cash on delivery; billing address choice; discount code; total; big confirm button.

**Weak points we improve on:**
- Asks for contact twice (email or phone, then phone again), and first name is optional while last name is required.
- Postal code, country, billing address and newsletter are noise for an Egyptian COD buyer.
- A vague error ("المدينة مطلوبة") shows at the top before the customer typed anything.
- Mixed English and Arabic labels; five payment options crowd the page.
- It is a generic template, not part of the brand, and shipping cost only appears late.

## 2. Our cart and checkout (better, not a copy)

**Cart**
- "Add to cart" on the product page (size required, quantity stepper capped by stock), a small confirmation with "Go to cart", and a cart icon with the item count in the header.
- Cart page: product photo, name, size, quantity stepper limited by stock, remove, line totals; free-shipping progress bar (threshold from settings); clear message when an item sold out or its price changed.
- Stored on the customer's device; prices and stock are always re-checked on the server when the order is placed.

**Mini-cart drawer (our version, in the Sedra colours)**
- Slides in from the side after "add to cart" and from the cart icon. Rounded cards, cream background, leaf-green primary button and a sun-yellow progress bar, instead of 2S's dark, square look.
- Top: a friendly free-shipping bar with a short sentence ("فاضل لك 61 جنيه عشان الشحن يبقى مجاني") that turns into a celebration state when reached.
- Items: product photo, name, size, quantity stepper capped by stock, remove, and a low-stock hint ("فاضل 3 بس") taken from the real stock.
- **"قد يعجبك"** (more from the same category and age group, in stock only) and **"شاهدته مؤخراً"** (kept on the device): a swipeable photo carousel with quick add. Built from our own catalog, no tracking.
- Sticky bottom: total, **عرض السلة** and **إكمال الطلب**, thumb-sized buttons. Closes with the back button, tap outside or Escape; focus stays inside while it is open.
- Discount code and exchange note rows are left out of this phase (no coupons yet); the slots stay in the design for later.
- Light motion only (slide and fade, no layout shift), switched off for reduced-motion users.

**Checkout: one page, phone first, no account**
1. **Your details:** full name; mobile number (Egyptian format, Arabic or English digits, validated live).
2. **Delivery:** governorate (the shipping price appears right away), city or area, detailed address, landmark, notes.
3. **Payment:** cash on delivery, with the message "هيتم التواصل معاك لتأكيد الطلب". Card and wallets plug in here in Phase 7.
4. **Sticky summary on phones:** items, subtotal, shipping, total, and one big **Confirm order** button. Errors appear next to the field, only after the customer touches it.
- No email, postal code, country, billing address or newsletter box. Arabic only, brand colours, trust cues (cash on delivery, exchange policy link).
- Later idea (Phase 7): a small discount for paying online, like 2S.

**After ordering:** a confirmation page with the order number and the sentence **"تم استلام طلبك. هيتم التواصل مع حضرتك لتأكيد الأوردر."**, an order summary, and a link back to shopping. The URL contains a random token so an order cannot be opened by guessing its number.

## 3. The confirmation workflow (admin)

**Statuses**
| Status | Meaning |
|---|---|
| محتاج تأكيد | New cash-on-delivery order, nobody has called yet |
| مؤكد | The team spoke to the customer and pressed Confirm |
| اتشحن / اتسلم | Phase 6 |
| ملغي | Cancelled (reason recorded, stock returned) |
| مرتجع | Returned after delivery |
| مدفوع أونلاين | Phase 7: paid by card, no manual confirmation needed |

**Orders page in the admin:** tabs with counters (needs confirmation, confirmed, online paid, shipped, delivered, cancelled), search by name, phone or order number, filters by date and governorate. The "needs confirmation" tab is the team's daily to-do list, oldest first.

**Order page:** customer name, phone with **Call** and **WhatsApp** buttons (WhatsApp opens a chat with the customer, used by the team, never required from the customer), full address and notes, items with sizes and prices, totals, history of actions.

**Actions**
- **Confirm order:** optional deposit amount and a note ("took 100 EGP deposit"), who confirmed and when are recorded. The page then shows "المطلوب تحصيله عند الاستلام" (total minus deposit).
- **No answer:** adds a call-attempt note and keeps the order in the queue.
- **Cancel:** a reason is required, stock is returned to the shelf.
- Add an internal note at any time.
- Only confirmed orders can create a shipment (Phase 6).

**Alerts:** a badge on the dashboard and on the orders menu for new orders; Telegram or email notification is optional and added after the team picks one.

## 4. Data and rules

- **Order**: add `confirmedAt`, `confirmedBy`, `depositAmount`, `cancelReason`, a unique `clientToken` (stops double submits and builds the confirmation link). New table `OrderEvent` (type, message, admin, time) as the audit trail.
- **Stock**: checked and reduced inside one database transaction, so if two customers want the last piece only one gets it. Cancelling returns it.
- **Prices**: always read from the database; each order line stores a snapshot of name, size and price.
- **Shipping**: `ShippingRate` per governorate plus a free-shipping threshold in settings; placeholder values until the owner agrees them, and the site cannot go live while they are placeholders.
- **Abuse**: hidden honeypot field, rate limit per device and per phone, a limit of pending orders per phone per day, duplicate detection shown to the team.
- **Privacy**: customer data is visible only to admins; opening an order is logged.

## 5. SEO and performance guardrails

- Cart, checkout and order pages are `noindex`, excluded from the sitemap and robots.
- Cart code is a small client island, loaded only where needed, so the public pages keep their current scores.
- Nothing here changes public URLs or structured data (product availability already follows stock).

## 6. Work breakdown

1. **Cart:** state, add-to-cart on the product page, header icon, **mini-cart drawer** (free-shipping bar, suggestions, recently viewed), cart page, stock-aware quantities.
2. **Server pricing and stock** helpers with tests for price tampering and the last-piece race.
3. **Checkout page** and the `placeOrder` action (validation, transaction, idempotency).
4. **Confirmation page** with token link.
5. **Shipping settings** screen in the admin and the launch guard.
6. **Admin orders** (Part G): tabs, list, order page, Confirm / No answer / Cancel, notes, badges.
7. **Anti-spam** and rate limits.
8. **Verification:** place orders end to end, confirm them from the admin, check stock and totals, Lighthouse on the public pages.

## 7. Decisions

**Decided**
- **Shipping prices:** an admin page lists every governorate with its price, and the owner edits it; plus a free-shipping threshold. It is the single source of truth for what the customer pays (Bosta's own cost is shown next to it as a reference in Phase 6, it does not set the price). The site cannot go live while the values are placeholders.
- **New-order alerts:** inside the admin dashboard only (menu badge, "needs confirmation" counter, the browser tab title shows the count, and the list refreshes by itself every 30 seconds).
- **Deposit:** it is a partial payment the team takes by phone (for example 100 of a 500 EGP order). Phase 5 only records the amount and shows "to collect on delivery"; the rules around it come later.

**Proposed, waiting for the owner**
- **Unconfirmed orders:** never deleted. Highlight yellow after 24 hours and red after 72 hours in the queue; optionally auto-cancel after N days (setting, can be off) with the reason "no answer", stock returned, and the order can be reopened if the stock is still there.
- Whether a small discount for online payment is offered when Phase 7 arrives.
