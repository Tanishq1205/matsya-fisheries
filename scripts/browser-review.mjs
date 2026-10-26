// Run with MATSYA_PLAYWRIGHT pointing to a Playwright module, and a local Vite server.
// All Supabase and CAPTCHA requests are mocked: this never creates live orders.
import assert from 'node:assert/strict';
import { earliestPreorderDate, formatDeliveryDate } from '../src/services/preorder.js';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.MATSYA_PLAYWRIGHT).href);
const base = process.env.MATSYA_REVIEW_URL || 'http://127.0.0.1:5173';
const products = ['Surmai', 'Rawas', 'Unavailable Fish'].map((name, i) => ({
  id: `33333333-3333-4333-8333-33333333333${i}`, name, category: 'Premium Sea Fish',
  price_500g: 399, price_1kg: 750, standard_cut: 'Cleaned & RO Washed', landing_origin: 'Cleaned & RO Washed', subtitle: 'Cleaned in pure RO water', is_active: true,
  in_stock: i !== 2, image_url: '/images/hero/hero-fish.png', created_at: new Date().toISOString(),
}));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
let order;
let submissions = 0;
let rejectStatus = false;
let preorderNotice = 2;
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  window.turnstile = { render: (_, options) => { setTimeout(() => options.callback('mock-token'), 50); return 'mock'; }, remove: () => {} };
});
await context.route('**/*.supabase.co/**', async route => {
  const req = route.request();
  const url = new URL(req.url());
  const json = data => route.fulfill({ json: data });
  if (url.pathname.includes('/auth/v1/')) {
    if (url.pathname.endsWith('/logout')) return json({});
    const admin = url.searchParams.get('grant_type') === 'password';
    const user = { id: admin ? '22222222-2222-4222-8222-222222222222' : '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', is_anonymous: !admin, app_metadata: admin ? { role: 'admin' } : {} };
    const payload = { sub: user.id, role: 'authenticated', exp: Math.floor(Date.now()/1000) + 3600, app_metadata: user.app_metadata, is_anonymous: !admin };
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.mock`;
    return json({ access_token: token, refresh_token: 'mock-refresh', token_type: 'bearer', expires_in: 3600, user });
  }
  if (url.pathname.endsWith('/preorder_settings')) return json({ min_notice_days: preorderNotice });
  if (url.pathname.endsWith('/products')) {
    const id = url.searchParams.get('id')?.replace('eq.', '');
    return json(id ? products.find(p => p.id === id) : products);
  }
  if (url.pathname.endsWith('/serviceable_pincodes')) {
    const pin = url.searchParams.get('pincode')?.replace('eq.', '');
    return json(pin === '400015' ? { pincode: pin, area: 'Sewri', status: 'Available', zone_id: 1, delivery_zones: { charge_paise: 1250 } } : null);
  }
  if (url.pathname.endsWith('/rpc/place_order_once')) {
    submissions++;
    order = { ...req.postDataJSON().order_payload, id: '44444444-4444-4444-8444-444444444444', order_number: 123, customer_id: '11111111-1111-4111-8111-111111111111', created_at: new Date().toISOString(), order_status: 'placed', payment_status: 'pending' };
    order.items = order.items.map(item => ({ ...item, cut: 'Cleaned & RO Washed' }));
    return json(order);
  }
  if (url.pathname.endsWith('/orders')) {
    if (req.method() === 'PATCH') {
      if (rejectStatus) return route.fulfill({ status: 406, json: { message: 'No rows updated', code: 'PGRST116' } });
      order = { ...order, ...req.postDataJSON() };
      return json(order);
    }
    return json(order ? [order] : []);
  }
  return route.fulfill({ status: 400, json: { message: 'Unexpected test request' } });
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.on('pageerror', e => errors.push(e.message));
const ready = async () => { await page.waitForTimeout(5500); };
const visible = text => page.getByRole('heading', { name: text, exact: true }).waitFor({ state: 'visible' });
try {
  await page.goto(base); await ready();
  await page.getByRole('button', { name: 'Add Pincode', exact: true }).click();
  await page.getByPlaceholder('Enter 6-digit Pincode').fill('400015');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Order Fresh Catch' }).click();
  await page.waitForTimeout(1500);
  assert.ok(await page.locator('#all-products').evaluate(el => el.getBoundingClientRect().top < 200));
  await page.locator('#all-products').getByRole('heading', { name: 'Surmai', exact: true }).click();
  await visible('Surmai');
  assert.doesNotMatch(await page.locator('body').innerText(), /\bRO[\s-]+(?:water|washed)\b/i);
  assert.match(await page.locator('main').innerText(), /350–400g/);
  await page.getByRole('button', { name: 'Add one pack' }).click({ clickCount: 2 });
  assert.match(await page.locator('main').innerText(), /3 × 500g = 1.5kg total/);
  assert.match(await page.locator('main').innerText(), /1,050–1,200g/);
  await page.getByRole('button', { name: /ADD TO CART/ }).click();
  await page.getByRole('button', { name: 'View Shopping Cart' }).click();
  await page.getByRole('button', { name: /checkout/i }).click();
  await visible('Billing & Shipping');
  assert.equal(await page.locator('[name=pincode]').inputValue(), '400015');
  await page.reload(); await ready();
  await visible('Billing & Shipping');
  assert.equal(await page.locator('[name=pincode]').inputValue(), '400015');
  await page.locator('[name=pincode]').fill('999999');
  await page.getByRole('button', { name: 'UNSERVICEABLE LOCATION' }).waitFor();
  assert.ok(await page.getByRole('button', { name: 'UNSERVICEABLE LOCATION' }).isDisabled());
  await page.locator('[name=pincode]').fill('400015');
  await page.locator('[name=phone]').fill('9876543210');
  await page.locator('[name=firstName]').fill('Review');
  await page.locator('[name=streetAddress]').fill('Test address only');
  await page.getByRole('radio', { name: /UPI on delivery/ }).check();
  await page.getByRole('button', { name: /PLACE ORDER/ }).click();
  await visible('Thank You, Review!');
  assert.equal(submissions, 1);
  assert.equal(order.payment_method, 'UPI');
  assert.equal(order.payment_status, 'pending');
  assert.ok((await page.locator('main').innerText()).includes('UPI on delivery'));
  assert.equal(order.items[0].quantity, 3);
  assert.equal(order.delivery_fee, 12.5);
  assert.equal(order.total_amount, 1209.5);
  console.log('PASS: pack quantity, PIN prefill, refresh, unavailable PIN, decimal delivery, simulated order');
  await page.getByRole('button', { name: 'TRACK ORDER', exact: true }).click();
  await page.getByText('#MATSYA-123', { exact: true }).waitFor();
  assert.doesNotMatch(await page.locator('main').innerText(), /\bRO[\s-]+(?:water|washed)\b/i);
  assert.match(await page.locator('main').innerText(), /UPI on delivery.*pending/i);
  await page.reload(); await ready();
  await page.getByText('#MATSYA-123', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'Catches', exact: true }).click();
  await page.locator('#all-products').getByRole('heading', { name: 'Surmai', exact: true }).waitFor({ state: 'visible' });
  await page.locator('#all-products').getByRole('heading', { name: 'Surmai', exact: true }).click();
  await page.locator('article').getByRole('heading', { name: 'Rawas', exact: true }).click();
  assert.match(page.url(), new RegExp(products[1].id));
  await page.reload(); await ready(); await visible('Rawas');
  await page.getByRole('link', { name: 'Privacy Policy', exact: true }).click();
  await page.reload(); await ready();
  assert.match(page.url(), /#privacy-policy/);
  await page.getByRole('link', { name: 'Catches', exact: true }).click();
  await page.locator('#all-products').waitFor({ state: 'visible' });
  console.log('PASS: tracking reload, related-product URL/reload, legal reload and catalog navigation');
  await page.keyboard.press('Control+Shift+A');
  await page.getByLabel('Staff email').fill('review@example.com');
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'SIGN IN', exact: true }).click();
  await page.getByText('#MATSYA-123', { exact: true }).waitFor();
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Mark payment collected', exact: true }).click();
  assert.equal(order.payment_status, 'paid');
  await page.getByRole('button', { name: 'Delivered', exact: true }).last().click();
  await page.waitForTimeout(300);
  assert.equal(order.order_status, 'delivered');
  rejectStatus = true;
  await page.getByRole('button', { name: 'Placed', exact: true }).last().click();
  await page.waitForTimeout(300);
  assert.equal(order.order_status, 'delivered');
  await page.reload(); await ready();
  assert.ok(!page.url().includes('#admin'));
  console.log('PASS: simulated staff login, payment/status confirmation, failed update, admin reload to home');
  const reseller = new URL(await page.getByRole('link', { name: 'Resell with Us' }).getAttribute('href'));
  assert.equal(reseller.pathname, '/919372379317');
  assert.match(reseller.searchParams.get('text'), /resell/);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}`);
    if (width < 1280) {
      const pin = await page.getByRole('button', { name: /Sewri/ }).boundingBox();
      const cart = await page.getByRole('button', { name: 'View Shopping Cart' }).boundingBox();
      assert.ok(pin.x + pin.width <= cart.x, `PIN overlaps cart at ${width}`);
      await page.getByRole('button', { name: /Sewri/ }).click();
      const input = await page.getByPlaceholder('Enter 6-digit Pincode').boundingBox();
      assert.ok(input.x >= 0 && input.x + input.width <= width);
      await page.getByRole('button', { name: /Sewri/ }).click();
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
    }
    await page.screenshot({ path: `${process.env.TEMP}/matsya-review-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/?product=${products[0].id}`); await ready();
  await visible('Surmai');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.getByText('Pre-order for a later date', { exact: true }).click();
  const preorder = page.getByRole('region', { name: 'Premium fish, by preorder' });
  assert.equal(await preorder.getByLabel('Fish or variety').inputValue(), products[0].id);
  await preorder.getByLabel('Number of packs').fill('3');
  await preorder.getByLabel('Delivery date', { exact: true }).fill(earliestPreorderDate(new Date(), 1));
  assert.equal(await preorder.getByLabel('Delivery date', { exact: true }).evaluate(el => el.validity.valid), false);
  const deliveryDate = earliestPreorderDate(new Date(), 2);
  await preorder.getByLabel('Delivery date', { exact: true }).fill(deliveryDate);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: `${process.env.TEMP}/matsya-review-product-mobile.png`, fullPage: true });
  await preorder.getByRole('button', { name: 'Add preorder to basket' }).click();
  await page.getByRole('heading', { name: 'YOUR BASKET' }).waitFor();
  assert.ok((await page.locator('body').innerText()).includes(formatDeliveryDate(deliveryDate)));
  await page.getByRole('button', { name: /checkout/i }).click();
  await visible('Billing & Shipping');
  await page.reload(); await ready();
  await visible('Billing & Shipping');
  assert.equal(await page.locator('[name=pincode]').inputValue(), '400015');
  assert.ok((await page.locator('main').innerText()).includes(formatDeliveryDate(deliveryDate)));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: `${process.env.TEMP}/matsya-review-checkout-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: /PLACE ORDER/ }).click();
  await visible('Thank You, Review!');
  assert.equal(submissions, 2);
  assert.equal(order.order_type, 'preorder');
  assert.equal(order.delivery_date, deliveryDate);
  assert.equal(order.payment_method, 'COD');
  assert.equal(order.payment_status, 'pending');
  assert.equal(order.total_amount, 1209.5);
  assert.ok((await page.locator('main').innerText()).includes(`Preorder confirmed for ${formatDeliveryDate(deliveryDate)}`));
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'TRACK ORDER', exact: true }).click();
  await page.getByText('#MATSYA-123', { exact: true }).waitFor();
  assert.ok((await page.locator('main').innerText()).includes(formatDeliveryDate(deliveryDate)));
  await page.keyboard.press('Control+Shift+A');
  await page.getByLabel('Staff email').fill('review@example.com');
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'SIGN IN', exact: true }).click();
  await page.getByText('#MATSYA-123', { exact: true }).waitFor();
  assert.ok((await page.locator('main').innerText()).includes(`Delivery ${formatDeliveryDate(deliveryDate)}`));
  await page.goto(`${base}/?category=Premium%20Sea%20Fish#all-products`); await ready();
  await page.getByRole('heading', { name: 'Premium fish, by preorder' }).waitFor();
  await page.getByText('Pre-order for a later date', { exact: true }).click();
  assert.equal(await page.getByLabel('Fish or variety').locator('option').count(), 2);
  preorderNotice = null;
  await page.reload(); await ready();
  await page.getByText('Pre-order for a later date', { exact: true }).click();
  await page.getByText('Preorders are temporarily unavailable. Please check back later.').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Add preorder to basket' }).count(), 0);
  console.log('PASS: two-day preorder, pack price, basket/checkout reload, COD confirmation, tracking/admin date, unavailable products excluded and preorder closure');
  assert.deepEqual(errors, []);
  console.log('PASS: reseller link, mobile menu, viewport widths 320/390/768/1024/1440, no uncaught page errors');
} finally {
  await browser.close();
}
