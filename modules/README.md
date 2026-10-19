# Wiskers reusable website modules

This folder is the handoff for the current homepage implementation. It is an implementation kit, not a second copy of the entire website. Source files here are copied from the current homepage so a future redesign can inspect and reuse the working behavior without searching across the site first.

## What is active on the homepage

| Module | What it does | Source |
| --- | --- | --- |
| Scroll-driven typography | Morphs each glyph between sans and italic serif while changing its color on the same progress value. Includes readable screen-reader text. Used in the hero and selected section headings. | `current-homepage/font-scroll/` |
| Viewport timing | Measures stable document positions and maps viewport crossings or explicit scroll ranges to 0–1 progress. Re-measures on resize, visual viewport changes, font readiness, and observed layout changes. | `current-homepage/scroll-timing/` and integration reference |
| ASCII signal field | Sparse, lightweight canvas field responds to scroll progress and pointer position. | `current-homepage/visual-modules/visual-modules.js` |
| Scroll flow / trail line | SVG expertise-flow paths draw with scroll progress. | `current-homepage/site-integration/markup.js`, `layout.css`, `index.js` |
| Image trail | Reuses local Wiskers SVG cards as a transient trail when pointer or touch moves across the closing section. | `current-homepage/visual-modules/visual-modules.js` and `assets/` |
| Hanging note | A small symbol card sways gently with the applications-section scroll progress. | `current-homepage/visual-modules/visual-modules.js` and integration reference |
| Applications timeline | Per-letter heading transitions and ruled-line reveals respond to native scroll. | `current-homepage/site-integration/` |
| Prospect and team demo | Explore Wiskers, open details, compare approaches, select an approach and answer an optional question. Meaningful choices update a factual activity timeline and possible conversation angle. Section exposure stays separate. State stays in memory and can be reset. | `current-homepage/site-integration/experience.js` |
| Motion controls | Pause/resume control and reduced-motion handling for the shared animation system. | `current-homepage/site-integration/index.js` |

## Not part of the active homepage

The calculator, diagnosis flow, and criteria checklist were replaced by the prospect/team demo with the new copy on 19 October 2026. Their source remains in Git history.

The 3D spiral/gallery experiment is still present as dormant code in the visual-module source, but its markup was removed from the homepage by request. Do not treat it as a current component or mount it in a redesign unless Josh explicitly asks for it. The old Framer demo components 01 and 02 were also rejected. The `components-preview.html` page is a visual reference, not the homepage.

## Reuse notes

- Keep native page scrolling. The scroll modules map scroll position to progress; they do not intercept, pin, or snap the page.
- `glyph-wave.js` expects a plain-text element marked `[data-glyph-wave]`; nested markup is intentionally skipped. Call `initGlyphWaves(root)`, then drive `update(element, progress)` from a shared animation frame. `destroy()` restores the original text.
- Whole-word visual wrappers keep animated text from breaking inside a word at narrow widths. Each letter still owns its progress.
- Color and typeface use one per-letter `--glyph-progress` value, so they crossfade together. Keep each letter's transition window narrower than the gap between adjacent letter start points; otherwise the word looks like it changes one pixel at a time or all at once.
- Use `scroll-timing.js` to calculate progress from cached document coordinates. Do not measure transformed boxes in the scroll handler. Re-measure after responsive layout, font loading, or viewport changes.
- `site-integration/` preserves the current wiring and styling as a reference. It has imports that expect the existing Vite project and its root layout; it is not a standalone app.
- Original site assets are copied into `assets/`. Preserve attribution and current brand colors when reusing them.
- The package is vanilla JavaScript/CSS and has no new runtime dependency.

## Verification and source of truth

These files were copied from the active local homepage source on 19 October 2026. The source of truth remains `src/home-v6/` and `public/assets/component-studies/` in this repository. After a component change, refresh this handoff and its Drive ZIP so they do not drift.

## Current integration, 19 October 2026

The homepage uses the supplied “vibe-check your prospects” copy and the V2 W24 primary wordmark at Josh’s explicit request. `markup.js` imports `experience.js`. Keep them together. `index.html` contains matching semantic fallback markup.

The sample is Wiskers itself: visitors are the prospect and the adjacent view shows what Wiskers learns from the current demo. A focused introduction and deeper exploration are clearly illustrative patterns, not priced packages. Do not turn viewed sections into intent or qualification claims.

The image trail now belongs to the coral closing section; the hanging symbol belongs to “Where it fits”. The shared controller uses normal-flow sections without the previous sticky process layout. No page scroll interception. Preserve CSS theme tokens, keyboard controls, reset, pause/resume, reduced motion, native inner-pane scrolling, and the light/dark V2 SVG exports.

Asset integration: copy `assets/brand-v2/` to `public/assets/brand-v2/` and the trail SVGs to `public/assets/component-studies/`. V2 master source and license are recorded in the brand-v2 README and OFL.txt.
