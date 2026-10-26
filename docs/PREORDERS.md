# Premium preorders

## Confirmed business rules

- Order on the website; cash or UPI on delivery. No online payment is collected. Razorpay will be integrated later.
- Use listed catalog prices and the delivery zone's charge_paise / 100 delivery fee.
- At least two calendar days' notice, calculated in Asia/Kolkata. For example, an order placed on 26 October can select 28 October or later.
- Available, active products in Premium Sea Fish are eligible. Unavailable products and unlisted special varieties are not sold through this checkout.
- One delivery date per basket. Regular orders and preorders must be separate checkouts.

## Setup before publication

1. After the existing four order migrations, apply the complete `supabase/migrations/20261025192451_premium_preorders.sql` on staging first. It adds preorder_settings and orders.order_type, preserves existing orders as standard, and updates the existing price validator and retry-safe order function. Existing pricing, owner privacy and payment protections stay in place.
2. Run `supabase/tests/preorders.sql`, and rerun the privacy, pricing and idempotency SQL tests. Test fixtures roll back; sequence numbers can still advance.
3. After staging verification, apply that migration to the Matsya project and deploy the reviewed frontend. No new frontend environment variables or payment keys are required.
4. On a phone, choose Premium Sea Fish, open Pre-order for a later date, select a product, pack, quantity, cut and delivery date, then Add preorder to basket. Complete normal checkout with a serviceable PIN.
5. Confirm the saved order has order_type = preorder, the chosen delivery_date, the correct total, and payment_status = pending. Check the same date in tracking and the admin panel. Only mark payment collected after receiving money.

The frontend reads the database's minimum notice period; the database validates it again on insertion. If the migration is missing or preorder settings cannot be read, preorder entry is unavailable while regular checkout continues.

## Temporarily close new preorders

Run as the database administrator:

```sql
update public.preorder_settings set min_notice_days = null where id = 1;
```

Reopen with the approved two-day notice:

```sql
update public.preorder_settings set min_notice_days = 2 where id = 1;
```

Closing new preorders does not delete existing orders. Retries for already-saved requests still return the original order. Customers and browser sessions cannot change this setting or modify an order's delivery date.

## Verification performed locally

- Production build and ESLint.
- Unit checks for dates at India midnight, eligible products, pack quantities, and separate baskets.
- All five migrations and four SQL test suites in PGlite, an isolated PostgreSQL runtime using a fixture schema and Auth helpers matching the supplied project details. No live database writes were made. This does not replace Supabase staging validation.
- Browser regression with mocked Supabase: normal orders plus preorder dates, refresh, pay-on-delivery confirmation, tracking and staff display. No actual orders or messages were sent.

To repeat database tests, set MATSYA_PGLITE to an installed @electric-sql/pglite/dist/index.js and run `node scripts/database-review.mjs`. The test runtime was installed only in the temporary directory, not added to website dependencies.
