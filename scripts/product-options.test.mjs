import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanedWeightRange, formatCleanedWeight } from '../src/services/cleanedWeight.js';
import { earliestPreorderDate, validatePreorderDate, isPreorderProduct } from '../src/services/preorder.js';
import { productDiscount, productCuts, formatForDetailsPage } from '../src/services/productPresentation.js';

test('discounts use the listed MRP and never invent a reference price', () => {
  assert.deepEqual(productDiscount(400, 500), { originalPrice: 500, discountPercent: 20 });
  assert.equal(productDiscount(399, 479).discountPercent, 16);
  for (const mrp of [null, undefined, 0, 300, 400, 'invalid']) {
    assert.deepEqual(productDiscount(400, mrp), { originalPrice: null, discountPercent: 0 });
  }
});

test('basic cuts remain selectable in details and preorders when detailed cuts are empty', () => {
  const fish = { name: 'Surmai', standard_cut: 'Cleaned', cut_options_detail: [], cut_options: ['Steaks', 'Fillets'] };
  assert.deepEqual(productCuts(fish).map(cut => cut.name), ['Steaks', 'Fillets']);
  assert.deepEqual(formatForDetailsPage(fish).cuts.map(cut => cut.name), ['Steaks', 'Fillets']);
  assert.deepEqual(productCuts({ ...fish, cut_options_detail: [{ name: 'Whole', description: 'Custom preparation' }] }),
    [{ name: 'Whole', description: 'Custom preparation' }]);
  assert.deepEqual(productCuts({ standard_cut: 'Cleaned', cut_options_detail: [null, {}] }).map(cut => cut.name), ['Cleaned']);
});

test('owner-provided cleaned weights scale with pack size and quantity', () => {
  for (const name of ['Surmai', 'Rawas', 'Bombil']) {
    assert.deepEqual(cleanedWeightRange({ name }, 1000), [700, 800]);
    assert.deepEqual(cleanedWeightRange({ name }, 500), [350, 400]);
    assert.deepEqual(cleanedWeightRange({ name }, 500, 3), [1050, 1200]);
  }
  for (const name of ['White Prawns', 'Tiger Prawns', 'Sardines', 'Squids', 'Squid']) {
    assert.deepEqual(cleanedWeightRange({ name }, 1000), [500, 700]);
    assert.deepEqual(cleanedWeightRange({ name }, 500), [250, 350]);
  }
  assert.equal(cleanedWeightRange({ name: 'Pomfret' }, 1000), null);
  assert.equal(cleanedWeightRange({ name: 'Surmai' }, 500, 0), null);
  assert.equal(formatCleanedWeight([1050, 1200]), '1,050–1,200g');
});

const now = new Date('2026-10-26T19:00:00Z'); // Already 27 October in India.
test('preorder dates honor configured notice in India time', () => {
  assert.equal(earliestPreorderDate(now, 2), '2026-10-29');
  assert.doesNotThrow(() => validatePreorderDate('2026-10-29', 2, now));
  for (const date of ['2026-10-28', '2026-02-30', 'invalid', '']) assert.throws(() => validatePreorderDate(date, 2, now));
  assert.throws(() => earliestPreorderDate(now, null));
});
test('only available premium catalog products can be preordered', () => {
  const product = { category: 'Premium Sea Fish', is_active: true, in_stock: true };
  assert.equal(isPreorderProduct(product), true);
  for (const update of [{ category: 'Daily Catch' }, { in_stock: false }, { is_active: false }]) assert.equal(isPreorderProduct({ ...product, ...update }), false);
});
