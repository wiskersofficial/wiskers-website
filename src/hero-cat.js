// Scroll-driven opening scene. The cat begins on “content”, then falls into
// the blue statement tile while the lower page moves at a slower rate.
import {measureCatScroll, catWorldOffset} from './cat-scene-math.js';
const cat = document.querySelector('.hero-cat');
const word = document.querySelector('.cat-word');
const frame = cat?.querySelector('.hero-cat-frame');
const image = cat?.querySelector('.hero-cat-image');
const cellClip = frame?.querySelector('.hero-cat-cell-clip');
const world = document.querySelector('.cat-scroll-world');
const spacer = document.querySelector('.cat-world-spacer');
const tile = document.querySelector('.insight-tile');
const scene = document.querySelector('[data-cat-scene]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => {const t = clamp(value); return t*t*(3-2*t);};
const atlasPaths = {
  groom: '/art/cat-groom-c-v2/atlas.json',
  fall: '/art/cat-fall-c-v1/atlas.json',
};
const EXPECTED_VIEWPORT = {width:128,height:128,anchorX:64,anchorY:113};
const HEAD_TOP_IN_FRAME = 27.5;
const HEAD_TOP_TRIGGER = 12;
const SCARE_SCROLL = 40;
const LANDING_X = 48;
const LANDING_INSET = -8;
const RECOVERY_SCROLL = 48;
const IMPACT_SCROLL = 100;
let atlases = {};
let displayedAtlas = '';
let displayedPose = -1;
let triggerScroll = 0;
let takeoffScroll = 0;
let fallDistance = 560;
let baseWordCatAnchor = null;
let scaredAnchor = null;
let scrollMotion = null;
let queued = false;
// Temporary review aid. Opt in on a built/deployed page with ?cat-debug=1.
const showFrameCounter = import.meta.env.DEV || new URLSearchParams(location.search).get('cat-debug') === '1';
const frameCounter = showFrameCounter ? document.createElement('div') : null;
if (frameCounter) {
  frameCounter.className = 'cat-frame-counter';
  frameCounter.textContent = 'Cat frames loading…';
  document.body.append(frameCounter);
}

function validateAtlas(name, data) {
  const viewport = data.viewport;
  if (!viewport || Object.keys(EXPECTED_VIEWPORT).some(key => viewport[key] !== EXPECTED_VIEWPORT[key])) {
    throw new Error(`${name} cat atlas does not use the shared 128px viewport and foot anchor`);
  }
  if (!Array.isArray(data.cellRects) || !Array.isArray(data.viewBoxes) || data.cellRects.length !== data.viewBoxes.length) {
    throw new Error(`${name} cat atlas has incomplete frame geometry`);
  }
  return data;
}

async function loadAtlas(name, path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${name} cat atlas is not ready`);
  const data = validateAtlas(name, await response.json());
  await new Promise((resolve, reject) => {
    const bitmap = new Image();
    bitmap.onload = resolve;
    bitmap.onerror = () => reject(new Error(`${name} cat image could not load`));
    bitmap.src = data.url;
  });
  return data;
}

function setPose(name, pose) {
  const atlas = atlases[name];
  if (!atlas || !cat || !image || !frame || !cellClip) return;
  pose = clamp(pose, 0, atlas.cellRects.length - 1);
  if (displayedAtlas === name && displayedPose === pose) return;
  displayedAtlas = name;
  displayedPose = pose;
  const [x,y,width,height] = atlas.cellRects[pose];
  cellClip.setAttribute('x',x);
  cellClip.setAttribute('y',y);
  cellClip.setAttribute('width',width);
  cellClip.setAttribute('height',height);
  frame.setAttribute('viewBox',atlas.viewBoxes[pose].join(' '));
  image.setAttribute('href',atlas.url);
  image.setAttribute('width',atlas.width);
  image.setAttribute('height',atlas.height);
  cat.dataset.pose = String(pose);
  cat.dataset.action = name === 'groom' ? 'grooming' : name === 'fall' ? (pose < 9 ? 'falling' : pose === 9 ? 'impact' : pose === 10 ? 'crouching' : 'sitting') : 'sitting';
  if (frameCounter) {
    const number = (name === 'fall' ? atlases.groom.cellRects.length : 0) + pose + 1;
    frameCounter.textContent = `Cat frame ${String(number).padStart(2,'0')} · ${name === 'groom' ? 'Groom' : 'Fall'} ${pose + 1}/${atlas.cellRects.length}`;
    frameCounter.dataset.frame = String(number);
  }
}

function setWorldOffset(offset) {
  const bounded = Math.max(0,offset);
  scene?.style.setProperty('--cat-world-offset',`${bounded}px`);
  if (spacer) spacer.style.height = `${bounded}px`;
}

function resetCatToWord() {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.remove('is-flying','is-landed','is-scared');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
  tile?.classList.remove('cat-impacting');
  tile?.style.removeProperty('--cat-tile-rock');
  // The measured word anchor remains stable through reverse scrolling.
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
  cat.classList.remove('is-scared');
  cat.classList.remove('is-landed');
  cat.style.left = `${anchorX - EXPECTED_VIEWPORT.anchorX}px`;
  cat.style.top = `${anchorY - EXPECTED_VIEWPORT.anchorY}px`;
}

function landCat() {
  if (!cat || !tile) return;
  if (cat.parentElement !== tile) tile.append(cat);
  cat.classList.remove('is-flying');
  cat.classList.add('is-landed');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
}

function updateScene() {
  queued = false;
  if (!cat || !word || !world || !tile || !scene || !Object.keys(atlases).length) return;

  if (reducedMotion.matches) {
    resetCatToWord();
    setWorldOffset(0);
    setPose('groom',0);
    scene.dataset.catScenePhase = 'reduced-motion-static';
    return;
  }

  if (!atlases.fall && scrollY >= takeoffScroll) {
    resetCatToWord();
    setWorldOffset(0);
    setPose('groom',0);
    scene.dataset.catScenePhase = 'perched-art-unavailable';
    return;
  }

  const y = scrollY;
  const fallProgress = clamp((y - takeoffScroll) / fallDistance);
  const worldOffset = catWorldOffset(y,scrollMotion);
  setWorldOffset(worldOffset);

  if (y < takeoffScroll) {
    const moved = Math.max(0,y);
    if (y >= triggerScroll) {
      showFlyingCat(scaredAnchor.x,scaredAnchor.y);
      cat.classList.add('is-scared');
      setPose('fall',0);
    } else {
      resetCatToWord();
      const groomingPose = Math.floor(clamp(moved / 18, 0, 7));
      if (moved < 3) setPose('groom',0);
      else setPose('groom',groomingPose);
    }
    scene.dataset.catScenePhase = y < triggerScroll ? 'perched' : 'scared';
    scene.dataset.catSceneProgress = String(clamp((y-triggerScroll)/SCARE_SCROLL).toFixed(3));
    return;
  }

  if (fallProgress < 1) {
    tile.classList.remove('cat-impacting');
    tile.style.setProperty('--cat-tile-rock','0deg');
  }
  const tileRect = tile.getBoundingClientRect();
  const targetX = tileRect.left + LANDING_X;
  const targetY = tileRect.bottom - LANDING_INSET;
  if (fallProgress < 1) {
    resetCatParentOnly();
    const eased = smooth(fallProgress);
    const anchorX = scaredAnchor.x + (targetX-scaredAnchor.x)*eased;
    const anchorY = scaredAnchor.y + (targetY-scaredAnchor.y)*fallProgress*fallProgress;
    showFlyingCat(anchorX,anchorY);
    const pose = Math.min(8,Math.floor(fallProgress*9));
    setPose('fall',pose);
    scene.dataset.catScenePhase = 'falling';
    scene.dataset.catSceneProgress = String(fallProgress.toFixed(3));
    return;
  }

  landCat();
  const recovery = Math.max(0,y-(takeoffScroll+fallDistance));
  const landedPose = recovery < 1 ? 9 : recovery < RECOVERY_SCROLL*.38 ? 10 : 11;
  setPose('fall',landedPose);
  const impact = 1-smooth(recovery/IMPACT_SCROLL);
  tile.classList.add('cat-impacting');
  tile.style.setProperty('--cat-tile-rock',`${-2.2*impact}deg`);
  scene.dataset.catScenePhase = recovery < RECOVERY_SCROLL*.38 ? 'impact-crouch' : 'landed';
  scene.dataset.catSceneProgress = String(clamp(recovery/RECOVERY_SCROLL).toFixed(3));
}

function resetCatParentOnly() {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.remove('is-landed');
  cat.classList.remove('is-scared');
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

if (cat && word && frame && image && cellClip && world && tile) {
  loadAtlas('groom',atlasPaths.groom).then(groom=>{
    atlases.groom=groom;
    cat.hidden=false;
    setPose('groom',0);
    measureTrigger();
    updateScene();
    loadAtlas('fall',atlasPaths.fall).then(fall=>{
      if (Object.keys(EXPECTED_VIEWPORT).some(key=>fall.viewport[key]!==groom.viewport[key])) {
        throw new Error('Cat atlases do not share a stable display anchor');
      }
      atlases.fall=fall;
      requestUpdate();
    }).catch(()=>{/* Leave the seated cat visible if the falling sequence is unavailable. */});
  }).catch(()=>{/* Keep the page usable if the base character asset is unavailable. */});
}
