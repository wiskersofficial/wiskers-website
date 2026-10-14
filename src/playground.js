import './review-map.js';

// Opening-only choreography. The sixteen authored poses carry the twist;
// the browser moves a shared paw anchor along one measured curve.
const layer = document.querySelector('#pixel-cat-layer');
const motionButton = document.querySelector('#motion-toggle');
const panel = document.querySelector('#problem-panel');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const content = document.querySelector('#hero-content-word');
const input = document.querySelector('#hero-input-word');
const heading = document.querySelector('#hero-heading');
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const FRAME = { width: 120, height: 96, count: 16, anchorX: 60, anchorY: 80 };
const LAND_AT = .77;
const OPENING_ASSET = '/assets/wiskers-cat/OPENING_FALL.png';
let paused = reduced.matches;
let loaded = false;
let dirty = true;
let raf = 0;
let previousProgress = null;
let armed = true;
let settleStart = null;
let stopped = false;
let metrics = null;
let lastPose = null;
let frozenPose = null;

// The hero pins only once it reaches the viewport. Header and review map
// scroll normally; both typographic ledges then share one coordinate system.
const runway = document.createElement('div');
runway.id = 'opening-runway';
runway.className = 'opening-runway';
const composition = document.createElement('div');
composition.className = 'opening-composition';
heading?.before(runway);
runway.append(composition);
if (heading) composition.append(heading);
document.documentElement.classList.add('opening-journey');

const actor = document.createElement('div');
actor.className = 'pixel-cat pixel-cat--opening';
actor.setAttribute('aria-hidden', 'true');
const sprite = document.createElement('div');
sprite.className = 'pixel-cat__sprite';
actor.append(sprite);
layer?.append(actor);

// The buyer tool and problem panel continue to work independently of the cat.
document.querySelector('.problem-trigger')?.addEventListener('click', () => {
  panel?.showModal();
  if (panel) panel.scrollTop = 0;
  document.body.classList.add('panel-open');
  wake();
});
panel?.querySelectorAll('.problem-close,.problem-done').forEach(button => button.addEventListener('click', () => panel.close()));
panel?.addEventListener('close', () => {
  document.body.classList.remove('panel-open');
  wake();
});
const answers = {
  compare: ['Compare around the job, not the feature list.', 'Write down the decision you need to make, the constraints that matter, and what success would look like. Then use those criteria to compare each option.'],
  justify: ['Build the case around the cost of standing still.', 'Start with the problem your team already recognises. Agree on the outcome, map the costs and trade-offs, and make the next step small enough to test.'],
  plan: ['Find the smallest question worth answering.', 'Pick one audience and one decision. Build a useful first version, put it in front of real buyers, and let what they do guide the next iteration.'],
};
document.querySelector('#buyer-question')?.addEventListener('change', event => {
  const value = answers[event.target.value];
  if (!value) return;
  const result = document.querySelector('#buyer-result');
  if (result?.querySelector('h3')) result.querySelector('h3').textContent = value[0];
  if (result?.querySelector('p:last-child')) result.querySelector('p:last-child').textContent = value[1];
});

