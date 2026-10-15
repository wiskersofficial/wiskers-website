const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// Keep the compact tile in view at contact. Extra falling room comes from
// slower document motion, never from padding inside the card or a scroll lock.
export function measureCatScroll({tileFootDocumentY, landingScroll, viewportHeight}) {
  const desiredFootY = viewportHeight * .52;
  const contentSpeed = clamp((tileFootDocumentY - desiredFootY) / landingScroll, .12, .65);
  return {contentSpeed, offsetRate: 1 - contentSpeed, landingScroll};
}

export function catWorldOffset(scrollY, motion) {
  return clamp(scrollY, 0, motion.landingScroll) * motion.offsetRate;
}
