# Admin statistics (orders and sales)

**Goal:** the owner opens one page and sees how the store is doing: how many people ordered, what sells most, where orders come from, and what is about to run out. Everything is computed from the real orders, in Cairo time, with no tracking of visitors.

Page: `/admin/stats` (menu item "إحصائيات"). Admin only.

## 1. Date range
Today, last 7 days, last 30 days, this month, all time, or a custom from/to. Days are cut at midnight Cairo time, not UTC. The range lives in the URL so a view can be bookmarked.

## 2. What it shows

**Summary cards**
- **Orders** in the range (all statuses).
- **Confirmed sales:** value of orders that are confirmed, shipped or delivered. This is the number that counts as money.
- **Waiting for confirmation:** value and count of orders still pending (potential sales).
- **Average order value** (confirmed sales divided by confirmed orders).
- **Cancelled and returned:** count and percentage of all orders.
- **Pieces sold** (items in counted orders).

**Orders per day:** a simple bar chart (server drawn, no chart library) so peaks and quiet days are visible at a glance.

**Best sellers:** top products by pieces and by revenue, and a "slow movers" list (published products with the fewest or zero sales in the range).

**Sales by group:** by category, by age group, and by brand line (Sedra vs HE and SHE).

**Where orders come from:** by governorate, and by payment method (cash on delivery now, card and wallet when Phase 7 arrives).

**Customers:** new vs returning (by phone number): someone who ordered before the range, or more than once inside it, counts as returning. Top repeat customers.

**Stock alerts:** published sizes with 3 pieces or fewer, and the number of sold-out products, each linking to the product page.

## 3. Rules for the numbers
- Cancelled and returned orders never count as sales, products sold, or customers' purchases. They only appear in their own rate.
- "Counted orders" (used for products, groups and governorates) = everything except cancelled and returned, so pending orders show demand even before they are confirmed. Confirmed sales are shown separately and clearly labelled.
- Prices come from the snapshot stored on each order line, so later price changes never rewrite history.
- All money is stored in piastres and shown in pounds.

## 4. Export
A button downloads the orders of the current range as an Excel-friendly CSV (UTF-8 with BOM, Arabic safe): order number, date, customer, phone, address, status, items, subtotal, shipping, total, deposit, amount to collect. Cells that start with `=`, `+`, `-` or `@` are escaped so a customer name can never run as a spreadsheet formula. Admin only.

## 5. Privacy and performance
- Customer names and phones appear only to logged-in admins; nothing is sent to third parties.
- Aggregation runs on the server per request. It is fine up to tens of thousands of orders; if the store grows past that, the same numbers move to SQL aggregates without changing the page.

## 6. Out of scope here
- Website visits and Google rankings: those come from Google Search Console (linked from the admin later), not from custom tracking.
- Audit log of who exported what (planned with the owner-account work).

## 7. Work breakdown
1. Cairo-time date-range helpers.
2. Stats queries.
3. Stats page and small presentational pieces.
4. CSV export and the menu item.
5. Verification against SQL with sample orders, then cleaning them up.

## 8. Status (built and verified)
Built: `/admin/stats` with the date range (Cairo time), summary cards, orders per day, best sellers and slow movers, sales by category / age / brand, orders by governorate and payment method, new vs returning customers, repeat customers, stock alerts, and the Excel export. The numbers were checked against hand-computed values using sample orders spread over several days and statuses (confirmed, pending, delivered, cancelled, returned, an order outside the range, and a returning customer); the sample data was then removed.

Notes:
- Slow movers and stock alerts look at **published** products only, so they stay empty until products are published.
- The export keeps the leading zero of phone numbers in Excel and neutralises formulas.
- Not done: an audit log of who exported or viewed customer data (planned with the owner-account work).

