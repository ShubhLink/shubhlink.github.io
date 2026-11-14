# ShubhLink — Guest-only website, Super Admin only

Updated 2026-11-14.

## Public site
- `index.html`, `categories.html`, `wishes.html`, `create.html`: public without sign-up or sign-in. Visitors can personalize wishes, copy a message or link, and share via WhatsApp for free.
- Public account links and Save-to-Account were retired. `account.html` redirects to `create.html` for bookmarks.
- The old public draft admin screen `admin.html` redirects to `secure-admin.html`.
- `privacy.html` reflects that there are no visitor accounts or server-side visitor saved messages.

## Administrator
- Admin URL: https://shubhlink.github.io/secure-admin.html
- Owner account: verified Supabase Auth email `divpatel225@gmail.com` (already assigned to `public.shubhlink_admins`). Never put the password into the repository.
- Admin logs in with email + password. GitHub Actions owner-only workflow remains as a manual backup.
- Database RLS limits create, edit, and delete of public categories and published messages to approved admin UUIDs.
- Only 1 Auth user and 1 Admin role were present at the last database verification.

## Retired user-account database access
- The older `shubhlink_profiles` and `shubhlink_saved_messages` tables are kept for migration history only. `anon` and `authenticated` privileges were revoked; the former user-specific RLS policies removed, so they cannot be used from the site.
- See applied Supabase migration `retire_public_user_accounts_and_saved_message_access`.

## IMPORTANT — disable new registrations at Supabase Auth too
- The GitHub Pages UI no longer has user registration or public Google login.
- To block **direct API sign-ups**, a project administrator must additionally disable new user registration in Supabase Auth's hosted project configuration. The available project integration does not expose that setting; it has **not** been changed by these GitHub / SQL updates.
- Do not disable Email sign-in; the current Super Admin still requires email/password login.
- Keep Row Level Security enabled. Never expose service_role or secret keys.

Project: `wbwxljfzzavtvzpheimi` in Mumbai (separate from divyesh-stock-ai).
