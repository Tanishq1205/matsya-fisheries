const STORAGE_KEY = 'matsya_checkout_requests_v1';

// Only store a digest and random request ID, never customer details.
export async function checkoutFingerprint(customerId, payload) {
  const { created_at: _createdAt, ...order } = payload;
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  const bytes = new TextEncoder().encode(JSON.stringify(canonical({ customerId, order })));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getCheckoutRequest(fingerprint, storage = localStorage, uuid = () => crypto.randomUUID()) {
  const raw = storage.getItem(STORAGE_KEY);
  // Fail closed if storage is unavailable/corrupt rather than retry with a new ID.
  const requests = raw ? JSON.parse(raw) : {};
  if (requests[fingerprint]) return requests[fingerprint];
  const id = uuid();
  requests[fingerprint] = id;
  storage.setItem(STORAGE_KEY, JSON.stringify(requests));
  return id;
}

export function clearCheckoutRequests(storage = localStorage) {
  storage.removeItem(STORAGE_KEY);
}
