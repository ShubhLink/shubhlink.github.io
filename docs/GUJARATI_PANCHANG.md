# ShubhLink — Gujarati Panchang Calendar

## Live functionality
- Every date in the month grid now displays its **Gujarati tithi at local sunrise**: e.g. `સુદ ૭`, `વદ ૫`, `સુદ પૂનમ`, or `વદ અમાસ`.
- Tapping **any** date reveals full lunar month + paksha + tithi, nakshatra, Vikram Samvat, local city, and events when listed.
- Month navigation and return-to-today remain available.
- City choices: Ahmedabad (default), Jamnagar, Rajkot, Surat, Vadodara. Geocentric tithi and local sunrise are calculated per selection.
- No login, paid API, external tracker or access to user location is needed.

## Implementation
- `vendor/astronomy.browser.min.js`: vendored MIT-licensed Astronomy Engine (see `vendor/ASTRONOMY_LICENSE.txt`). Self-hosted to avoid reliance on a third-party script CDN.
- `panchang.js`: tithi number from the Moon-Sun phase (each 12°), evaluated at local sunrise using `Astronomy.SearchRiseSet`; Moon nakshatra from sidereal longitude; Gujarati Amanta lunar month from the previous new moon and Sun's sidereal sign; approximate Lahiri ayanamsa; Vikram Samvat switching at Kartak Sud Ekam.
- `calendar-ui.js`: clickable calendar day cells and detail panel.
- `calendar.js`: curated event schedule; independently maintained, not calculated from the tithi. **Review festival dates annually.**
- `panchang.css`: responsive grid and calendar styling.

## Reference checks
Astronomical calculations run without exceptions for every day in November 2026. Cross-checked representative dates:
- 2026-11-09: આસો વદ અમાસ (VS 2082)
- 2026-11-10: કારતક સુદ એકમ (VS 2083)
- 2026-11-14: કારતક સુદ પાંચમ (VS 2083)
- 2026-11-16: કારતક સુદ સાતમ, નક્ષત્ર શ્રવણ (VS 2083)
- 2026-11-24: કારતક સુદ પૂનમ (VS 2083)
- 2027-10-30: કારતક સુદ એકમ (VS 2084)

Reference checks: https://www.drikpanchang.com/gujarati/panchang/gujarati-day-panchang.html?date=16%2F11%2F2026 and https://panchangtime.com/panchang/gujarati/daily?date=2026-11-16

**Caution:** The sidereal conversion uses an approximate Lahiri ayanamsa and locally computed sunrise. Near a tithi or nakshatra boundary, or across cities/traditions, the result can differ from a printed almanac. The site should not claim official muhurat, vrat determinations, or perfectly accurate festival predictions. Calendar festival dates are curated separately and may need correction.

## Retired Good Afternoon category
The public `afternoon` category is inactive and its messages unpublished in Supabase. `site.js` filters older bundled category content as well. Between noon and night the daily section defaults to Suvichar instead of Good Afternoon. The rows remain stored for safe rollback.
