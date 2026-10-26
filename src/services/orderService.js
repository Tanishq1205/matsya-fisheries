import { supabase } from '../lib/supabaseClient';
import { checkoutFingerprint, getCheckoutRequest } from './checkoutRequest';
import { requestCaptchaToken } from './captcha';

let pendingSession;
export async function ensureCustomerSession() {
  if (!pendingSession) {
    pendingSession = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) return data.session;
      const captchaToken = await requestCaptchaToken();
      const result = await supabase.auth.signInAnonymously({ options: { captchaToken } });
      if (result.error) throw result.error;
      return result.data.session;
    })().finally(() => { pendingSession = null; });
  }
  return pendingSession;
}

export async function placeOrder(payload) {
  const session = await ensureCustomerSession();
  const order = { ...payload };
  delete order.created_at;
  const fingerprint = await checkoutFingerprint(session.user.id, order);
  const submit = async () => {
    const requestId = getCheckoutRequest(fingerprint);
    const { data, error } = await supabase.rpc('place_order_once', {
      request_id: requestId, order_payload: order,
    }).single();
    if (error) throw error;
    return data;
  };
  // Coordinate same-origin tabs as well as rapid clicks. The database remains
  // authoritative if simultaneous requests with the same key reach it.
  return navigator.locks ? navigator.locks.request('matsya-order-submit', submit) : submit();
}
