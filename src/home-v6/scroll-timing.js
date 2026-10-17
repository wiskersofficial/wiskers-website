const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * Measure element positions once per layout change, outside the scroll frame.
 * Returned tops use document coordinates, so one scroll position can reproduce
 * the same animation state while scrolling forward, backward, or after a jump.
 */
export function measureDocumentBoxes(elements, scrollY = window.scrollY || 0) {
  return new Map([...elements].map((element) => {
    const rect = element.getBoundingClientRect();
    return [element, { top: rect.top + scrollY, height: rect.height }];
  }));
}

/**
 * Progress from when an element's top crosses one viewport line to another.
 * Example: 0.88 → 0.52 starts near the lower edge and finishes in the upper
 * half. Because the timing uses viewport height rather than element height,
 * wrapped text and narrower screens do not unexpectedly lengthen the motion.
 */
export function progressAcrossViewport(box, scrollY, viewportHeight, startAt = 0.88, endAt = 0.52, viewportOffsetTop = 0) {
  if (!box || viewportHeight <= 0) return 0;
  const visibleTop = scrollY + viewportOffsetTop;
  const startLine = box.top - viewportHeight * startAt;
  const endLine = box.top - viewportHeight * endAt;
  return clamp01((visibleTop - startLine) / Math.max(1, startLine - endLine));
}

/** Progress through an explicit document-scroll interval. */
export function progressAcrossRange(scrollY, startScroll, endScroll) {
  return clamp01((scrollY - startScroll) / Math.max(1, endScroll - startScroll));
}

/** Observe box-size changes so font loads and responsive reflow remeasure targets. */
export function observeLayoutChanges(elements, onChange) {
  if (typeof ResizeObserver !== "function") return () => {};
  const observer = new ResizeObserver(onChange);
  for (const element of elements) observer.observe(element);
  return () => observer.disconnect();
}
