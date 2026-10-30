# Selected Drive primitives in the story demo

- `scroll-timing.js`: On-screen Scroll Timing, Drive file1zd81yuaqX2F3kbyCk1YbKkH99o_2eiQd. Viewport progress helper reused with host-scroller coordinates.
- `motion.js` contains lightweight Canvas2D adaptations of Constellation Links (Drive1dLsmwrBWa_z9U5qkcKQpTi-0N9AU9w59) and Wave Field (Drive19ZENBvF2D3GFgF9LmYla1-PiDCzMxU4Y), originally React/Three.js. Constellation geometry, proximity links and wave equations are driven entirely by reversible scroll progress in two decorative scenes. No pointer proximity, hover lens or pointer-triggered ripples. Original notice retained in PSCactux-MIT.txt. No React/Three/debug GUI dependency imported.

One host motion scheduler, visibility gating, offscreen pause, capped canvas resolution, bounded star/line counts, reduced-motion static states, and no gesture interception by decorative canvases. Content remains visible without enhancement.

## Watercolour story

`washes/washes.js` is the original Washes engine from the Drive Watercolor Wash Simulation package1lJPH-56e3W6aZcdUBEU84HUPNAyEFe4p, pinned to castavridis/washes-js commit14e485b6e83dba1b5d02c987ae2ddd2222c60063. Original MIT license and citation retained beside it. The host adapter is watercolor-story.js. Core is lazy-imported near its story, uses scale6 / canvasScale1, disables library pointer handling and pauses simulation work offscreen/under overlays/hidden/reduced motion. The library retains a lightweight RAF while paused per its API; this is separate from motion.js's scheduler. No playground/debug tools imported. Static SVG artwork remains if enhancement is unavailable or reduced motion is enabled before mount.

## Scroll-first revision

Elastic Text Hover was removed completely from the shipped assets at Josh’s instruction: no hover-triggered experience on any device. Garden stem drawing/blooms, diary aperture/depth, travelling starlight, constellation geometry, highlighted-comment underline and cut-paper assembly now scrub with feed position. Night’s native sticky sequence advances evening→midnight→dawn with ordinary vertical scroll; its optional three-stop range still uses the shared intent arbitration. A short-viewport fallback keeps the whole story in normal flow. No scroll snapping, wheel interception or additional decorative animation loop. Body prose stays fixed; reduced motion completes reveals and uses static compositions.

The street comparison also sweeps parking→garden while the full illustration is visible (viewport-top55%→8%). Its manual handle holds for36px more scroll, then smoothstep-blends back to the live narrative target over96px more feed travel. Reversing during handoff returns toward the manual choice. Reduced motion retains manual comparison. Load/pageshow visual synchronization is explicitly separated from user intent, including night bus state.

Garden ink drawing keeps a faint, complete, aria-hidden guide beneath animated strokes, so early blossoms remain connected to the plant while the darker ink catches up. The guide uses the existing SVG geometry and adds no layout shift or animation loop.
