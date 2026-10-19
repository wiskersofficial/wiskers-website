# Lightweight homepage visuals

File: `visual-modules.js`. Companion SVGs: `../assets/`.

The initializer mounts scroll-responsive ASCII canvas fields, the local SVG image trail, and the buyer-signal hanging note. It exposes `update(progressState)`, `setPaused()`, and `destroy()` for the page-level animation loop.

The source also contains dormant spiral-gallery logic, but the homepage does not include the corresponding markup. It is explicitly excluded from the active component list and should stay unmounted unless separately requested.
