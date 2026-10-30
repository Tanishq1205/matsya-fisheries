# Staff accounts

Each staff member can use a separate email and password. All approved staff currently have the same access: view every order, update fulfillment status, and confirm received payments. The website does not create staff accounts or give staff access to Supabase itself.

## Add a staff member

1. Open the **Matsya** Supabase project, then **Authentication > Users > Add user > Create new user**.
2. Enter the staff member's own email and a unique strong password. Confirm the email belongs to them; use the dashboard's auto-confirm option for this manually created staff account.
3. Copy the new user's **User UID**. Do not copy a customer/anonymous user's ID.
4. In that project's **SQL Editor**, replace the UUID below with the new staff user's UID and run it. The result must show exactly the intended staff email and `admin`.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = 'REPLACE_WITH_STAFF_USER_UUID'
  and is_anonymous is false
  and email_confirmed_at is not null
returning id, email, raw_app_meta_data ->> 'role' as staff_role;
```

5. Give the password privately to that staff member. Do not put credentials in source code, `.env`, GitHub, or chat.
6. Open the website, press **Ctrl+Shift+A** (or navigate to `#admin` after loading the site), and sign in with that email/password. A refresh intentionally returns home; open admin again to sign in.
7. Repeat for additional staff. No new deployment is required to add an account. Sign out and back in after granting or changing the role.

Creating an Auth user alone does not grant admin access. The approved role is stored in **app_metadata**, never user_metadata.

## Reset an existing staff password

1. In **Authentication > URL Configuration**, set **Site URL** to `https://www.matsyafisheriess.com` so dashboard recovery emails return to the live website. If using a staging project, use its own website URL.
2. In **Authentication > Users**, open the existing staff account and choose **Send password recovery**.
3. Open the newest recovery email privately and click its reset link. The website opens **Reset your staff password**. Enter and confirm a new password (at least 8 characters; Supabase may enforce a stricter project policy).
4. Once **Password updated** appears, return to the website and open admin with **Ctrl+Shift+A**. Sign in using the existing email and new password.
5. If the link expired or was already used, send a fresh recovery email. Do not send anyone the recovery link or its tokens. If Supabase reports an email delivery/rate-limit error, resolve that in the project's email settings before retrying.

Resetting a password preserves the user's ID and existing admin role. If login then says the account lacks staff access, check the role using the setup steps above. The reset uses the separate staff client, keeping the guest session and basket intact. This flow supports the standard Supabase dashboard recovery email; it does not use magic-link sign-in as a substitute for saving a password.

## Remove staff access

Run this for the confirmed staff UID in the trusted SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
where id = 'REPLACE_WITH_STAFF_USER_UUID'
returning id, email, raw_app_meta_data ->> 'role' as staff_role;
```

Revoke the account's active sessions through trusted Supabase administration as well. Existing access tokens may retain the old admin claim until expiry; removing the role or deleting the account is not an instant invalidation of already-issued tokens. For urgent revocation, have the project administrator handle session revocation and token expiry.

## Daily use

- **Refresh** fetches current orders; this dashboard does not update automatically in real time.
- Search by customer name, phone, PIN, UUID, order number, or `#MATSYA-123`.
- **Total Order Value** includes pending payments; it is not cash collected.
- Delivery status and payment status are independent. Mark payment collected only after receiving cash or verifying the UPI payment.
- **Lock** clears the displayed orders and password. Leaving admin signs out this staff session, without signing out the same staff account on other devices.
- Use each person's own account; the current orders table does not record which staff member last changed a status/payment.

References: [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data), [trusted Admin API metadata updates](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid), [sign-out and token expiry](https://supabase.com/docs/reference/javascript/auth-signout).
