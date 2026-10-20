# Elastic text hover module

A pointer-following elastic lens for body copy. Nearby letters lift, widen, stretch and skew with a local accent colour. It eases back on exit without changing the paragraph's layout. The homepage uses it on body prose, the thesis lead-in and dynamically generated demo prose. Headings, controls, labels and footer links keep their own treatment.

## Files

- `hover-warp.js`: enhancement, pure lens calculation, dynamic content lifecycle and shared-frame API.
- `hover-warp.css`: standalone styling and screen-reader/reduced-motion rules. No dependency on glyph-wave styles.

There are no runtime dependencies. Add the stylesheet, import `initHoverWarp`, and mark prose elements with `data-v6-warp`. Targets support plain text and `<br>` line breaks. Elements containing other markup are skipped to preserve interactive children and formatting.

```html
<link rel="stylesheet" href="./hover-warp.css">
<p data-v6-warp>See what grabs prospects’ attention as they explore your business.</p>
```

```js
import { initHoverWarp } from './hover-warp.js';
let frame = 0;
function requestFrame() {
  if (!frame) frame = requestAnimationFrame(now => {
    frame = 0;
    if (warp.update(now)) requestFrame();
  });
}
const warp = initHoverWarp(document, requestFrame);
const measure = () => { warp.measure(); requestFrame(); };
window.addEventListener('resize', measure, { passive: true });
document.fonts?.ready.then(measure);
measure();
// Your existing motion control calls warp.setPaused(true / false).
// On teardown: cancelAnimationFrame(frame), remove the resize listener,
// and call warp.destroy().
```

In an existing animation system, use its scheduler instead of creating a second loop. The homepage passes `() => schedule(false)`: hover frames do not recompute scroll scenes or redraw canvases. `update(now)` returns true only while the lens is settling. Resting targets are skipped, and there is no permanent animation loop.

## API and lifecycle

`initHoverWarp(root, requestFrame)` returns `measure()`, `update(now)`, `setPaused(value)` and `destroy()`. `warpAtPoint(dx, dy, fontSize, strength)` is a pure lens calculation.

Re-measure after fonts or responsive layout changes. Letter offsets ignore their transforms; one host rectangle per active paragraph keeps the lens aligned inside native nested scroll panes. Pointer entry remeasures newly opened content. A child-list observer enhances newly marked elements, remounts copy replaced by the demo, and releases removed elements. It disconnects during its own markup changes, and ignores animation attributes.

The host's type size, line height and resting colour are inherited. Set `--v6-warp-accent` to customize the highlight; it defaults to the Wiskers theme coral token, then #ef767a. Word wrappers preserve normal word breaks; explicit line breaks remain intact. Text appears once to assistive technology; visual letters are aria-hidden. Teardown restores the latest original text and line breaks and removes listeners/observers.

The shared pause control freezes motion. Reduced motion resets the letters and the stylesheet forces their resting form for reduced motion and print. Touch down triggers the lens; release settles it. Passive listeners never intercept scrolling. Browser review covered mouse input, dynamic demo updates, nested scrolling, expanded content, reset, pause/resume and narrow layouts. Touch and system reduced-motion behavior were reviewed in source, not browser-emulated.
