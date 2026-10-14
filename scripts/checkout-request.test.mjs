import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutFingerprint, getCheckoutRequest, clearCheckoutRequests } from '../src/services/checkoutRequest.js';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};
test('retry after reload retains the request ID and stores no customer data', async () => {
  const storage = memoryStorage();
  const payload = { customer_name: 'Private name', customer_phone: '9876543210', items: [{ id: 'fish', quantity: 1 }], created_at: 'yesterday' };
  const first = await checkoutFingerprint('guest-a', payload);
  const retry = await checkoutFingerprint('guest-a', { ...payload, created_at: 'today' });
  assert.equal(first, retry);
  assert.equal(getCheckoutRequest(first, storage, () => 'request-a'), 'request-a');
  assert.equal(getCheckoutRequest(retry, storage, () => 'request-b'), 'request-a');
  const saved = storage.getItem('matsya_checkout_requests_v1');
  assert.ok(!saved.includes(payload.customer_name));
  assert.ok(!saved.includes(payload.customer_phone));
});
test('fingerprints ignore property order but separate customers and changed orders', async () => {
  const a = await checkoutFingerprint('a', { subtotal: 100, items: [{ id: 'fish', quantity: 1 }] });
  assert.equal(a, await checkoutFingerprint('a', { items: [{ quantity: 1, id: 'fish' }], subtotal: 100 }));
  assert.notEqual(a, await checkoutFingerprint('b', { subtotal: 100, items: [{ id: 'fish', quantity: 1 }] }));
  assert.notEqual(a, await checkoutFingerprint('a', { subtotal: 200, items: [{ id: 'fish', quantity: 2 }] }));
});
test('a new basket can order identical items again', () => {
  const storage = memoryStorage();
  getCheckoutRequest('basket', storage, () => 'first-purchase');
  clearCheckoutRequests(storage);
  assert.equal(getCheckoutRequest('basket', storage, () => 'second-purchase'), 'second-purchase');
});
test('storage failure stops submission rather than issuing an unpersisted retry key', () => {
  assert.throws(() => getCheckoutRequest('basket', { getItem: () => { throw new Error('Storage blocked'); } }), /Storage blocked/);
});
