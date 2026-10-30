# Continuous-story news integration — 28 October 2026

Copied the existing dependency-free Echoes module and stylesheet unchanged from:
`/Users/lowcostjosh/Documents/Tabby companion files/Archive/Rebrand/2026-10-07 WiskerHub move/Echoes/shared/echoes-spoken-text/`.

The original README explains the extraction from Echoes Explorer. The module provides word splitting, per-word/punctuation scheduling, current-word classes, persistent visible words, a separate full-text accessible copy, cancellation and reduced motion. No replacement implementation or new text animation library was introduced.

news-action.js calls createSpokenText for the two news stories' headlines, key lines and source quotations. The host sets 135ms word and 250ms punctuation timing, announce:false to avoid unsolicited live announcements, and uses IntersectionObserver rooted in the actual feed. CSS adapts the lime current-word emphasis for the light editorial palette and dark quote bubbles.

If the reader leaves a started passage, the host cancels its timer and makes the remaining visual words visible using the module's documented classes. Re-entry retains complete text; it does not repeatedly type it again. Fast scrolling stays native and cannot hold the feed for a reveal. Full accessible text is exposed independently of the visual sequence. Reduced motion uses the module's complete-text behavior.

The unchanged module was exercised with its existing deterministic test suite against the bundled copy. Original Echoes source files are untouched.

## Revision 67 — scroll replaces automatic news playback

The local bundled module is now extended with prepare/seek; original archived Echoes remains untouched. The news host prepares words without calling play or scheduling reveal timers. Native feed scroll maps each passage's vertical viewport position into 0–1 progress, so scrolling down reveals and scrolling back hides words. A stationary feed produces a stationary word count; decorative scene motion remains independent. Main headlines complete near the upper viewport; other text completes earlier so full passages remain readable. Layout space and full accessible text remain stable. Reduced motion shows all words. The old finish-on-exit timer behavior above describes revision 66 and is superseded for current news.
