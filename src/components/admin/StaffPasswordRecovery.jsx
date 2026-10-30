import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { adminSupabase } from '../../lib/supabaseClient';

export default function StaffPasswordRecovery() {
  const [account, setAccount] = useState(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // getUser waits for link processing and verifies the session with Auth.
    adminSupabase.auth.getUser().then(({ data, error: problem }) => {
      if (cancelled) return;
      if (problem || !data.user?.email || data.user.is_anonymous) {
        setError('This recovery link is invalid or has expired. Request a new password recovery email from Supabase.');
      } else {
        setAccount(data.user.email);
      }
    }).catch(() => {
      if (!cancelled) setError('Could not verify the recovery link. Check your connection and reopen the email link.');
    }).finally(() => {
      if (!cancelled) {
        // Remove credentials/error fragments while keeping refresh on this page.
        window.history.replaceState(null, '', `${window.location.pathname}?staff-recovery=1`);
        setChecking(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const submit = async event => {
    event.preventDefault();
    if (pending.current || !account) return;
    setError('');
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    pending.current = true;
    setSaving(true);
    try {
      const { error: problem } = await adminSupabase.auth.updateUser({ password });
      if (problem) throw problem;
      setPassword('');
      setConfirmation('');
      setComplete(true);
      await adminSupabase.auth.signOut({ scope: 'local' });
    } catch (problem) {
      setError(problem.message || 'Could not update your password. Please try again.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7EE] text-[#1D184D] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#1D184D]/10 p-7 sm:p-9 shadow-lg space-y-5">
        <Lock className="w-8 h-8 text-[#C2542D]" aria-hidden="true" />
        <h1 className="text-2xl font-bold">{complete ? 'Password updated' : 'Reset your staff password'}</h1>
        {checking ? <p role="status">Checking your recovery link...</p> : complete ? (
          <p role="status">Your new password is saved. Return to the website, open admin with Ctrl+Shift+A, and sign in with your email and new password.</p>
        ) : account ? (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm break-all">Set a new password for {account}.</p>
            <label className="block text-sm font-semibold">New password
              <input type="password" autoComplete="new-password" minLength={8} required disabled={saving}
                value={password} onChange={event => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#1D184D]/20 p-3 font-normal" />
            </label>
            <label className="block text-sm font-semibold">Confirm new password
              <input type="password" autoComplete="new-password" minLength={8} required disabled={saving}
                value={confirmation} onChange={event => setConfirmation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#1D184D]/20 p-3 font-normal" />
            </label>
            <button type="submit" disabled={saving}
              className="w-full rounded-full bg-[#1D184D] text-[#D5C582] py-3 font-bold disabled:opacity-50">
              {saving ? 'Saving password...' : 'Save new password'}
            </button>
          </form>
        ) : null}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!saving && <a href={window.location.pathname} className="inline-block text-sm font-semibold underline">Return to website</a>}
      </div>
    </main>
  );
}
