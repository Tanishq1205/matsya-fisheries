# Website review — 26 October 2026

The functional review and fixes are available locally. These changes have not been pushed or deployed.

## Customer-facing updates already prepared

- Adjusted the first hero fish size and reused the correct background fish artwork across slides.
- Increased heading and body letter spacing slightly, with smaller adjustments on mobile.
- Replaced serving labels with 500g and 1kg packs. The quantity control shows total weight and price; the basket now receives the selected pack count.
- Removed product health and nutritional benefit cards.
- Connected checkout PIN prefill to the same saved location used by the navbar. Delivery charges are checked again for the actual checkout PIN.
- Renamed the navbar enquiry to Contact for Business and added a Resell with Us footer link to the company WhatsApp with a prefilled message.
- Removed Our Story from the navbar and improved spacing and mobile menu behavior.

## Problems fixed during the review

- Related-product navigation now updates the URL, so refreshing retains the newly selected product.
- Checkout has a #checkout URL and can reopen after refresh when the basket still contains items.
- Catalog anchors exit product, tracking, checkout, and legal views correctly. The main hero order button now targets the existing catalog section.
- Product fetches ignore obsolete navigation requests and show an error if a requested product cannot load.
- Fixed the legal-page header overlapping and blocking the main navbar.
- Fixed mobile PIN/cart overlap at 320px and kept the PIN dropdown inside the viewport. The mobile menu can be closed and has a readable header.
- Staff status updates only change the screen after receiving the saved row. Failed order refreshes now display an error.
- WhatsApp receipts use the configured website URL, interpolate PIN/landmark correctly, and show the actual pending/paid state for COD and UPI.
- Tracking uses an existing customer session instead of creating a new account when someone without an order searches.
- Unavailable products cannot be added to the cart. Quick-add items preserve their catalog image. Pack quantities stay within the server-supported limit.
- Removed the misleading GPS shortcut that substituted a fallback PIN, the inactive coupon button, the note field whose contents were never submitted, and an unsupported calculated GST breakdown.
- Browser storage failure while saving convenience details no longer turns a confirmed server order into an apparent order failure.
- Fixed the smooth-scroll animation cleanup and missing-image fallbacks. The founder card uses its existing branded fallback until an owner photo is supplied.

## Further changes completed

- Product pages show the document's cleaned-weight ranges: Surmai/Rawas/Bombil 700?800g per 1kg; prawns/sardines/squids 500?700g per 1kg. Estimates scale for 500g and multiple packs, and explain that preparation affects the result. Removed conflicting fixed yield badges and the weight ?promise.? Other varieties do not receive invented estimates.
- Premium Sea Fish and its product pages now use a website preorder basket and checkout. Customers choose a catalog product, pack, quantity, cut and delivery date at least two calendar days ahead in India time. Orders use listed prices, zone delivery charges, and COD/UPI on delivery. Razorpay is future work. The earlier WhatsApp enquiry implementation has been replaced.
- Cleaned up all ESLint errors and warnings without disabling checks. Product formatting now lives in a shared helper.
- Saved checkout details initialize safely before rendering; navbar PIN changes preserve other form fields. Outdated delivery and tracking responses cannot overwrite the latest request.
- Product changes reset pack/image/cut choices through the component key. Checkout navigation listens to store actions.
- Toasts cancel their timers when replaced, so an older toast cannot dismiss a newer one. CAPTCHA retries clear old errors and clean up the original dialog.
- The older location popup now checks the same delivery service as checkout. Removed its invented GPS PIN and broad 400xxx fallback.
- Email and last-name labels correctly identify optional checkout fields. The legacy checkout entry point reuses the main checkout instead of a second implementation.

## Verification

| Check | Result |
| --- | --- |
| Production build | Passed |
| Node tests: CAPTCHA lifecycle, cart quantities, checkout retry keys, metadata output, receipt contents, cleaned-weight ranges, preorder dates and basket separation | 19 passed |
| Browser flow using mocked Supabase responses | Passed |
| Mobile and desktop viewport checks | Passed at 320, 390, 768, 1024, and 1440px |
| Browser uncaught JavaScript errors during regression | None |
| Live public catalog read | HTTP 200; 18 active products returned |
| Live public delivery PIN read | HTTP 200 |
| Live unauthenticated order read | Denied: HTTP 401 / SQLSTATE 42501 |
| Isolated PostgreSQL migrations + privacy/pricing/idempotency/preorder suites | Passed; platform Auth/Data API still require staging verification |
| ESLint | Passed: zero errors and warnings |

Browser regression covers pack selection and quantity, PIN prefill and edits, unavailable PIN rejection, decimal delivery charges, one simulated checkout submission, tracking reload, related-product reload, legal reload, catalog navigation, simulated staff login/status/payment updates, update failure, admin refresh returning home, reseller link, mobile menu, mobile product/checkout layout, scaled cleaned weights, and website preorders with date persistence, COD confirmation, tracking/admin dates, product eligibility and temporary closure.

No real orders or staff updates were created during this review. Mocked browser tests validate application behavior; they do not validate live database authorization or real CAPTCHA tokens. Only the listed read-only live requests were made. The connected Supabase account did not expose this project, so live database policy inspection was unavailable.

## Still outstanding

- Deploy the local updates when requested, then test one full order on a real phone, including staff payment confirmation and tracking.
- Verify real Turnstile challenges and Supabase CAPTCHA enforcement on the deployed hostname.
- Finish the custom domain/DNS and confirm HTTPS and the final configured website URL.
- Owner details: grievance officer, registration-number verification, and founder photo if desired.
- Revised Why Matsya copy (#6) is still awaiting the owner.
- The owner reports completing the preorder migration and SQL tests in Supabase. This was also tested in isolated PostgreSQL; the remote application has not been independently verified by Codex. See PREORDERS.md.
- Razorpay online payments are deferred per the owner; all current website orders remain pay on delivery.

The separately sold Starter Visibility Package remains outside this work.

## Repeating checks

Run `npm.cmd run lint`, `node --test scripts/*.test.mjs` and `npm.cmd run build` from the repository root.

For browser regression, run a local Vite server on port 5173, set `MATSYA_PLAYWRIGHT` to an installed Playwright `index.mjs` file, and run `node scripts/browser-review.mjs`. The script uses installed Microsoft Edge, mocks Supabase/CAPTCHA requests, and writes screenshots into the Windows temporary directory. Playwright was installed in a temporary directory for this review, not added to the website dependencies.
