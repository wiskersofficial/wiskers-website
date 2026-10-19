# Wiskers reusable website modules

This folder is the handoff for the current homepage implementation. It is an implementation kit, not a second copy of the entire website. Source files here are copied from the current homepage so a future redesign can inspect and reuse the working behavior without searching across the site first.

## What is active on the homepage

| Module | What it does | Source |
| --- | --- | --- |
| Scroll-driven typography | Morphs each glyph between sans and italic serif while changing its color on the same progress value. Includes readable screen-reader text. Used in the hero and selected section headings. | `current-homepage/font-scroll/` |
| Viewport timing | Measures stable document positions and maps viewport crossings or explicit scroll ranges to 0–1 progress. Re-measures on resize, visual viewport changes, font readiness, and observed layout changes. | `current-homepage/scroll-timing/` and integration reference |
| ASCII signal field | Sparse, lightweight canvas field responds to scroll progress and pointer position. | `current-homepage/visual-modules/visual-modules.js` |
| Scroll flow / trail line | SVG expertise-flow paths draw with scroll progress. | `current-homepage/site-integration/markup.js`, `layout.css`, `index.js` |
| Image trail (05) | Reuses local Wiskers SVG cards as a transient trail when pointer or touch moves across the stage. | `current-homepage/visual-modules/visual-modules.js` and `assets/` |
| Hanging note | Small “Buyer signal” card sways gently with process-section scroll progress. | `current-homepage/visual-modules/visual-modules.js` and integration reference |
| Example reveal and active state | Scroll reveals the calculator, diagnose choices, and compare checklist; updates the active example as it crosses a viewport band. | `current-homepage/site-integration/` |
| Interactive business examples | Calculator, guided diagnose choices, and keyboard-operable comparison checklist with an adaptive question summary. | `current-homepage/site-integration/markup.js` |
| Motion controls | Pause/resume control and reduced-motion handling for the shared animation system. | `current-homepage/site-integration/index.js` |

## Not part of the active homepage

The 3D spiral/gallery experiment is still present as dormant code in the visual-module source, but its markup was removed from the homepage by request. Do not treat it as a current component or mount it in a redesign unless Josh explicitly asks for it. The old Framer demo components 01 and 02 were also rejected. The `components-preview.html` page is a visual reference, not the homepage.

## Reuse notes

- Keep native page scrolling. The scroll modules map scroll position to progress; they do not intercept, pin, or snap the page.
- `glyph-wave.js` expects a plain-text element marked `[data-glyph-wave]`; nested markup is intentionally skipped. Call `initGlyphWaves(root)`, then drive `update(element, progress)` from a shared animation frame. `destroy()` restores the original text.
- Color and typeface use one per-letter `--glyph-progress` value, so they crossfade together. Keep each letter's transition window narrower than the gap between adjacent letter start points; otherwise the word looks like it changes one pixel at a time or all at once.
- Use `scroll-timing.js` to calculate progress from cached document coordinates. Do not measure transformed boxes in the scroll handler. Re-measure after responsive layout, font loading, or viewport changes.
- `site-integration/` preserves the current wiring and styling as a reference. It has imports that expect the existing Vite project and its root layout; it is not a standalone app.
- Original site assets are copied into `assets/`. Preserve attribution and current brand colors when reusing them.
- The package is vanilla JavaScript/CSS and has no new runtime dependency.

## Verification and source of truth

These files were copied from the active local homepage source on 19 October 2026. The source of truth remains `src/home-v6/` and `public/assets/component-studies/` in this repository. After a component change, refresh this handoff and its Drive ZIP so they do not drift.
