import test from 'node:test';
import assert from 'node:assert/strict';
import { requestCaptchaToken, finishCaptcha, getCaptchaSnapshot, subscribeCaptcha } from '../src/services/captcha.js';

test('verification lifecycle', async t => {
  await t.test('unconfigured rollout does not request a challenge', async () => {
    assert.equal(await requestCaptchaToken(''), undefined);
    assert.equal(getCaptchaSnapshot(), null);
  });
  await t.test('token is delivered once and cleared from state', async () => {
    let notifications = 0;
    const unsubscribe = subscribeCaptcha(() => notifications++);
    const result = requestCaptchaToken('public-site-key');
    const id = getCaptchaSnapshot().id;
    finishCaptcha(id, 'one-use-token');
    assert.equal(await result, 'one-use-token');
    assert.equal(getCaptchaSnapshot(), null);
    assert.equal(notifications, 2);
    finishCaptcha(id, 'stale-token');
    assert.equal(getCaptchaSnapshot(), null);
    unsubscribe();
  });
  await t.test('two authentication requests cannot consume the same token', async () => {
    const first = requestCaptchaToken('site-key');
    const id = getCaptchaSnapshot().id;
    await assert.rejects(requestCaptchaToken('site-key'), /already in progress/);
    finishCaptcha(id, 'first-token');
    assert.equal(await first, 'first-token');
  });
  await t.test('cancellation rejects auth and permits a new challenge', async () => {
    const first = requestCaptchaToken('site-key');
    const firstId = getCaptchaSnapshot().id;
    const rejected = assert.rejects(first, /cancelled/);
    finishCaptcha(firstId, null, new Error('Verification cancelled'));
    await rejected;
    const retry = requestCaptchaToken('site-key');
    const retryId = getCaptchaSnapshot().id;
    assert.notEqual(firstId, retryId);
    finishCaptcha(firstId, 'expired-old-token');
    assert.equal(getCaptchaSnapshot().id, retryId);
    finishCaptcha(retryId, 'fresh-token');
    assert.equal(await retry, 'fresh-token');
  });
});
