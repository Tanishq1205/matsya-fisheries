import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { finishCaptcha, getCaptchaSnapshot, loadTurnstile, subscribeCaptcha } from '../../services/captcha';

function Challenge({ request }) {
  const container = useRef(null);
  const dialog = useRef(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => { node.close(); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    let api;
    let widget;
    loadTurnstile().then(turnstile => {
      if (cancelled) return;
      api = turnstile;
      widget = api.render(container.current, {
        sitekey: request.siteKey, theme: 'light', size: 'flexible',
        callback: token => { if (!cancelled) finishCaptcha(request.id, token); },
        'error-callback': () => { if (!cancelled) setError('Verification failed. Please retry.'); return true; },
        'expired-callback': () => { if (!cancelled) setError('Verification expired. Please retry.'); },
        'timeout-callback': () => { if (!cancelled) setError('Verification timed out. Please retry.'); },
      });
    }).catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; if (api && widget != null) api.remove(widget); };
  }, [request, attempt]);
  const cancel = () => finishCaptcha(request.id, null, new Error('Verification cancelled. Please try again when ready.'));
  return (
    <dialog ref={dialog} onCancel={event => { event.preventDefault(); cancel(); }}
      aria-labelledby="verification-title" className="m-auto w-[min(92vw,380px)] rounded-2xl p-6 text-[#1D184D] backdrop:bg-black/60">
      <h2 id="verification-title" className="text-lg font-bold mb-2">Quick security check</h2>
      <p className="text-sm mb-4">Complete verification to continue.</p>
      <div ref={container} className="min-h-16" />
      {error && <p role="alert" className="text-sm text-red-700 mt-3">{error}</p>}
      <div className="flex gap-4 mt-4">
        {error && <button type="button" className="underline text-sm" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Retry verification</button>}
        <button type="button" className="underline text-sm" onClick={cancel}>Cancel</button>
      </div>
    </dialog>
  );
}

export default function CaptchaDialog() {
  const request = useSyncExternalStore(subscribeCaptcha, getCaptchaSnapshot, () => null);
  return request ? <Challenge key={request.id} request={request} /> : null;
}
