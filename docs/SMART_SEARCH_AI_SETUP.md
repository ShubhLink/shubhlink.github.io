# ShubhLink — Calendar, Search, Gujarati names and optional AI

## Working without accounts or paid services
- Public visitors need **no login** and can search, edit and share messages free.
- Home page shows a time-aware top card based on **Asia/Kolkata**: Good Morning before noon, Good Afternoon midday and Good Night in the evening.
- On a listed festival date, it displays a festival card. The next important Gujarat/India occasions are shown alongside an interactive month calendar.
- All 1,300+ published original messages can be searched across categories via \`search.html\`; the old category filter remains on \`wishes.html\`.
- Topic aliases include Gujarati, Hindi and English and occasion-specific messages are assembled for supported festival searches.
- Visitors can enter a name in English in the editor and, if Gujarati is selected, it is converted to Gujarati script where possible. Common names use a curated dictionary; uncommon names use approximate phonetic transliteration. Results remain editable.
- If cloud AI is **not configured**, Search has **free local Smart Draft** suggestions. These are **not** from an AI model.

## Dates and accuracy
The manually curated festival dates in \`calendar.js\` currently cover November–December 2026 and selected observances in 2027. They are not an authoritative daily Panchang feed; date lists must be refreshed annually and some lunar observances vary by location or sect.

Sources:
- Gujarat Government GAD 2027 Holiday Notification (dated 04-Nov-2026): https://www.simpliance.in/download/file/dXBsb2Fkcy9nb3Z0bm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbiByZWdhcmRpbmcgTGlzdCBvZiBIb2xpZGF5IGZvciB0aGUgWWVhciAyMDI3IGluIEd1amFyYXQucGRm
- 2026 Drik Panchang Gujarati Calendar: https://www.drikpanchang.com/gujarati/calendar/gujarati-calendar.html
- 2027 Panchang may differ for some days; official Gujarat notified dates take precedence on government observances.

## Activate genuine AI (requires owner action)
1. Open https://aistudio.google.com/api-keys and generate a Gemini Developer API key. Confirm the project is on the **Free tier**. **Do not enable billing** unless you knowingly accept costs.
2. In the **ShubhLink** Supabase project \`wbwxljfzzavtvzpheimi\`, navigate to Edge Functions → Secrets:
   https://supabase.com/dashboard/project/wbwxljfzzavtvzpheimi/settings/functions
3. Add exactly one secret with name \`GEMINI_API_KEY\` and the key as its value. Do **not** paste the value into GitHub, frontend JS, AdSense, or a ChatGPT conversation.
4. After saving, go to https://shubhlink.github.io/search.html. Type an occasion and click **નવા મેસેજ બનાવો**.
5. The deployed \`compose-wish\` Edge Function will use \`gemini-2.5-flash-lite\` and generate at most three messages. On errors/rate limits it returns an error and the website gracefully falls back to local Smart Drafts.
6. Do not advertise unlimited or always-free AI: providers may revise quotas and terms. Check usage and avoid upgrading Free to Paid inadvertently.

AI Backend:
- URL: \`https://wbwxljfzzavtvzpheimi.supabase.co/functions/v1/compose-wish\`
- Function source: \`supabase/functions/compose-wish/index.ts\`
- Only requests from \`https://shubhlink.github.io\` are allowed by the Origin check (not strong client authentication); request counts are additionally rate limited using a hashed network identifier, approximately six uses per day per IP, with provider quotas as a final backstop.
- Server stores API keys as environment secrets. Browser only contains the **publishable** Supabase project key.
- Free-tier submitted content may be used by Google to improve services, depending on Google terms. Avoid personal/sensitive prompts and include a prominent disclosure.

## Test checklist
- Load home at 7 AM IST: first recommended category is Good Morning.
- Load home during afternoon: first recommended category is Good Afternoon; evenings: Good Night.
- Open the month view, change months and tap a marked occasion.
- Search \`દિવાળી\`, \`birthday\`, \`મિત્રતા\`, and \`Jalaram\` and change language.
- Type \`Divyesh Patel\` in the editor with Gujarati selected; it should become \`દિવ્યેશ પટેલ\` on blur / before sharing. Manual Gujarati entry should remain unchanged.
- AI not configured: local Smart Drafts should still work, clearly labeled **not AI**.
- Admin login and Save/Publish should continue to work; public registration remains removed.
