# ShubhLink — Automatic New AI Wishes (Enabled)

## Live verified installation — 16 November 2026
- Supabase project: `wbwxljfzzavtvzpheimi`.
- Protected function: `https://wbwxljfzzavtvzpheimi.supabase.co/functions/v1/daily-wishes`.
- Supabase Cron job: **`shubhlink-daily-new-wishes`**, ID 1, **active**.
- Cron UTC schedule: `0 1,7,13 * * *` = **06:30, 12:30, 18:30 IST**. The later checks retry only if generation failed; the completed date cannot be generated twice.
- Each completed day aims to publish **six truly new AI-produced wishes**: four Gujarati, one Hindi, one English, in rotating active categories.
- First successful live run: **16 Nov 2026**, six messages inserted into `public.shubhlink_messages`; run status `completed`, published `true`, `featured=true`, `source='ai_daily'`, `generated_on='2026-11-16'`.
- Subsequent visits to the public site fetch live published content via Supabase PostgREST. Homepage shows up to four latest Gujarati additions in the **નવા ઉમેરાયેલા મેસેજ** section; category and search also include them.
- Previous user-facing Gemini chat quota is separate (**30 per IP per day**). The one server-to-server daily batch does not consume visitors' per-IP quota.

## Security
- Function has `verify_jwt=false` at platform because Cron uses a Vault secret rather than a user JWT; **an unguessable 64-character token is mandatory** in `x-shubhlink-job-token`, verified by a database RPC permitted to service role only.
- Token generated directly inside Supabase Vault as `shubhlink_daily_job_token`; neither GitHub nor browser assets hold the secret.
- Privileged daily generation tables and database RPCs deny `anon` and `authenticated` access, with Row Level Security on run tracking.
- Supabase service-role and Google Gemini API keys stay only in Edge Function environment, never in GitHub / JavaScript / browser.
- Writes use validated categories, language, title/body length, deduplicate via the existing unique body index, and record completion atomically.
- Free tier and provider limits can interrupt scheduled generation; retry checks are scheduled but **no guaranteed daily delivery** when Gemini is unavailable or the free quota is exhausted.
- Google billing was not enabled by this work.

## Operation
Check daily job results:
```sql
select run_date,status,generated_count,attempts,error_code
from public.shubhlink_daily_runs order by run_date desc limit 14;
```
See new messages:
```sql
select generated_on,category_id,language,title
from public.shubhlink_messages where source='ai_daily'
order by created_at desc limit 30;
```
Stop all automatic generation (owner/admin only):
```sql
select cron.unschedule('shubhlink-daily-new-wishes');
```
Re-enable via the migration schedule in the project database or Cron dashboard. Edge Function source is version-controlled under `supabase/functions/daily-wishes/index.ts`.

## Public category UX
In `site.js`, categories immediately render 16 messages at a time. An `IntersectionObserver` loads more automatically on scroll without an explicit "બીજા અલગ મેસેજ જુઓ" button. Featured originals come first, older nonduplicate messages remain available afterwards. Guests never need accounts or OTP to browse and share.
