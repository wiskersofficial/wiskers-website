const clamp = value => Math.min(1, Math.max(0, value));

/** Two complete four-face cycles; hold each readable face before its turn. */
export function cuboidRotation(progress) {
  const step = clamp(progress) * 8;
  const face = Math.floor(step);
  const turn = clamp(((step - face) - 0.6) / 0.4);
  const eased = turn * turn * (3 - 2 * turn);
  return -90 * (face + eased) || 0;
}

/** Run the full animation while the untransformed cuboid fits in the viewport. */
export function cuboidViewportProgress(box, scrollY, viewportHeight, viewportOffsetTop = 0) {
  if (!box || viewportHeight <= 0) return 0;
  const start = Math.max(0, box.top + box.height - viewportHeight - viewportOffsetTop);
  const end = Math.max(start + 1, box.top - viewportOffsetTop);
  return clamp((scrollY - start) / (end - start));
}
