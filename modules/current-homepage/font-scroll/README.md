# Scroll-driven glyph typography

Files: `glyph-wave.js` and `glyph-wave.css`.

Add `data-glyph-wave` to a plain-text element and initialize `initGlyphWaves(root)`. The controller exposes `update(target, progress)`, `setPaused()`, `getTiming()`, `getTravelDistance()`, and `destroy()`.

The two visual layers for each letter crossfade together: sans to italic serif, and the matching foreground colors. An accessible plain-text copy stays available to assistive technology. The parent page owns progress calculation and scheduling; use the shared scroll loop instead of creating one listener or animation loop per word.

The authored `data-glyph-stagger` is an upper bound. The implementation narrows the crossfade window based on the number of glyphs so neighboring changes stay distinct. Set a suitable scroll runway for each viewport and confirm that the final glyph completes while the heading remains visible. The integration reference contains the current Wiskers hero safety limit and responsive timing logic.
