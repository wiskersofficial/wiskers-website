# Scroll word cuboid — 20 October 2026

Replaced only the first thesis paragraph’s business/products/services/approach list with four long cuboid faces, rotating around the X axis. The sample prospect page is unchanged.

Checks performed:
- Production build passes. Existing separate Scrollo bundle-size warning remains.
- Pure timing checks cover all eight 90-degree stops, readable dwell, and 0/-360/-720 degree endpoints across three viewport sizes and a visual viewport offset.
- Production browser preview: measured 0 degrees before entry, -360 degrees at midpoint and -720 degrees before exit. Reverse scroll returned the expected earlier face. Only one face’s text is visible at a time.
- Desktop and 390px mobile browser review, including resize at intermediate progress. No horizontal overflow. Night and Day appearances reviewed.
- Direct section anchor loads at its deterministic scroll state. Stable outer-span geometry drives progress; the rotating faces are not used for measurements.
- Browser accessibility tree retains the complete original list. Plain-text fallback exists without enhancement; reduced-motion and print fallbacks reviewed in source, not browser-emulated.
- Uses the existing shared frame and pause control. No timer, scroll interception, pin, forced stop or new runtime dependency.
- Browser console clean in the reviewed interaction. Static index fallback matches markup.js. Reusable source snapshot and archive refreshed and ZIP integrity checked.
