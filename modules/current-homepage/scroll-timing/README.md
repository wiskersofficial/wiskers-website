# Viewport-safe scroll timing

File: `scroll-timing.js`.

Exports:

- `measureDocumentBoxes(elements, scrollY)` caches normal-flow document coordinates.
- `progressAcrossViewport(box, scrollY, viewportHeight, startAt, endAt, viewportOffsetTop)` maps two viewport lines to 0–1 progress.
- `progressAcrossRange(scrollY, startScroll, endScroll)` maps a known scroll interval to 0–1 progress.
- `observeLayoutChanges(elements, onChange)` remeasures after observed size changes where `ResizeObserver` is available.

Call measurement during setup and layout changes, not on every scroll event. Drive progress from the cached boxes in one `requestAnimationFrame` loop. The homepage integration also listens to `visualViewport.resize`, window resize, and `document.fonts.ready`, and accounts for transformed/sticky headings using their stable layout positions.
