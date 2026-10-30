// Simulated Auth only. No live password updates or recovery emails are sent.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.MATSYA_PLAYWRIGHT).href);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const base = process.env.MATSYA_REVIEW_URL || 'http://127.0.0.1:5173';
const user = { id: '22222222-2222-4222-8222-222222222222', email: 'staff@example.com', aud: 'authenticated', role: 'authenticated', is_anonymous: false, app_metadata: { role: 'admin' } };
const jwt = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub:user.id, role:'authenticated', exp:Math.floor(Date.now()/1000)+3600, app_metadata:user.app_metadata })).toString('base64url')}.mock`;
const errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('guest-session-sentinel', 'unchanged'));
    let updates = 0;
    let rejectUpdate = true;
    await context.route('**/*.supabase.co/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.endsWith('/user')) {
        if (request.method() === 'PUT') {
          updates++;
          assert.equal(request.postDataJSON().password, 'new-test-password-123');
          assert.equal('app_metadata' in request.postDataJSON(), false);
          if (rejectUpdate) return route.fulfill({ status: 422, json: { message: 'Password rejected by policy' } });
        }
        return route.fulfill({ json: user });
      }
      if (url.pathname.endsWith('/logout')) return route.fulfill({ json: {} });
      return route.fulfill({ json: [] });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/#access_token=${jwt}&refresh_token=mock-refresh&expires_in=3600&token_type=bearer&type=recovery`);
    await page.getByLabel('New password', { exact:true }).waitFor();
    assert.ok(!page.url().includes('access_token'));
    await page.getByLabel('New password', { exact:true }).fill('new-test-password-123');
    await page.getByLabel('Confirm new password', { exact:true }).fill('different-test-password');
    await page.getByRole('button', { name:'Save new password', exact:true }).click();
    await page.getByRole('alert').filter({hasText:'The passwords do not match.'}).waitFor();
    assert.equal(updates,0);
    await page.getByLabel('Confirm new password', { exact:true }).fill('new-test-password-123');
    await page.getByRole('button', { name:'Save new password', exact:true }).click();
    await page.getByRole('alert').filter({hasText:'Password rejected by policy'}).waitFor();
    assert.equal(updates,1);
    rejectUpdate=false;
    await page.reload();
    await page.getByLabel('New password', { exact:true }).waitFor();
    await page.getByLabel('New password', { exact:true }).fill('new-test-password-123');
    await page.getByLabel('Confirm new password', { exact:true }).fill('new-test-password-123');
    await page.getByRole('button', { name:'Save new password', exact:true }).click();
    await page.getByRole('heading', { name:'Password updated', exact:true }).waitFor();
    assert.equal(updates,2);
    await page.waitForFunction(() => !sessionStorage.getItem('matsya_staff_session'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('guest-session-sentinel')),'unchanged');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await context.close();
    console.log(`PASS ${width}px: recovery link, password mismatch, server rejection, refresh, successful save and staff sign-out; guest storage preserved`);
  }
  const page = await browser.newPage();
  await page.goto(`${base}/#error=access_denied&error_code=otp_expired&error_description=Expired`);
  await page.getByRole('alert').filter({hasText:'invalid or has expired'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Save new password',exact:true}).count(),0);
  assert.ok(!page.url().includes('error_description'));
  assert.deepEqual(errors,[]);
  console.log('PASS: expired link cannot update a password; no uncaught browser errors');
} finally { await browser.close(); }
