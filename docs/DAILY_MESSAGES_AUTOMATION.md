# ShubhLink — દરરોજ નવા AI મેસેજ (Live)

## What's installed

- Supabase project: `wbwxljfzzavtvzpheimi`, isolated from other applications.
- Edge Function: `daily-wishes`, private scheduled server-side Gemini writer.
- Database job name: `shubhlink-daily-new-wishes`, **active**.
- Cron schedule: `0 1,7,13 * * *` **GMT/UTC**, meaning approximately 6:30 AM, 12:30 PM, and 6:30 PM India time.
- Only the **first successful run per India date** publishes messages; later scheduled calls skip a completed date. If the first attempt fails, a later attempt can retry.
- The existing `public.shubhlink_daily_runs` table tracks `started`, `failed`, or `completed`; `public.shubhlink_daily_publish` inserts unique items transactionally.
- The daily function generates up to **6 original Gemini messages** daily: 4 Gujarati, 1 Hindi and 1 English across rotating occasion categories (Morning/Suvichar and others).
- The private request token lives only in Supabase Vault as `shubhlink_daily_job_token`. Cron reads it at runtime. **Never commit or show the decrypted token.**
- The function verifies this token with an RPC callable **only by service_role** before accessing Gemini or publishing. Public users can only read published messages under RLS.
- Gemini API key remains server-only in Supabase Edge Functions Secrets; no keys are embedded in GitHub Pages files.

## Verified 2026-11-16

A completed daily batch was recorded with `generated_count=6`, and six published messages were confirmed with `source='ai_daily'` and `generated_on='2026-11-16'`.

## Website integration

`wishes.html` now runs `category-page.js` instead of the slow all-categories loader. Static messages render immediately, then the newest public Supabase records for the selected category/language appear on top. All available messages render without a “બીજા અલગ મેસેજ જુઓ” button. WhatsApp Share opens the existing name-and-preview dialog.

## Monitoring

Check the jobs and latest status in the ShubhLink project SQL editor:

```sql
select jobid,jobname,schedule,active from cron.job
where jobname='shubhlink-daily-new-wishes';

select run_date,status,attempts,generated_count,error_code,updated_at
from public.shubhlink_daily_runs order by run_date desc limit 10;

select generated_on,language,category_id,title
from public.shubhlink_messages where source='ai_daily'
order by created_at desc limit 30;
```

**Cost and reliability:** The project has not been upgraded to a paid plan. Gemini Free Tier and Supabase Free usage limits can change or block a daily run; do not guarantee unlimited, uninterrupted, or cost-free generation. No visitor login is required for reading or sharing messages.
