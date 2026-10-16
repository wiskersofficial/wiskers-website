const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

// All three balls share a motion start; differing durations stagger their
// edge drops and give the cat room to land on each one in order.
export const YARN_DROP_SPEEDS = Object.freeze([.46,.64,.82]);
export const YARN_START_SETTLE_SCROLL = 24;
export const YARN_LANDING_PROGRESS = .84;

export function yarnMotionTravel(sceneHeight, viewportHeight) {
  return Math.max(600,sceneHeight-viewportHeight*.22);
}

export function yarnBallLandingScroll(commonStart, travel, speed) {
  return commonStart+travel*speed*YARN_LANDING_PROGRESS;
}

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
].map(([atlas,id,phase,pose]) => Object.freeze({atlas,id,phase,pose}));

// One transition drawing was cut and the old terminal fall-12 placeholder was
// removed; keep flight duration stable and let land-6 hold the tile landing.
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

// Convert an element's live viewport coordinate into the scroll position at
// which it reaches a chosen viewport line. This works after the temporary
// falling-world offset has settled and adapts to responsive layout changes.
export function anchorArrivalScroll(rectTop, scrollY, viewportLine, minimum = 0) {
  return Math.max(minimum, rectTop + scrollY - viewportLine);
}

export function routeProgress(scrollY, departure, arrival) {
  if (arrival <= departure) return scrollY >= arrival ? 1 : 0;
  return clamp((scrollY - departure) / (arrival - departure));
}
