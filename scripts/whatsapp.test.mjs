import test from 'node:test';
import assert from 'node:assert/strict';
import { getWhatsAppReceiptLink } from '../src/lib/whatsapp.js';

test('receipt preserves pending UPI, address details, and the configured tracking URL', () => {
  const order = { order_number: 22, customer_phone: '9372379317', payment_method: 'UPI', payment_status: 'pending', pincode: '400015', landmark: 'Near the gate', delivery_address: 'Test address', total_amount: 112.5 };
  const link = new URL(getWhatsAppReceiptLink(order, 'https://www.matsyafisheriess.com'));
  assert.equal(link.pathname, '/919372379317');
  const message = link.searchParams.get('text');
  assert.match(message, /UPI on Delivery - Pending/);
  assert.match(message, /400015/);
  assert.match(message, /Near the gate/);
  assert.match(message, /https:\/\/www.matsyafisheriess.com\/#track/);
  assert.doesNotMatch(message, /\$\{/);
  const paid = new URL(getWhatsAppReceiptLink({ ...order, customer_phone: '+91 93723 79317', payment_status: 'paid' })).searchParams.get('text');
  assert.match(paid, /UPI on Delivery - Paid/);
  assert.equal(getWhatsAppReceiptLink({ ...order, customer_phone: '' }), '#');
  const preorder = new URL(getWhatsAppReceiptLink({ ...order, order_type: 'preorder', delivery_date: '2026-10-28' })).searchParams.get('text');
  assert.match(preorder, /Preorder delivery date:\* 28 Oct 2026/);
  assert.match(preorder, /UPI on Delivery - Pending/);
});