const measuringCanvas = document.createElement('canvas');
const measuringContext = measuringCanvas.getContext('2d');
function glyphTop(element, rect, word) {
  const style = getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  measuringContext.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const text = measuringContext.measureText(word);
  const ascent = text.fontBoundingBoxAscent ?? fontSize * .8;
  const descent = text.fontBoundingBoxDescent ?? fontSize * .2;
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.025;
  // Inline-block bounds include font leading. Land on the painted capitals,
  // not the invisible top of the line box.
  return rect.top + (lineHeight - ascent - descent) / 2 + ascent - text.actualBoundingBoxAscent;
}
function measure() {
  if (!content || !input) return;
  // 120×96 contains 50% more source pixels per axis than the old 80×64.
  // The CSS footprint stays equal: the extra pixels add detail, not size.
  const scale = (innerWidth <= 650 ? 3 : 4) * .85 / 1.5;
  const distance = reduced.matches ? 0 : clamp(innerHeight * .46, 300, 440);
  const compositionHeight = composition.offsetHeight;
  runway.style.height = `${compositionHeight + distance}px`;
  const origin = composition.getBoundingClientRect();
  const startRect = content.getBoundingClientRect();
  const endRect = input.getBoundingClientRect();
  const halfBody = 29 * scale;
  const startX = clamp(startRect.left + startRect.width * .6, halfBody + 12, innerWidth - halfBody - 12);
  const endX = clamp(endRect.left + endRect.width * .5, halfBody + 12, innerWidth - halfBody - 12);
  const startY = glyphTop(content, startRect, 'content') - origin.top + 1;
  const bounce = parseFloat(input.style.getPropertyValue('--input-bounce')) || 0;
  const endY = glyphTop(input, endRect, 'input') - origin.top - bounce + 1;
  metrics = {
    distance,
    top: runway.getBoundingClientRect().top + scrollY,
    compositionHeight,
    scale,
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    // The first control point carries the slip away from its ledge. The
    // second gives the feet a near-vertical approach to the landing word.
    c1: { x: startX + Math.min(34, innerWidth * .035), y: lerp(startY, endY, .12) },
    c2: { x: endX + Math.min(24, innerWidth * .025), y: lerp(startY, endY, .68) },
  };
  sprite.style.width = `${FRAME.width * scale}px`;
  sprite.style.height = `${FRAME.height * scale}px`;
  sprite.style.left = `${-FRAME.anchorX * scale}px`;
  sprite.style.top = `${-FRAME.anchorY * scale}px`;
  sprite.style.backgroundSize = `${FRAME.width * FRAME.count * scale}px ${FRAME.height * scale}px`;
  dirty = false;
}
function curve(t) {
  const { start, c1, c2, end } = metrics;
  const a = 1 - t;
  return {
    x: a ** 3 * start.x + 3 * a * a * t * c1.x + 3 * a * t * t * c2.x + t ** 3 * end.x,
    y: a ** 3 * start.y + 3 * a * a * t * c1.y + 3 * a * t * t * c2.y + t ** 3 * end.y,
  };
}
function syncMotion() {
  motionButton?.setAttribute('aria-pressed', String(paused));
  if (motionButton) motionButton.textContent = paused ? 'Play cat motion' : 'Pause cat motion';
  document.documentElement.classList.toggle('cat-motion-paused', paused);
}
motionButton?.addEventListener('click', () => {
  paused = !paused;
  frozenPose = paused && lastPose ? { ...lastPose } : null;
  // Resuming samples the current scroll position directly, without replaying
  // a landing that happened while motion was paused.
  if (!paused) previousProgress = null;
  settleStart = null;
  syncMotion();
  wake();
});
reduced.addEventListener('change', event => {
  paused = event.matches;
  frozenPose = null;
  previousProgress = null;
  settleStart = null;
  dirty = true;
  syncMotion();
  wake();
});
function frame(now) {
  raf = 0;
  if (dirty) measure();
  if (!metrics || !loaded || stopped) return;
  const scroll = scrollY - metrics.top;
  const scrollProgress = metrics.distance ? clamp(scroll / metrics.distance) : 1;
  const progress = paused && frozenPose && !reduced.matches ? frozenPose.progress : scrollProgress;
  const previous = previousProgress ?? progress;
  const reversing = progress < previous - .0003;
  const largeJump = Math.abs(progress - previous) > .24;
  if (progress < .7) armed = true;
  if (reversing || paused || reduced.matches || largeJump) settleStart = null;
  if (previous < LAND_AT && progress >= LAND_AT && armed) {
    if (!largeJump && !paused && !reduced.matches) settleStart = now;
    armed = false;
  }
  const flight = clamp((progress - .12) / (LAND_AT - .12));
  let position = curve(flight);
  let index = progress < .12 ? Math.min(1, Math.floor(progress / .12 * 2))
    : progress < .23 ? 2 + Math.min(1, Math.floor((progress - .12) / .11 * 2))
    : progress < .58 ? 4 + Math.min(5, Math.floor((progress - .23) / .35 * 6))
    : 10 + Math.min(2, Math.floor((progress - .58) / .19 * 3));
  let action = progress < .12 ? 'perch' : progress < .23 ? 'slip' : progress < .58 ? 'twist' : 'feet-first';
  let wordOffset = 0;
  if (progress >= LAND_AT) {
    position = { ...metrics.end };
    index = 15;
    action = 'landed';
    if (settleStart !== null) {
      const t = clamp((now - settleStart) / 350);
      index = t < .3 ? 13 : t < .65 ? 14 : 15;
      // Both word and paws share this displacement, so contact never floats.
      wordOffset = Math.sin(t * Math.PI * 2) * (1 - t) * 5.5;
      if (t === 1) settleStart = null;
    } else if (reversing) {
      index = 13 + Math.min(2, Math.floor(clamp((progress - LAND_AT) / (1 - LAND_AT)) * 3));
    }
  }
  // Freeze the authored frame and its place on the curve. The scene can
  // still scroll out normally; only the cat's choreography is paused.
  if (paused && frozenPose && !reduced.matches) {
    index = frozenPose.index;
    action = frozenPose.action;
    wordOffset = frozenPose.wordOffset;
  }
  if (reduced.matches) { position = { ...metrics.end }; index = 15; action = 'landed'; wordOffset = 0; }
  lastPose = { progress, index, action, wordOffset };
  if (paused && !frozenPose && !reduced.matches) frozenPose = { ...lastPose };
  const compositionTop = composition.getBoundingClientRect().top;
  actor.style.transform = `translate3d(${position.x.toFixed(2)}px,${(compositionTop + position.y + wordOffset).toFixed(2)}px,0)`;
  sprite.style.backgroundPosition = `${-FRAME.width * index * metrics.scale}px 0`;
  input.style.setProperty('--input-bounce', `${wordOffset.toFixed(2)}px`);
  actor.dataset.action = action;
  actor.dataset.frame = String(index);
  actor.dataset.stage = 'opening';
  runway.dataset.catProgress = progress.toFixed(3);
  if (layer) { layer.dataset.stage = 'opening'; layer.dataset.action = action; layer.dataset.loaded = 'true'; }
  const y = compositionTop + position.y;
  actor.hidden = !!panel?.open || y < -FRAME.height * metrics.scale || y > innerHeight + FRAME.height * metrics.scale;
  previousProgress = progress;
  if (settleStart !== null && !document.hidden) raf = requestAnimationFrame(frame);
}
function wake() { if (!raf && !document.hidden && !stopped) raf = requestAnimationFrame(frame); }
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', () => { dirty = true; wake(); }, { passive: true });
window.visualViewport?.addEventListener('resize', () => { dirty = true; wake(); }, { passive: true });
const observer = new ResizeObserver(() => { dirty = true; wake(); });
[composition, hero].filter(Boolean).forEach(element => observer.observe(element));
document.fonts.ready.then(() => { dirty = true; wake(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; settleStart = null; }
  else wake();
});
window.addEventListener('pagehide', () => { stopped = true; cancelAnimationFrame(raf); raf = 0; observer.disconnect(); });
window.addEventListener('pageshow', () => {
  stopped = false;
  [composition, hero].filter(Boolean).forEach(element => observer.observe(element));
  dirty = true;
  wake();
});
syncMotion();
const image = new Image();
image.onload = () => {
  loaded = true;
  sprite.style.backgroundImage = `url("${OPENING_ASSET}")`;
  document.documentElement.classList.add('cat-ready');
  wake();
};
image.onerror = () => {
  if (layer) layer.hidden = true;
  if (motionButton) motionButton.hidden = true;
  document.documentElement.classList.add('opening-asset-unavailable');
};
image.src = OPENING_ASSET;
