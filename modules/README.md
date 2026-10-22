# Wiskers reusable website modules

This folder is the handoff for the current homepage implementation. It is an implementation kit, not a second copy of the entire website. Source files here are copied from the current homepage so a future redesign can inspect and reuse the working behavior without searching across the site first.

## What is active on the homepage

| Module | What it does | Source |
| --- | --- | --- |
| Scroll-driven typography | Morphs each glyph between sans and italic serif while changing its color on the same progress value. Includes readable screen-reader text. Used in the hero and selected section headings. | `current-homepage/font-scroll/` |
| Viewport timing | Measures stable document positions and maps viewport crossings or explicit scroll ranges to 0–1 progress. Re-measures on resize, visual viewport changes, font readiness, and observed layout changes. | `current-homepage/scroll-timing/` and integration reference |
| ASCII signal field | Sparse, lightweight canvas field responds to scroll progress and pointer position. | `current-homepage/visual-modules/visual-modules.js` |
| Image trail | Reuses local Wiskers SVG cards as a transient trail when pointer or touch moves across the closing section. | `current-homepage/visual-modules/visual-modules.js` and `assets/` |
| Hanging note | A small symbol card sways gently with the applications-section scroll progress. | `current-homepage/visual-modules/visual-modules.js` and integration reference |
| Applications timeline | Per-letter heading transitions and ruled-line reveals respond to native scroll. | `current-homepage/site-integration/` |
| Square Lead Vibe | Four visitor moments on a clarity/readiness map, with richer explanations, tailored example journeys, answer review and a transparent choices readout. | `current-homepage/lead-moment/` and `assets/lead-moment/` |
| Word cuboid | Four horizontal long faces rotate around the X axis through two complete cycles during their visible viewport travel. Shared pause and readable reduced-motion fallback. | `current-homepage/word-cuboid/` and integration reference |
| Elastic text hover | Reusable JavaScript and CSS for pointer-following body prose, including dynamically updated demo text. Smooth return, inherited colour, stable wrapping and shared pause/reduced-motion support. | `current-homepage/hover-warp/` and integration reference |
| Motion controls | Pause/resume control and reduced-motion handling for the shared animation system. | `current-homepage/site-integration/index.js` |

## Not part of the active homepage

The calculator, diagnosis flow and criteria checklist were replaced on 19 October 2026. The later prospect/team demo was replaced by Square Lead Vibe on 22 October 2026. Their source remains in Git history.

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

These files were copied from the active local homepage source on 22 October 2026. The source of truth remains `src/home-v6/` and `public/assets/component-studies/` in this repository. After a component change, refresh this handoff and its Drive ZIP so they do not drift.

## Current integration, 22 October 2026

The homepage retains the approved copy, V2 W24 wordmark, scroll interactions and body-text hover lens. `markup.js` imports the Square Lead Vibe module. `index.html` contains matching semantic fallback markup. The shared controller passes Pause/Resume and teardown to the game. Keep its three source files and public renderer assets together. Source attribution, reuse instructions and verified scope are in `lead-moment/README.md`.

The wave-map game follows native page flow. Day and Night use coral pink #ef767a with navy #091540 for its reading panel. Twilight uses olive #343b28 with cream #f3f0e9. The expanded result and four-corner guide follow the page theme. Avoid turning illustrative choices into qualification or conversion claims.

The image trail belongs to the closing section; the hanging symbol belongs to “Where it fits”. Brand assets remain in `assets/brand-v2/`, with the source/license recorded there. Trail SVGs copy to `public/assets/component-studies/`.

## Thesis interaction update, 20 October 2026

The offer cuboid now sits in a dedicated “your [word]” line with italic words and subtle theme-derived faces. The following sentence uses the elastic hover module. `site-integration/index.js` imports both helpers beside the existing homepage modules. Hover requests share the scheduler without recomputing scroll scenes, and stop once settled. The offer copy and two-cycle cuboid mapping remain unchanged.

## Body-copy warp update, 20 October 2026

All marked body prose now shares the elastic lens, including application copy and dynamically rendered Lead Vibe descriptions and results. The module preserves explicit line breaks, inherited theme colours and accessible text. Its own stylesheet travels with its JavaScript. The thesis attention sentence moved below the left heading; the lead-in is larger and the flow-line diagram was removed at Josh's request. The word cuboid still makes two full cycles through its visible scroll travel.

Standalone Drive package: [elastic-text-hover-module.zip](https://drive.google.com/file/d/142flu3l7FfhJ9k_1N3wtFTI-_bYgm4iF/view?usp=drivesdk).

## Square Lead Vibe package, 22 October 2026

[square-lead-vibe-website.zip](https://drive.google.com/file/d/1M3awwPlly7dWit-KpfFxJAxChgEYnwkf/view?usp=drivesdk) is a standalone Wisker package with a runnable demo, source, renderer, license and build notes. The full homepage package includes the matching integration copies. The old two-view panel has been retired.
