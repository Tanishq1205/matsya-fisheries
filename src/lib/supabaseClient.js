import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase keys in .env! Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const recoveryParams = new URLSearchParams(window.location.hash.slice(1));
export const isStaffRecoveryLink = recoveryParams.get('type') === 'recovery'
  || new URLSearchParams(window.location.search).get('staff-recovery') === '1'
  || recoveryParams.get('error_code') === 'otp_expired';

// Only the staff client consumes password-recovery credentials from the URL.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { detectSessionInUrl: !isStaffRecoveryLink },
});
// Keep the staff session separate from the guest customer session.
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'matsya_staff_session', storage: window.sessionStorage,
    persistSession: true, detectSessionInUrl: isStaffRecoveryLink,
  },
});
