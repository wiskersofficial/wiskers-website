# Scroll-driven word cuboid

A horizontal rectangular cuboid replaces the four-word list in the first thesis paragraph. Its long faces show business, products, services, and approach, in that order. It rotates vertically around its horizontal X axis.

`word-cuboid.js` exports pure `cuboidRotation(progress)` and `cuboidViewportProgress(box, scrollY, viewportHeight, viewportOffsetTop)` functions. Copy it to `src/home-v6/word-cuboid.js` beside the controller. The full markup and CSS are in the site-integration snapshot: `[data-v6-word-cuboid]`, `.v6-cuboid-stage`, `.v6-cuboid-rotor`, and four `.v6-cuboid-face` elements.

The controller measures the stable outer span, not a transformed face. Progress starts when the complete outer span enters the bottom of the visual viewport and ends when its top reaches the top of that viewport. Recompute on fonts, layout and visual viewport changes. Eight 90-degree turns give exactly two complete rotations (0 to -720 degrees). Each eighth of progress holds a readable face for its first 60%, then eases to the next. The closest face alone shows text; adjacent faces retain their quiet, theme-tinted surfaces.

The shared homepage animation frame owns the progress. There are no timers, scroll listeners per component, pins, snap points, scroll interception or new dependencies. Reverse scroll and direct loads reconstruct the current angle. The existing pause control freezes it.

`.is-enhanced` is applied only outside reduced motion. Without enhancement, in reduced motion, and in print, the original four-word list is visible. With enhancement the original list remains accessible and the whole 3D stage is aria-hidden. Keep those fallbacks when reusing this module.

The current composition places “your [word]” on a dedicated larger line below the lead-in sentence. Italic serif words, subtle face gradients, fine edges and a fading base line connect the prism to the page typography. Preserve theme tokens rather than restoring solid bright face fills. The presentation change keeps the same two-cycle rotation mapping.
