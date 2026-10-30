# Scroll SVG Assembly · 1.0.0

A framework-independent SVG assembly primitive. It maps normalized progress to separate stroke drawing, petal/leaf unfolding, layered reveals and groups of hand-drawn glyphs. The geometry and example palette are data, rather than a fixed news story or product journey.

## Use

Serve the folder over HTTP and open demo.html. No installation or build is required. Import createPaperAssembly from scroll-svg-assembly.js, mount into an empty host, then call controller.update(progress, reducedMotion) with progress in 0..1. It also returns a callable update function for compatibility. Call controller.destroy() on unmount; it restores the host's previous content/role/label and detaches the generated scene. The host must have an explicit height. The caller owns scroll listeners and frame scheduling; no background loop is created by the primitive.

## Customize

Options: palette (nonempty colour array), ink, paper, label, namespace, lines, glyphs, flowers, leaves. Each text line supplies text, x/y in the 420×720 SVG coordinate system, scale, step and normalized at. Supplied glyph paths are original SVG paths in an approximately 40×64 coordinate system; unsupported characters throw a clear error rather than falling back to a font. A line's letters reveal in groups of three. Position/scale/palette/timings can be edited independently. Flowers and leaves accept the documented tuple arrays in source. Banner/stem paths can be replaced in the source without changing the progress controller. Namespace defaults are unique per mount, avoiding filter/gradient ID collisions between instances.

## Compatibility and accessibility

JavaScript ES modules, inline SVG, stroke-dashoffset and SVG/CSS transforms in current browsers. No WebGL, libraries, network assets, fonts or media downloads. Parent SVG scales with its host; resize changes only the caller's progress calculation. The demo supports native wheel, touch and keyboard page scrolling. The decoration is not a control and must not consume pointer events in a feed. Supply a meaningful label or mark it decorative if equivalent visible text exists. Keep semantic text in the host app when required: paths are not readable text. Passing reducedMotion=true removes translate/rotate/scale movement, retaining reversible reveal/drawing; provide the final static scene when stricter motion suppression is needed.

## Lifecycle and performance

The caller should schedule one update per scroll frame, stop when offscreen, and clean up its own listeners. The generic scene has individually animated SVG pieces; expensive full-screen blur filters are avoided, but per-group drop shadows may still cost on older phones. Browser-sized visual checks are not a physical-device frame-rate benchmark. Unknown throughput/FPS remains unmeasured. The example includes 134 grown parts before lettering; word length adds glyph paths. No timers or autonomous motion.

## Provenance and licence

Extracted from the owner-approved continuous-story-demo dist/scrapbook-scene.js at Sites source commit fdca95d8a79a50a4c6dec4ec2556fb33d0a86c3c (26 October 2026); that scene was unchanged from the approved v49/v50 rendering. Modified into normalized progress, configurable copy/glyphs/palette, unique SVG IDs and explicit teardown. The original authored story copy is not the primitive's default. All included geometry and glyphs are original authored paths; no reference image, third-party font or external asset is embedded. See NOTICE.txt. Public redistribution licence remains pending owner selection; no licence clearance is implied.
