// Scroll-driven opening scene. Each atlas owns a persistent, predecoded SVG
// layer so a frame's crop and viewBox can never be paired with another sheet.
import {
  FALL_SEQUENCE, flightFrame, recoveryFrame, impactDisplacement, idleFrame,
  measureCatScroll, catWorldOffset,
} from './cat-scene-math.js';
import {prepareAtlasScene,applyAtlasFrame} from './cat-atlas-renderer.js';

const cat = document.querySelector('.hero-cat');
const word = document.querySelector('.cat-word');
const world = document.querySelector('.cat-scroll-world');
const spacer = document.querySelector('.cat-world-spacer');
const tile = document.querySelector('.insight-tile');
const scene = document.querySelector('[data-cat-scene]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => {const t = clamp(value); return t*t*(3-2*t);};
const atlasPaths = {
  idle: '/art/cat-idle-c-v4/atlas.json',
  fall: '/art/cat-fall-c-v1/atlas.json',
  transition: '/art/cat-transition-c-v2/atlas.json',
};
const EXPECTED_VIEWPORT = {width:128,height:128,anchorX:64,anchorY:113};
const HEAD_TOP_IN_FRAME = 27.5;
// Let the cat reach the viewport edge before the reaction starts.
const HEAD_TOP_TRIGGER = 0;
const SCARE_SCROLL = 30;
const IDLE_SCROLL_SPAN = 96;
const LANDING_X = 48;
const LANDING_INSET = -8;
const RECOVERY_SCROLL = 190;
const IMPACT_SCROLL = 240;
const IDLE_IDS = ['idle-1','idle-2','idle-3'];
const FALL_GLOBAL_START = IDLE_IDS.length;
let atlases = {};
const renderState = {currentPoseId:''};
let triggerScroll = 0;
let takeoffScroll = 0;
let fallDistance = 560;
let baseWordCatAnchor = null;
let scaredAnchor = null;
let scrollMotion = null;
let queued = false;

// Opt-in review aid; IDs remain stable when the atlas order changes.
const showFrameCounter = import.meta.env.DEV || new URLSearchParams(location.search).get('cat-debug') === '1';
const frameCounter = showFrameCounter ? document.createElement('div') : null;
const frameCounterLabel = frameCounter ? document.createElement('span') : null;
const copyFrameButton = frameCounter ? document.createElement('button') : null;
let copyFeedbackTimer = 0;
if (frameCounter) {
  frameCounter.className = 'cat-frame-counter';
  frameCounterLabel.className = 'cat-frame-counter-label';
  frameCounterLabel.textContent = 'Frames loading…';
  copyFrameButton.type = 'button';
  copyFrameButton.className = 'cat-frame-copy';
  copyFrameButton.textContent = 'Copy';
  copyFrameButton.setAttribute('aria-label','Copy current cat frame reference');
  copyFrameButton.title = 'Copy frame reference';
  frameCounter.append(frameCounterLabel,copyFrameButton);
  document.body.append(frameCounter);

  copyFrameButton.addEventListener('click',async()=>{
    const reference = frameCounter.dataset.copyText;
    if (!reference) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(reference);
      copied = true;
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = reference;
      fallback.setAttribute('readonly','');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.append(fallback);
      fallback.select();
      try { copied = document.execCommand('copy'); } catch {}
      fallback.remove();
    }
    clearTimeout(copyFeedbackTimer);
    copyFrameButton.textContent = copied ? 'Copied' : 'Copy failed';
    copyFrameButton.setAttribute('aria-label',copied ? 'Frame reference copied' : 'Could not copy frame reference');
    copyFeedbackTimer = setTimeout(()=>{
      copyFrameButton.textContent = 'Copy';
      copyFrameButton.setAttribute('aria-label','Copy current cat frame reference');
    },1200);
  });
}

function validateAtlas(name, data) {
  const viewport = data.viewport;
  if (!viewport || Object.keys(EXPECTED_VIEWPORT).some(key => viewport[key] !== EXPECTED_VIEWPORT[key])) {
    throw new Error(`${name} cat atlas does not use the shared 128px viewport and foot anchor`);
  }
  if (!Number.isFinite(data.width) || !Number.isFinite(data.height) || !data.url ||
      !Array.isArray(data.cellRects) || !Array.isArray(data.viewBoxes) ||
      data.cellRects.length !== data.viewBoxes.length || !data.cellRects.length) {
    throw new Error(`${name} cat atlas has incomplete frame geometry`);
  }
  for (let i=0;i<data.cellRects.length;i++) {
    const rect = data.cellRects[i];
    const box = data.viewBoxes[i];
    if (rect.length !== 4 || box.length !== 4 ||
        rect.some(value => !Number.isFinite(value)) || box.some(value => !Number.isFinite(value)) ||
        rect[0] < 0 || rect[1] < 0 || rect[2] <= 0 || rect[3] <= 0 ||
        rect[0] + rect[2] > data.width || rect[1] + rect[3] > data.height ||
        box[2] <= 0 || box[3] <= 0) {
      throw new Error(`${name} cat atlas frame ${i + 1} has invalid crop geometry`);
    }
  }
  return data;
}

