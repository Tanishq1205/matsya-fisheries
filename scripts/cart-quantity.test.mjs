import test from 'node:test';
import assert from 'node:assert/strict';

const saved = new Map();
globalThis.localStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
  removeItem: key => saved.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage };
const { useCartStore } = await import('../src/store/useCartStore.js');
const product = { id: 'fish', name: 'Fish', price_500g: 399, price_1kg: 750 };

test('selected pack count reaches the basket and totals use the pack price', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem(product, '500g', 'Steaks', 3);
  assert.equal(useCartStore.getState().cart[0].quantity, 3);
  assert.equal(store.getCartTotal(), 1197);
  store.addItem(product, '500g', 'Steaks', 2);
  assert.equal(useCartStore.getState().cart[0].quantity, 5);
  assert.equal(store.getCartTotal(), 1995);
  store.addItem(product, '1kg', 'Steaks', 2);
  assert.equal(useCartStore.getState().cart.length, 2);
  assert.equal(store.getCartTotal(), 3495);
});

test('quick add defaults to one pack and keeps different cuts separate', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem(product, '1kg', 'Steaks');
  store.addItem(product, '1kg', 'Cleaned');
  assert.deepEqual(useCartStore.getState().cart.map(item => item.quantity), [1, 1]);
  assert.equal(store.getCartTotal(), 1500);
});

test('invalid pack counts do not create orders with fractional or negative quantities', () => {
  const store = useCartStore.getState();
  store.clearCart();
  for (const count of [0, -1, 1.5, 1000, NaN]) store.addItem(product, '500g', 'Steaks', count);
  assert.equal(useCartStore.getState().cart.length, 0);
});

test('selected cuts override the default cut and unpriced packs cannot enter the basket', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem({ ...product, standard_cut: 'Cleaned' }, '1kg', 'Steaks');
  store.addItem({ ...product, standard_cut: 'Cleaned' }, '1kg');
  assert.deepEqual(useCartStore.getState().cart.map(item => item.cut), ['Steaks', 'Cleaned']);
  store.clearCart();
  for (const price of [null, 0, -1, NaN]) {
    assert.equal(store.addItem({ ...product, price_500g: price }, '500g'), false);
  }
  assert.equal(useCartStore.getState().cart.length, 0);
});

test('preorder baskets preserve dates and reject mixing deliveries or regular orders', () => {
  const store = useCartStore.getState();
  store.clearCart();
  const fish = { ...product, category: 'Premium Sea Fish', is_active: true, in_stock: true };
  const schedule = { deliveryDate: '2099-12-25', noticeDays: 2 };
  assert.equal(store.addItem(fish, '500g', 'Steaks', 3, schedule), true);
  assert.equal(useCartStore.getState().cart[0].orderType, 'preorder');
  assert.equal(useCartStore.getState().cart[0].deliveryDate, schedule.deliveryDate);
  assert.equal(store.addItem(fish, '1kg', 'Steaks'), false);
  assert.equal(store.addItem(fish, '1kg', 'Steaks', 1, { ...schedule, deliveryDate: '2099-12-26' }), false);
  assert.equal(store.addItem(fish, '1kg', 'Steaks', 1, schedule), true);
  assert.equal(useCartStore.getState().cart.length, 2);
  store.clearCart();
  store.addItem(fish, '1kg');
  assert.equal(store.addItem(fish, '500g', 'Steaks', 1, schedule), false);
  assert.equal(useCartStore.getState().cart[0].orderType, 'standard');
  store.clearCart();
});
