# Turnstile and Supabase setup

The site uses the public Turnstile key `0x4AAAAAAFXDxIYwi2uMETJc` in local `.env.local`. No secret key is stored in the application. The browser requests a fresh verification token before guest account creation or staff password login and sends `options.captchaToken` to Supabase. Existing customer sessions are reused without another guest signup. Tokens remain in memory only; they are not stored or logged by the CAPTCHA service.

## Deployment order

1. Keep Supabase CAPTCHA off until the updated frontend is deployed.
2. In Vercel's production environment add `VITE_TURNSTILE_SITE_KEY=0x4AAAAAAFXDxIYwi2uMETJc`, then redeploy the updated source. Local `.env.local` does not deploy through Git. Check that the live staff sign-in shows and completes the Turnstile challenge before enabling enforcement.
3. Cloudflare widget hostname management must allow `matsya-fisheries.vercel.app` and `matsyafisheriess.com`. Add `www.matsyafisheriess.com` if it will serve the site. Do not add URL schemes or paths. A local browser at localhost also needs an allowed development hostname; preferably test CAPTCHA using a separate widget and Supabase staging project rather than broadening the production widget. Cloudflare dummy test keys require matching test secret configuration and must not be used on production.
4. In Supabase → Authentication → Attack Protection enable CAPTCHA, select Cloudflare Turnstile, enter the matching **secret key directly into Supabase**, and save. Never put the secret in a VITE_ variable, source file or chat.
5. Test staff sign-in and a new guest checkout in incognito on an allowed deployed hostname. Test cancelling verification, retrying a failed check and retrying an incorrect password. Existing guest sessions do not prove that anonymous-signup enforcement works; use a fresh browser session.
6. Verify that a direct authentication request without a valid CAPTCHA token is rejected after enforcement is enabled. This remote enforcement and live browser verification have not been performed by Codex.

CAPTCHA covers Supabase authentication endpoints, not every order submitted by an already authenticated session. Order-rate limiting/abuse controls are separate. Existing ownership, pricing and duplicate-request protections remain in place.

The challenge supports cancel, retry, load failure, challenge expiry and a two-minute overall timeout. Each authentication attempt requests a new token. If browser extensions or network restrictions block challenges.cloudflare.com, verification stops authentication and presents an error.

References: [Supabase CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha), [Cloudflare client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [Cloudflare testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).
