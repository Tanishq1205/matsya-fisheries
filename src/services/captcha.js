let active = null;
const listeners = new Set();
const notify = () => listeners.forEach(listener => listener());
export const subscribeCaptcha = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const getCaptchaSnapshot = () => active;

export function finishCaptcha(id, token, error) {
  if (!active || active.id !== id) return;
  const request = active;
  active = null;
  clearTimeout(request.timer);
  notify();
  if (error) request.reject(error);
  else if (token) request.resolve(token);
  else request.reject(new Error('Verification did not complete. Please try again.'));
}

export function requestCaptchaToken(siteKey = import.meta.env?.VITE_TURNSTILE_SITE_KEY) {
  if (!siteKey) return Promise.resolve(undefined);
  if (active) return Promise.reject(new Error('A verification is already in progress. Please complete it first.'));
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => finishCaptcha(id, null, new Error('Verification timed out. Please try again.')), 120000);
    active = { id, siteKey, resolve, reject, timer };
    notify();
  });
}

let loading;
export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => fail(), 20000);
      const fail = () => {
        clearTimeout(timer); script.remove(); loading = null;
        reject(new Error('Could not load verification. Check your connection and try again.'));
      };
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        if (!window.turnstile) { fail(); return; }
        clearTimeout(timer); resolve(window.turnstile);
      };
      script.onerror = fail;
      document.head.append(script);
    });
  }
  return loading;
}
