# ShubhLink backend activation guide

## Already deployed
- The public website remains live, free and usable without login.
- `account.html` shows the phone-OTP account flow; disabled until configured.
- `secure-admin.html` provides email/password login and direct Save/Publish. It is inaccessible for modifications without verified admin permissions.
- `backend/shubhlink_schema.sql` includes RLS for public wishes, owner-only publishing and private saved messages.
- `backend-config.js` currently has empty fields; neither credentials nor secrets are stored.

## Enable Supabase
1. Create/connect a Supabase project (Free plan if suitable).
2. Run the full `backend/shubhlink_schema.sql` in SQL Editor **on a newly created project**. For an existing backend review conflicts first.
3. In Authentication -> Users create a real admin user with an email and strong password. Enable secure email/password auth; **never place this password in the repository**.
4. Copy the admin user's exact UUID, then run once in SQL Editor (replace placeholder):
   `insert into public.shubhlink_admins(user_id) values ('ADMIN-AUTH-UUID');`
   This role assignment uses the verified Auth user UUID, not a name, email, or editable user profile. It can be revoked by deleting that row.
5. In `backend-config.js`, set the Project URL and **publishable (anon) key**. This key is designed for the client, provided all tables use correct RLS (the included schema enforces that). **Never publish a service_role or secret key.**
6. Set Auth -> URL Configuration -> Site URL: `https://shubhlink.github.io` (and redirect allowlist as needed).
7. In `secure-admin.html`, sign in as your admin user. Use Save & Publish; fresh public visits fetch the published messages immediately through Supabase REST.
8. For user accounts: enable Phone authentication, configure a supported SMS OTP provider and test provider delivery. **This can cost money and may need Indian DLT compliance.** Without provider, phone OTP will not work and the account flow should not be marketed as live.
9. Test two ordinary user accounts and one admin; confirm ordinary users cannot add/edit public content or read each other's saved messages. Confirm unauthenticated users can still share messages.
10. Confirm Privacy Policy and a working support/contact channel before collecting real visitor phone numbers. Consider rate limits and CAPTCHA to prevent SMS abuse.

## URL links
Public: https://shubhlink.github.io/
Account: https://shubhlink.github.io/account.html
Secure admin: https://shubhlink.github.io/secure-admin.html
Old manual publishing fallback: https://github.com/ShubhLink/shubhlink.github.io/actions/workflows/shubhlink-admin.yml

## Notes
- Until Supabase is connected, `backend-config.js` is intentionally blank. New public pages remain available and still show built-in original wishes.
- Backend admin Save will create DB records; it does not require GitHub Actions.
- Public pages fetch current published DB records on each page visit without caching. Existing static messages remain as a fallback.
- Passwords, OTPs, SMS provider secrets and service_role keys should remain only in their respective provider consoles.
- Realtime subscriptions may be added later if already-open visitor sessions must update without a page refresh.
