# Matsya Fisheries owner guide

Security implementation reference: [Supabase Row Level Security documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Before launch

1. Back up Supabase and test the migration on staging. Apply `supabase/migrations/202610140001_order_privacy.sql` in the SQL Editor. It replaces all existing orders policies; old orders remain visible only to staff because they have no verified owner. Review other database functions/views for alternate access to orders. The retired PIN function is revoked for its text signature; remove any other overloads and public functions that expose orders.
2. Enable Anonymous Sign-ins in Supabase Authentication. Configure its abuse protection/rate limits before public launch. Customers get an authenticated guest session automatically. Enable CAPTCHA with the corresponding client challenge if required by your settings; the current checkout does not supply a CAPTCHA token.
3. Create a permanent staff email/password user in Supabase Auth. Set their **app_metadata** to `{"role":"admin"}` using a trusted server/Admin API or the SQL below. Never assign this via user_metadata or expose service-role/secret keys in Vite environment variables. Sign in again after role changes.

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where id = 'REPLACE_WITH_CONFIRMED_STAFF_USER_UUID';
   ```

4. Run `supabase/tests/order_privacy.sql` on staging. It rolls back fixtures and checks owner access, another customer's access, forged ownership, forged user_metadata, staff updates and public access. These tests have not been executed against your database by Codex.
5. Fill the public business contact settings from `.env.example`. Confirm the GSTIN and FSSAI numbers already in the footer and legal pages against the owner's registration documents. No official verification has been performed. Have the owner review all existing policy promises and tax treatment.
6. Deploy `npm run build` output (`dist`) on your selected host. Add the public Supabase settings and `VITE_SITE_URL=https://your-domain` to the host's build environment; rebuild after changes. A host-provided HTTPS URL is enough initially. Never add secret/service-role keys to any `VITE_` setting.
7. Enable HTTPS and HTTP-to-HTTPS redirects on the host. Configure the DNS records it supplies when you choose a domain. Check certificate validity, image loading and direct product links on the deployed URL. HTTPS cannot be enabled by this source-code change alone.

## Daily operations

- Open `#admin` or press Ctrl+Shift+A. Sign in with the staff email/password. Refresh to fetch orders. Filter by status and search by customer, phone or order number.
- Move orders through Placed → Processing → In Transit → Delivered. Confirm customer details and fulfilment before each update. The dashboard only changes order status; it does not confirm UPI receipts automatically.
- Use the WhatsApp receipt/update button when communicating with the customer. Lock the dashboard when finished. Leaving it signs out the separate staff session.
- Manage prices, active products and delivery PIN codes in the corresponding Supabase tables. Restrict database dashboard access to trusted staff.
- Guest tracking only shows orders placed in that browser session. Clearing site data or using another device loses guest access. For those cases, verify the customer's identity through support. Existing orders are staff-only; do not claim them based only on a phone number.

## Phone order acceptance test

Use a staging project and an actual phone; this has not been completed by Codex.

1. Open the home page at a narrow width; check navigation, images, category filters and product details. Share/reload a `?product=<id>` link and a `?category=<category>` link.
2. Add a cut/weight selection, change quantities and remove an item. Delivery must match the PIN code's linked delivery_zones.charge_paise divided by 100. There is no order-value free-delivery threshold. Test a zero-charge zone, a fractional-rupee charge, a paused PIN and an unknown PIN.
3. Test an invalid phone, invalid PIN, unserviceable PIN, empty cart and a disconnected network. None should show a successful order.
4. Submit a serviceable test order. Verify the returned order number and one matching database row. After the idempotency migration below, a retry of unchanged checkout details in the same browser/customer session uses the same request ID and returns the existing order. Test a lost response followed by retry and refresh. A new basket can intentionally buy the same items again.
5. Track the order in the same browser and update its status from a staff session. Verify customer B in another browser cannot read A's order using either phone, number, UUID or direct REST requests.
6. Confirm COD/UPI instructions, actual payment handling, WhatsApp receipt, delivery, refund handling and support contacts with the owner.

## Search and social preview

Page titles/descriptions change for products and categories, and direct query links reload their views. The build includes a static home share preview; WhatsApp and other crawlers that do not execute JavaScript will use that shared preview for product links too. Dedicated product social previews and complete crawlable product SEO require prerendering or server rendering.

The build generates robots.txt and, when `VITE_SITE_URL` is set, sitemap.xml for the home page. Hash-based policy/admin views are not distinct server URLs. Robots cannot block `#admin` separately; database authentication/RLS provides access protection. Product/category queries are not included in the sitemap until prerendered pages are available.

Apply `supabase/migrations/202610150002_validate_order_pricing.sql` after the privacy migration to enforce catalog prices, availability, quantities, pack sizes and zone-based delivery fees on every insert, including direct API inserts. Run `supabase/tests/order_pricing.sql` and rerun `supabase/tests/order_privacy.sql` on staging afterward. These SQL tests have not been run by Codex. Test fixtures roll back but sequence counters can advance. Existing orders remain unchanged. Apply this migration before accepting orders with the updated checkout; old clients using the flat delivery fee may be rejected until refreshed.

The pricing trigger rejects stale/tampered totals and asks the customer to update the basket. It stores product names and prices from the catalog. Order amount columns now support two decimal places in rupees because zone charges are in paise. Payment receipt verification and abuse protection remain separate work.

## Duplicate-order protection

Apply `supabase/migrations/202610150003_order_idempotency.sql` after both earlier migrations, before using the new checkout code. Run `supabase/tests/order_idempotency.sql` on staging and rerun privacy/pricing tests afterward. Codex has not run these SQL tests against your database. The migration preserves existing orders and adds request columns, a unique index and a `place_order_once` RPC. The function runs with the caller's permissions and existing RLS. A transaction lock serializes matching customer/request IDs. An unchanged retry returns the original row before rechecking product availability. Reusing a request ID with different details raises an error.

The browser persists only a SHA-256 fingerprint and random request ID for retry matching; no additional address or phone is stored by this feature. Keys survive reload and success so queued retries cannot immediately create another order. Starting a fresh basket clears old retry keys to allow an intentional new purchase. Browser storage must work. Protection covers retries sharing a request ID; changing checkout details, starting a new basket, clearing browser data or ordering on a different device can create a new purchase. Direct inserts that bypass the RPC do not receive its retry behavior, though pricing/ownership validation still applies.

Local verification: `node --test scripts/checkout-request.test.mjs scripts/seo-plugin.test.mjs`. Database verification: use the SQL test above. For a concurrency check on staging, call the RPC from two authenticated clients with the same user, payload and request ID and confirm the returned IDs match and only one row exists.

## Suggested 30–45 minute handover

Spend 10 minutes on catalog/PIN-code management, 15 minutes on a test order and status updates, 10 minutes on payments/refunds and support, and 5–10 minutes on account access, backups and escalation contacts. The guide is ready; the live training session remains to be held.
