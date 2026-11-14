# ShubhLink Premium Wish Discovery — 14 November 2026

## Visible experience
- Home: the correct morning/afternoon/night occasion plus curated original wishes now rotate between page visits, and category previews rotate too.
- Categories (`wishes.html`): shows a quality-first subset of 4–8 wishes. **↻ બીજા અલગ મેસેજ જુઓ** draws another set. The current search and language filters stay available.
- Smart Search (`search.html`): matches the user's occasion and relationship; shows curated-only texts when the live database has premium content. The `✦ AI થી બિલકુલ નવા મેસેજ` button explicitly calls the existing Gemini Edge Function, displays three novel messages, and shares through the existing preview dialog.
- AI Studio (`ai.html`): still supports conversation/refinement and now avoids the recent AI outputs in the same browser session.
- No user sign-in required. Super Admin stays unchanged. WhatsApp shares a clean, readable message.

## Curated collection
- Original total in database after this update: **1,560** published messages.
- **260 featured hand-written/editorially curated**: Gujarati 140, Hindi 60, English 60.
- This update adds 201 messages (Gujarati 81, Hindi 60, English 60).
- The earlier formula-combined bulk of 1,300 is kept in Supabase for rollback but excluded from normal visitor search/category displays when a curated database exists. On a backend outage, the original built-in messages remain available as a fallback.
- Backups: `content-library/premium-gujarati-originals-v2.json`, `premium-hindi-originals-v2.json`, `premium-english-originals-v2.json`.

## Freshness and caveats
- `fresh.js` records a small rolling set of **hashes of previously displayed public messages** in the user's **localStorage**. It does *not* identify or track IP addresses. Another browser/device starts its own rotation.
- Within a finite pool, messages rotate until the available choices are exhausted; eventually repetition is unavoidable. Truly new on-demand wording comes from Gemini via the Search AI button or AI Studio, subject to the existing **30 requests per IP per India day** quota and the Google API's own Free Tier.
- Visitors are not automatically charged AI requests on every page load or ordinary search: AI is activated on explicit user interaction. The Gemini key stays a server-side secret.
- LocalStorage persistence depends on the browser; clearing site data resets rotation history.
- All original messages are project-authored, not copied from Google or third-party sites.

## Verification
- 2026-11-14: `fresh.js` tested across simulated reloads; two consecutive sets of 8 from 17 candidates had zero overlap.
- Live public browser test: searching `જન્મદિવસ` twice showed different first results and the explicit AI button returned three distinct Gemini messages, with success status. Following that test, low-quality non-curated content was filtered out via a later code update.
- GitHub JavaScript parse checks passed; Supabase count query confirmed 1,560 published and 260 curated (140/60/60).

## Maintenance
- Edit/publish premium content through the existing secure Admin backend. Mark featured only for messages which have distinct concrete imagery, occasion specificity, fresh wording, and natural language. Avoid mixing random sentence fragments or using filler greetings.
- Keep the 2026–2027 festival calendar updated manually and verify upcoming movable lunar festival dates.