async function loadAtlas(name, path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${name} cat atlas is not ready`);
  const data = validateAtlas(name, await response.json());
  const decoded = new Image();
  decoded.src = data.url;
  if (typeof decoded.decode === 'function') await decoded.decode();
  else await new Promise((resolve,reject)=>{
    decoded.onload=resolve;
    decoded.onerror=()=>reject(new Error(`${name} cat image could not load`));
  });
  if (decoded.naturalWidth !== data.width || decoded.naturalHeight !== data.height) {
    throw new Error(`${name} cat atlas dimensions do not match its image`);
  }
  data.decodedImage = decoded;
  return data;
}

async function createLayer(name, atlas) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  const clip = document.createElementNS(ns,'clipPath');
  const rect = document.createElementNS(ns,'rect');
  const image = document.createElementNS(ns,'image');
  const clipId = `hero-cat-${name}-cell`;
  svg.classList.add('hero-cat-frame','hero-cat-atlas-layer');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('preserveAspectRatio','none');
  svg.setAttribute('viewBox','0 0 128 128');
  svg.dataset.atlas = name;
  clip.setAttribute('id',clipId);
  clip.setAttribute('clipPathUnits','userSpaceOnUse');
  rect.classList.add('hero-cat-cell-clip');
  clip.append(rect);
  const defs = document.createElementNS(ns,'defs');
  defs.append(clip);
  image.setAttribute('href',atlas.url);
  image.setAttribute('x','0');
  image.setAttribute('y','0');
  image.setAttribute('width',String(atlas.width));
  image.setAttribute('height',String(atlas.height));
  image.setAttribute('clip-path',`url(#${clipId})`);
  svg.append(defs,image);
  const ready = new Promise((resolve,reject)=>{
    const timeout = setTimeout(()=>reject(new Error(`${name} SVG image timed out`)),15000);
    image.addEventListener('load',()=>{clearTimeout(timeout);resolve();},{once:true});
    image.addEventListener('error',()=>{clearTimeout(timeout);reject(new Error(`${name} SVG image failed to load`));},{once:true});
  });
  cat.append(svg);
  atlas.layer = svg;
  atlas.clip = rect;
  await ready;
}

function setPose(name, pose, stableId, globalIndex) {
  if (!applyAtlasFrame(atlases,name,pose,stableId,cat,renderState)) return;
  if (frameCounter) {
    const frameNumber = String(globalIndex + 1).padStart(2,'0');
    const label = `${frameNumber} · ${stableId}`;
    frameCounterLabel.textContent = label;
    frameCounter.dataset.copyText = label;
    frameCounter.dataset.frame = String(globalIndex + 1);
    frameCounter.dataset.pose = stableId;
  }
}

function setIdlePose(pose) {
  const count = atlases.idle?.cellRects.length ?? IDLE_IDS.length;
  const index = clamp(pose,0,count-1);
  setPose('idle',index,IDLE_IDS[index] ?? `idle-${index+1}`,index);
}

function setFallPose(frame) {
  const atlas = atlases[frame.atlas];
  const index = FALL_SEQUENCE.indexOf(frame);
  setPose(frame.atlas,frame.pose,frame.id,FALL_GLOBAL_START + index);
}

function setWorldOffset(offset) {
  const bounded = Math.max(0,offset);
  scene?.style.setProperty('--cat-world-offset',`${bounded}px`);
  if (spacer) spacer.style.height = `${bounded}px`;
}

function clearImpact() {
  tile?.classList.remove('cat-impacting');
  tile?.style.removeProperty('--cat-tile-rock');
  tile?.style.removeProperty('--cat-tile-sink');
}

function resetCatToWord() {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.remove('is-flying','is-landed','is-scared');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
  clearImpact();
}

function measureTrigger() {
  if (!word || !cat) return;
  const catRect = cat.getBoundingClientRect();
  baseWordCatAnchor = {
    x:catRect.left + EXPECTED_VIEWPORT.anchorX,
    y:catRect.top + scrollY + EXPECTED_VIEWPORT.anchorY,
  };
  triggerScroll = baseWordCatAnchor.y - EXPECTED_VIEWPORT.anchorY + HEAD_TOP_IN_FRAME - HEAD_TOP_TRIGGER;
  takeoffScroll = triggerScroll + SCARE_SCROLL;
  fallDistance = innerWidth <= 650 ? 650 : 560;
  scaredAnchor = {x:baseWordCatAnchor.x,y:baseWordCatAnchor.y-triggerScroll};
  const tileRect = tile.getBoundingClientRect();
  scrollMotion = measureCatScroll({
    tileFootDocumentY:tileRect.bottom + scrollY - LANDING_INSET,
    landingScroll:takeoffScroll + fallDistance,
    viewportHeight:innerHeight,
  });
  tile.style.setProperty('--cat-landing-x',`${LANDING_X}px`);
  tile.style.setProperty('--cat-landing-inset',`${LANDING_INSET}px`);
}

function showFlyingCat(anchorX, anchorY) {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.add('is-flying');
  cat.classList.remove('is-scared','is-landed');
  cat.style.left = `${anchorX - EXPECTED_VIEWPORT.anchorX}px`;
  cat.style.top = `${anchorY - EXPECTED_VIEWPORT.anchorY}px`;
}

function landCat() {
  if (!cat || !tile) return;
  if (cat.parentElement !== tile) tile.append(cat);
  cat.classList.remove('is-flying','is-scared');
  cat.classList.add('is-landed');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
}

function updateScene() {
  queued = false;
  if (!cat || !word || !world || !tile || !scene || !atlases.idle || !atlases.fall || !atlases.transition) return;

  if (reducedMotion.matches) {
    resetCatToWord();
    setWorldOffset(0);
    setIdlePose(0);
    scene.dataset.catScenePhase = 'reduced-motion-static';
    return;
  }

  const y = scrollY;
  const fallProgress = clamp((y - takeoffScroll) / fallDistance);
  setWorldOffset(catWorldOffset(y,scrollMotion));

  if (y < takeoffScroll) {
    clearImpact();
    if (y >= triggerScroll) {
      showFlyingCat(scaredAnchor.x,scaredAnchor.y);
      cat.classList.add('is-scared');
      setFallPose(FALL_SEQUENCE[0]);
      scene.dataset.catScenePhase = 'scared';
      scene.dataset.catSceneProgress = String(clamp((y-triggerScroll)/SCARE_SCROLL).toFixed(3));
    } else {
      resetCatToWord();
      setIdlePose(idleFrame(Math.max(0,y),atlases.idle.cellRects.length,IDLE_SCROLL_SPAN));
      scene.dataset.catScenePhase = 'perched';
      scene.dataset.catSceneProgress = String(((Math.max(0,y)%IDLE_SCROLL_SPAN)/IDLE_SCROLL_SPAN).toFixed(3));
    }
    return;
  }

  if (fallProgress < 1) {
    clearImpact();
    const tileRect = tile.getBoundingClientRect();
    const targetX = tileRect.left + LANDING_X;
    const targetY = tileRect.bottom - LANDING_INSET;
    const eased = smooth(fallProgress);
    const anchorX = scaredAnchor.x + (targetX-scaredAnchor.x)*eased;
    const anchorY = scaredAnchor.y + (targetY-scaredAnchor.y)*fallProgress*fallProgress;
    showFlyingCat(anchorX,anchorY);
    setFallPose(flightFrame(fallProgress));
    scene.dataset.catScenePhase = 'falling';
    scene.dataset.catSceneProgress = String(fallProgress.toFixed(3));
    return;
  }

  // Clear tile transform before reading its box. That keeps reverse contact and
  // resize measurements independent from the previous impact frame.
  clearImpact();
  const recovery = Math.max(0,y-(takeoffScroll+fallDistance));
  landCat();
  setFallPose(recoveryFrame(recovery/RECOVERY_SCROLL));
  const impactProgress = clamp(recovery/IMPACT_SCROLL);
  const impact = 1-smooth(impactProgress);
  tile.classList.add('cat-impacting');
  tile.style.setProperty('--cat-tile-rock',`${-2.2*impact}deg`);
  tile.style.setProperty('--cat-tile-sink',`${impactDisplacement(impactProgress)}px`);
  scene.dataset.catScenePhase = recovery < RECOVERY_SCROLL ? 'impact-recovery' : 'landed';
  scene.dataset.catSceneProgress = String(clamp(recovery/RECOVERY_SCROLL).toFixed(3));
}

function requestUpdate() {if(!queued){queued=true;requestAnimationFrame(updateScene);}}

addEventListener('scroll',requestUpdate,{passive:true});
addEventListener('resize',()=>{
  resetCatToWord();
  setWorldOffset(0);
  measureTrigger();
  updateScene();
});
reducedMotion.addEventListener('change',requestUpdate);

async function initializeScene() {
  if (!cat || !word || !world || !tile || !scene) return;
  try {
    // No cat appears until every sheet is decoded and every atlas layer exists.
    atlases = await prepareAtlasScene(Object.entries(atlasPaths),loadAtlas,createLayer);
    for (const [name,atlas] of Object.entries(atlases)) {
      if (name !== 'idle' && Object.keys(EXPECTED_VIEWPORT).some(key=>atlas.viewport[key]!==atlases.idle.viewport[key])) {
        throw new Error('Cat atlases do not share a stable display anchor');
      }
    }
    setIdlePose(0);
    cat.hidden = false;
    measureTrigger();
    updateScene();
  } catch (error) {
    if (frameCounterLabel) frameCounterLabel.textContent = 'Cat art unavailable';
    // Leave the word clean; an unpaired or partially loaded frame is never shown.
    resetCatToWord();
    scene.dataset.catScenePhase = 'art-unavailable';
  }
}

initializeScene();
