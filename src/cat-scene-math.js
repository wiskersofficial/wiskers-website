const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

// Stable frame identity is kept separate from the atlas-local pose index.
// Atlas-local indices remain separate from stable IDs used in the review aid.
export const FALL_SEQUENCE = [
  ['fall','fall-v1-01','scare',0],
  ['fall','fall-v1-02','recoil',1],
  ['fall','fall-v1-03','back-first',2],
  ['fall','fall-v1-04','supine',3],
  ['transition','twist-01','twist',0],
  ['fall','fall-v1-05','supine',4],
  ['transition','twist-02','twist',1],
  ['transition','twist-03','twist',2],
  ['fall','fall-v1-06','supine',5],
  ['transition','twist-04','twist',3],
  ['transition','twist-05','twist',4],
  ['fall','fall-v1-07','twist',6],
  ['transition','twist-06','twist',5],
  ['fall','fall-v1-08','righting',7],
  ['fall','fall-v1-09','righting',8],
  ['fall','fall-v1-10','contact',9],
  ['transition','land-01','landing',6],
  ['transition','land-02','landing',7],
  ['fall','fall-v1-11','crouch',10],
  ['transition','land-03','landing',8],
  ['transition','land-04','landing',9],
  ['transition','land-05','landing',10],
  ['transition','land-06','landing',11],
  ['fall','fall-v1-12','settled',11],
].map(([atlas,id,phase,pose]) => Object.freeze({atlas,id,phase,pose}));

export const FLIGHT_FRAME_COUNT = 15;
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

export function idleFrame(scrollY, frameCount = 3, span = 24) {
  if (frameCount <= 1) return 0;
  return Math.min(frameCount - 1, Math.floor(clamp(scrollY / span) * frameCount));
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
