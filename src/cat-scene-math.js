const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

// Stable frame identity is kept separate from the atlas-local pose index.
// Atlas-local indices remain separate from stable IDs used in the review aid.
export const FALL_SEQUENCE = [
  ['fall','fall-1','scare',0],
  ['fall','fall-2','recoil',1],
  ['fall','fall-3','back-first',2],
  ['fall','fall-4','supine',3],
  ['fall','fall-5','supine',4],
  ['transition','twist-2','twist',1],
  ['transition','twist-3','twist',2],
  ['fall','fall-6','supine',5],
  ['transition','twist-4','twist',3],
  ['transition','twist-5','twist',4],
  ['fall','fall-7','twist',6],
  ['transition','twist-6','twist',5],
  ['fall','fall-8','righting',7],
  ['fall','fall-9','righting',8],
  ['fall','fall-10','contact',9],
  ['transition','land-1','landing',6],
  ['transition','land-2','landing',7],
  ['fall','fall-11','crouch',10],
  ['transition','land-3','landing',8],
  ['transition','land-4','landing',9],
  ['transition','land-5','landing',10],
  ['transition','land-6','landing',11],
  ['fall','fall-12','settled',11],
].map(([atlas,id,phase,pose]) => Object.freeze({atlas,id,phase,pose}));

// One transition drawing was cut; keep the same flight duration so each
// remaining pose gets a little more scroll time. Recovery still starts at fall-10.
export const FLIGHT_FRAME_COUNT = 14;
export const RECOVERY_FRAME_COUNT = FALL_SEQUENCE.length - FLIGHT_FRAME_COUNT;

export function flightFrame(progress) {
  return FALL_SEQUENCE[Math.min(FLIGHT_FRAME_COUNT - 1,
    1 + Math.floor(clamp(progress) * (FLIGHT_FRAME_COUNT - 1)))];
}

export function recoveryFrame(progress) {
  const index = FLIGHT_FRAME_COUNT + Math.min(RECOVERY_FRAME_COUNT - 1,
    Math.floor(clamp(progress) * RECOVERY_FRAME_COUNT));
  return FALL_SEQUENCE[index];
}

// A scroll-driven soft compression, small rebound, and smooth return to zero.
export function impactDisplacement(progress) {
  const t = clamp(progress);
  if (t === 1) return 0;
  const smooth = value => value*value*(3-2*value);
  if (t < .14) return 10 * smooth(t / .14);
  if (t < .42) return 10 + (-12) * smooth((t - .14) / .28);
  return -2 * (1 - smooth((t - .42) / .58));
}

export function idleFrame(scrollY, frameCount = 2, span = 96) {
  if (frameCount <= 1) return 0;
  const cycleProgress = (Math.max(0,scrollY) % span) / span;
  return Math.min(frameCount - 1, Math.floor(cycleProgress * frameCount));
}

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
