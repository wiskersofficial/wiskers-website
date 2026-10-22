# Square Lead Vibe — website edition

Updated 22 October 2026. Replaces the old two-view prospect/team panel on the Wiskers homepage.

## Use

Import `leadMomentMarkup` and `mountLeadMoment` from `lead-moment.js`. Insert the markup into your page, load `lead-moment.css`, and call `mountLeadMoment(root)`. The returned controller exposes `setPaused(boolean)` and `destroy()`. Copy `assets/lead-moment/` to your public asset root: the renderer loads lazily at `/assets/lead-moment/cube-floor.js`.

The module uses vanilla JavaScript. Inherit the website fonts and define `--v6-paper`, `--v6-ink`, `--v6-muted`, `--v6-rule`, `--v6-coral` and `--v6-serif`. Twilight is selected by `data-theme="twilight"` on the document root. The standalone demo supplies basic tokens and defaults. Serve the package over HTTP and open `demo.html`; ES modules cannot run from a file URL.

## Behavior

Four visitor moments become points on clarity/readiness axes. Place via the map, keyboard, four corner choices or labelled sliders. Lock, go back, or replay. A result offers an experience idea, an example three-step journey, a team question, an explicit four-answer review and a readout of deliberate choices. A mixed pattern is acknowledged rather than presented as a precise diagnosis. State stays in memory; there is no analytics upload or lead scoring. Contact opens a normal email draft.

The wave renderer is lazy-loaded, pauses offscreen and when the page is hidden, supports reduced motion, and receives the shared website Pause control. A CSS grid and markers keep the game functional when WebGL cannot initialize. Touch scrolling is not intercepted. Hover-warp is provided by the website's separate shared module and is optional for standalone use.

## Sources and changes

Original Drive brief: [Dogfooding 1 — Find your lead moment](https://docs.google.com/document/d/1xq43HeOPd3QdTQ2947_bZXEq8Hp1hWlx8R-9HUBekHo/edit). Original gallery name: Square Lead Vibe.

Implementation reference: `wiskersofficial/wiskers-console` at `2331ad933ca7fdd2fb162579612323dd24042a58`, `console/web/src/lead-moment.js`, `lead-moment.css`, and `console/web/public/cube-floor.js`. The four prompts, axes, four profile ideas and wave-floor renderer derive from that version. This website edition replaces the Preact shell with vanilla JS, expands explanatory and result content, adds mobile/keyboard alternatives and lifecycle integration. No Console/gallery source was changed.

Renderer upstream: [franky-adl/3d-wave-grid](https://github.com/franky-adl/3d-wave-grid/tree/f1fe51434c294008b7e40d51579711b522f1e27f), MIT, Copyright (c) 2026 franky-adl. See `assets/lead-moment/LICENSE-wave-grid.txt`. The bundled renderer includes Three.js 0.184.0 and its MIT notices; preserve those notices. Website renderer adaptations: added externally controlled pause; corrected draft-colour uniform to `uDraftColor`. The wrapper disables original pointer-down placement so mobile scrolling does not accidentally place points, and coalesces overlapping visible marker labels without merging the answers.

## Review

Production build passes. Browser checks covered desktop, 390px and 320px, all four rounds and a mixed result, pointer placement, keyboard adjustment, Back, replay, range inputs, expanded results, no horizontal overflow, Day/Night/Twilight and shared Pause/Resume. Console was clear. Actual touch input, system reduced-motion emulation and forced WebGL failure were not browser-tested; their paths were inspected in source.
