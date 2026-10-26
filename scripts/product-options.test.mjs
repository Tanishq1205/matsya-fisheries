import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanedWeightRange, formatCleanedWeight } from '../src/services/cleanedWeight.js';
import { earliestPreorderDate, validatePreorderDate, isPreorderProduct } from '../src/services/preorder.js';

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
