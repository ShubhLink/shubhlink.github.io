# ShubhLink — Google + Email/Password Accounts (No Phone OTP)

## Status
The static frontend has been published. **Supabase backend is NOT yet connected.** Do not claim Login, saving, or Admin direct publish is live until backend activation and end-to-end tests complete.

## Public site stays free
Guest visitors can create wishes and share them without accounts. A personal account is only for saving a display name and wishes.

## Activate Supabase backend
1. Create/connect your Supabase project.
2. Review and execute `backend/shubhlink_schema.sql` in Supabase SQL Editor once. It creates categories, messages, private profiles/saved messages, Admin role mapping and RLS policies.
3. In Supabase Authentication -> Providers -> Email: enable email/password sign-in. Keep **Confirm email enabled** for secure registrations. Users click a verification **link**, not an SMS OTP.
4. Enable the **Google** provider in Supabase Authentication -> Providers. In Google Cloud create a Web OAuth client, configure the provider callback shown in Supabase (typically `https://<project-ref>.supabase.co/auth/v1/callback`) as an Authorized redirect URI; set Google Client ID and Secret **only inside Supabase**.
5. Authentication -> URL Configuration: set `https://shubhlink.github.io` as Site URL. Add `https://shubhlink.github.io/account.html` to Redirect URLs. Confirm email and Google OAuth callbacks must return to that account page.
6. In `backend-config.js` add **only** the Supabase Project URL and public publishable/anon key. Never include a service-role key, Google OAuth secret, SMTP password or admin password in the repository.
7. Test Google login, email signup, confirmation link, email/password login, password recovery, logout, name saving, private wish save/delete, and two user accounts' isolation. Confirm guest editor/share is still accessible.
8. Admin: Create an Authentication account with a strong password, inspect its exact Auth UUID, then run `insert into public.shubhlink_admins (user_id) values ('ADMIN-AUTH-UUID');` securely in SQL Editor. Test `secure-admin.html` and RLS; ensure non-admins cannot add public messages.
9. Privacy: before collecting real user data, publish accurate retention, deletion and contact instructions and configure a working support channel.
10. Optional: enable CAPTCHA/rate limits and monitor auth abuse. No SMS provider is required.

## URLs
- Public: https://shubhlink.github.io/
- Login/account (frontend ready, backend not connected): https://shubhlink.github.io/account.html
- Secure Admin (frontend ready, backend not connected): https://shubhlink.github.io/secure-admin.html
- Legacy owner-only GitHub content workflow (currently working): https://github.com/ShubhLink/shubhlink.github.io/actions/workflows/shubhlink-admin.yml

## Security
Phone numbers are not required for sign-up. Email is used as the account identifier.
Google credentials are handled by the Google/Supabase OAuth flow, not by the static website.
The public publishable key works only because every affected table has restrictive row-level security rules.
Admin status is determined from the Auth user UUID in `shubhlink_admins`, never from browser-editable profile names.
