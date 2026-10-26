import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanProductText, cleanCatalogCopy } from '../src/services/productCopy.js';
import { formatForDetailsPage } from '../src/services/productPresentation.js';

test('water-processing claims are removed while ordinary product names stay intact', () => {
  for (const text of ['Cleaned & RO Washed', 'Cleaned in pure RO water', 'Gutted, RO washed and chilled', 'Washed with reverse-osmosis water']) {
    assert.doesNotMatch(cleanProductText(text), /\bRO\b|osmosis/i);
  }
  assert.equal(cleanProductText('Rawas, cleaned and ready to cook'), 'Rawas, cleaned and ready to cook');
  assert.equal(cleanProductText(null), null);
});
test('catalog text and cut descriptions are cleaned without changing identifiers, images or prices', () => {
  const raw = { id: 'original-id', name: 'Surmai', price_1kg: 750,
    image_url: '/images/ro-washed-fish.png', landing_origin: 'Cleaned & RO Washed',
    subtitle: 'Cleaned in pure RO water', standard_cut: 'Cleaned & RO Washed',
    cut_options: ['Cleaned & RO Washed'],
    cut_options_detail: [{ id: 'cut-id', name: 'Cleaned & RO Washed', description: 'Washed in pure RO water' }] };
  const result = cleanCatalogCopy(raw);
  assert.equal(result.id, raw.id);
  assert.equal(result.image_url, raw.image_url);
  assert.equal(result.price_1kg, 750);
  assert.equal(result.cut_options_detail[0].id, 'cut-id');
  assert.equal(result.standard_cut, 'Cleaned');
  assert.equal(result.cut_options[0], 'Cleaned');
  assert.doesNotMatch(result.cut_options_detail[0].description, /\bRO\b/i);
  const details = formatForDetailsPage(raw);
  assert.equal(details.landingOrigin, 'Cleaned');
  assert.equal(details.cuts[0].name, 'Cleaned');
  assert.equal(raw.standard_cut, 'Cleaned & RO Washed');
});
test('historical cart labels are cleaned for display without changing saved cut values', () => {
  const item = { cartItemId: 'original-key', cut: 'Cleaned & RO Washed', quantity: 3 };
  assert.equal(cleanProductText(item.cut), 'Cleaned');
  assert.equal(item.cut, 'Cleaned & RO Washed');
  assert.equal(item.cartItemId, 'original-key');
});
