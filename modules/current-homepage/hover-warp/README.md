# Elastic text hover

The thesis sentence marked `[data-v6-warp]` has a pointer-following elastic lens. Nearby letters lift, widen, stretch and skew with a local coral highlight; the original paragraph layout stays fixed. It eases back when the pointer leaves.

Copy `hover-warp.js` beside the controller in `src/home-v6/`. The integration snapshot contains the markup, `.v6-warp-*` styles, and controller wiring. `initHoverWarp(root, requestFrame)` returns `measure()`, `update(now)`, `setPaused(value)`, and `destroy()`. `warpAtPoint(dx, dy, fontSize, strength)` is a pure lens calculation.

Use the homepage's shared frame scheduler. The callback requests a frame without marking scroll scenes dirty; `update()` returns whether the lens is still settling. Do not add a perpetual loop or redraw the page's canvas for hover frames. Measure after fonts or layout changes; cached letter offsets ignore their animated transforms. Native scroll changes the lens's viewport coordinates without a fresh layout read.

The shared pause control freezes motion. Reduced motion resets all letters to their readable resting form. On touch, pointer down triggers the lens and release settles it; listeners are passive and never intercept scrolling. The browser review covered mouse interaction and narrow layouts; touch input and the system reduced-motion preference were reviewed in source, not emulated.

Whole-word wrappers preserve normal word breaks. The original text appears once to assistive technology; the animated letters are aria-hidden. `destroy()` restores the plain paragraph and removes listeners. Keep the existing screen-reader utility and reduced-motion CSS from the integration snapshot.
