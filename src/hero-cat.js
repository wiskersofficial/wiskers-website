// Scroll-driven opening scene. Each atlas owns a persistent, predecoded SVG
// layer so a frame's crop and viewBox can never be paired with another sheet.
import {
  FALL_SEQUENCE, flightFrame, recoveryFrame, impactDisplacement, idleFrame,
  measureCatScroll, catWorldOffset, anchorArrivalScroll, routeProgress,
  YARN_DROP_SPEEDS, YARN_START_SETTLE_SCROLL, yarnMotionTravel, yarnBallLandingScroll,
} from './cat-scene-math.js';
import {prepareAtlasScene,applyAtlasFrame} from './cat-atlas-renderer.js';

const cat = document.querySelector('.hero-cat');
const word = document.querySelector('.cat-word');
const world = document.querySelector('.cat-scroll-world');
const spacer = document.querySelector('.cat-world-spacer');
const tile = document.querySelector('.insight-tile');
const textWall = document.querySelector('.text-wall');
const previewCard = document.querySelector('.tool-preview');
const questionControl = document.querySelector('.select-shell');
const demoGrid = document.querySelector('.demo-grid');
const demoCopy = document.querySelector('.demo-copy');
const answerCard = document.querySelector('.answer-card');
const yarnScene = document.querySelector('.yarn-scene');
const scene = document.querySelector('[data-cat-scene]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => {const t = clamp(value); return t*t*(3-2*t);};
const atlasPaths = {
  idle: '/art/cat-idle-soft-v1/atlas.json',
  fall: '/art/cat-fall-soft-v1/atlas.json',
  transition: '/art/cat-transition-soft-v1/atlas.json',
  groom: '/art/cat-groom-soft-v1/atlas.json',
  route: '/art/cat-route-soft-v1/atlas.json',
};
const EXPECTED_VIEWPORT = {width:128,height:128,anchorX:64,anchorY:113};
const HEAD_TOP_IN_FRAME = 27.5;
// Let the cat reach the viewport edge before the reaction starts.
const HEAD_TOP_TRIGGER = 0;
const SCARE_SCROLL = 30;
const IDLE_SCROLL_SPAN = 96;
const IDLE_IDS = ['idle-1','idle-2'];
const FALL_GLOBAL_START = IDLE_IDS.length;
const GROOM_POSE_IDS = ['groom-lick-1','groom-lick-2','groom-lick-3','groom-lick-4','groom-wipe-1','groom-lower-paw','groom-lick-settle'];
const GROOM_GLOBAL_START = FALL_GLOBAL_START + FALL_SEQUENCE.length;
const ROUTE_JUMP_IDS = ['route-jump-left-crouch','route-jump-left-launch','route-jump-left-airborne','route-jump-left-descend','route-jump-left-contact','route-jump-left-settle'];
const ROUTE_GLOBAL_START = GROOM_GLOBAL_START + GROOM_POSE_IDS.length + 1;
const ROUTE_LINE = .54;
const HOP_MAX_SCROLL = 132;
const GROOM_HOLD_SCROLL = 120;
const ROUTE_POSES = ['fall-8','fall-9','twist-6','fall-8','fall-9','twist-6','fall-8','fall-9'];
const LANDING_X = 48;
const LANDING_INSET = -8;
const RECOVERY_SCROLL = 190;
const IMPACT_SCROLL = 240;
let atlases = {};
const renderState = {currentPoseId:''};
let triggerScroll = 0;
let takeoffScroll = 0;
let fallDistance = 560;
let baseWordCatAnchor = null;
let scaredAnchor = null;
let scrollMotion = null;
let routeStops = [];
let routeLandingScroll = 0;
let routeStartScroll = 0;
let routeStopsLocked = false;
let routeRefreshPending = false;
let activeFlight = null;
let manualToggleOverride = null;
let autoToggleActive = false;
let queued = false;

// Opt-in review aid; IDs remain stable when the atlas order changes.
const showFrameCounter = import.meta.env.DEV || new URLSearchParams(location.search).get('cat-debug') === '1';
const frameCounter = showFrameCounter ? document.createElement('div') : null;
const frameCounterLabel = frameCounter ? document.createElement('span') : null;
const scrollCounterLabel = frameCounter ? document.createElement('span') : null;
const copyFrameButton = frameCounter ? document.createElement('button') : null;
let copyFeedbackTimer = 0;
if (frameCounter) {
  frameCounter.className = 'cat-frame-counter';
  frameCounterLabel.className = 'cat-frame-counter-label';
  frameCounterLabel.textContent = 'Frames loading…';
  scrollCounterLabel.className = 'cat-scroll-counter';
  scrollCounterLabel.textContent = `scroll ${Math.round(scrollY)}px`;
  copyFrameButton.type = 'button';
  copyFrameButton.className = 'cat-frame-copy';
  copyFrameButton.textContent = 'Copy';
  copyFrameButton.setAttribute('aria-label','Copy current cat frame reference');
  copyFrameButton.title = 'Copy frame reference';
  frameCounter.append(frameCounterLabel,scrollCounterLabel,copyFrameButton);
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

function setActionPose(id) {
  const frame=FALL_SEQUENCE.find(item=>item.id===id);
  if(frame) setFallPose(frame);
}

function setGroomPose(index=0) {
  const pose=clamp(index,0,GROOM_POSE_IDS.length-1);
  setPose('groom',pose,GROOM_POSE_IDS[pose],GROOM_GLOBAL_START+pose);
}

function setTogglePressPose() {
  setPose('transition',12,'toggle-paw-press',GROOM_GLOBAL_START+GROOM_POSE_IDS.length);
}

function setRouteJumpPose(index) {
  const pose=clamp(index,0,ROUTE_JUMP_IDS.length-1);
  setPose('route',pose,ROUTE_JUMP_IDS[pose],ROUTE_GLOBAL_START+pose);
}

function setWorldOffset(offset) {
  const bounded = Math.max(0,offset);
  scene?.style.setProperty('--cat-world-offset',`${bounded}px`);
  if (spacer) spacer.style.height = `${bounded}px`;
}

function resetCatToWord() {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.remove('is-flying','is-landed','is-scared','is-attached','is-grooming');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
}

function routeAnchorSpecs() {
  const ball = number => yarnScene?.querySelector(`[data-yarn="${number}"]`);
  return [
    {id:'text-wall',host:textWall,point:host=>({x:host.left+Math.min(34,host.width*.12),y:host.top}),line:()=>innerHeight*ROUTE_LINE},
    {id:'card-toggle',host:previewCard,point:host=>{
      const control=previewCard?.querySelector('[data-cat-toggle]');
      const rect=control?.getBoundingClientRect();
      return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:{x:host.left+host.width*.52,y:host.top+host.height*.72};
    },line:()=>innerHeight*.48},
    {id:'buyer-question',host:demoGrid??questionControl,point:host=>{
      const control=questionControl?.querySelector('select')?.getBoundingClientRect() ?? host;
      const note=demoCopy?.querySelector('.demo-note')?.getBoundingClientRect();
      if(innerWidth<=650 && note && answerCard) {
        // On phones there is no left gutter beside the full-width select.
        // Use the clear gap below its helper note and above the answer card.
        const card=answerCard.getBoundingClientRect();
        const freeGap=Math.max(0,card.top-note.bottom-8);
        const scale=clamp(freeGap/160,.30,.68);
        cat?.style.setProperty('--cat-groom-scale',String(scale));
        return {x:host.right-8-64*scale,y:note.bottom+4+113*scale};
      }
      // On wider layouts, use the open lane below the helper note. Keeping
      // the cat inside the demo panel avoids a clipped left-gutter landing.
      const freeGap=Math.max(0,host.bottom-note.bottom-8);
      const scale=clamp(freeGap/128,.3,.64);
      cat?.style.setProperty('--cat-groom-scale',String(scale));
      return {x:control.left+Math.min(100,control.width*.2),y:note.bottom+4+113*scale};
    },line:()=>innerHeight*.9},
    {id:'yarn-pile',host:yarnScene,point:host=>{
      const initial=ballsForRoute();
      if(!initial.length) return {x:host.left+host.width*.62,y:host.top+innerHeight*.17};
      const startX=initial.reduce((sum,item)=>sum+Number(item.dataset.startX||0),0)/initial.length;
      const ballHalfHeight=initial[0].offsetHeight/2/host.height*1100;
      const startY=initial.reduce((sum,item)=>sum+Number(item.dataset.startY||0),0)/initial.length-ballHalfHeight;
      return {x:host.left+startX/1000*host.width,y:host.top+startY/1100*host.height+6};
    },line:()=>innerHeight*.65},
    ...[1,2,3].map(number=>({id:`yarn-ball-${number}`,host:ball(number),point:host=>({x:host.left+host.width/2,y:host.top+6}),line:()=>innerHeight*.65})),
  ].filter(stop=>stop.host);
}

function ballsForRoute() {
  return yarnScene?[...yarnScene.querySelectorAll('[data-yarn]')]:[];
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
  const tileRect=tile?.getBoundingClientRect();
  const tileFootDocumentY=tileRect?tileRect.bottom+scrollY-LANDING_INSET:innerHeight+scrollY;
  scrollMotion = measureCatScroll({
    tileFootDocumentY,
    landingScroll:takeoffScroll + fallDistance,
    viewportHeight:innerHeight,
  });
  routeLandingScroll = takeoffScroll + fallDistance;
  routeStartScroll=routeLandingScroll+IMPACT_SCROLL;
  routeStopsLocked = false;
  // Downstream anchors should be measured in the settled world position,
  // even when this page is first initialized before the fall offset is set.
  const currentOffset=catWorldOffset(scrollY,scrollMotion);
  setWorldOffset(catWorldOffset(routeStartScroll,scrollMotion));
  measureRouteStops();
  setWorldOffset(currentOffset);
}

function measureRouteStops() {
  activeFlight=null;
  const specs=routeAnchorSpecs();
  let previousArrival=routeStartScroll;
  let yarnCommonStart=NaN;
  const yarnTravel=yarnMotionTravel(yarnScene?.getBoundingClientRect().height??0,innerHeight);
  const yarnBounds=yarnScene?.getBoundingClientRect();
  const yarnSceneStart=yarnBounds?yarnBounds.top+scrollY-innerHeight*.66:0;
  routeStops=specs.map((spec,index)=>{
    const rect=spec.host.getBoundingClientRect();
    const point=spec.point(rect);
    const authoredArrival=spec.arrival?.();
    const yarnNumber=spec.id.startsWith('yarn-ball-')?Number(spec.id.slice('yarn-ball-'.length)):0;
    const scheduledArrival=yarnNumber && Number.isFinite(yarnCommonStart)
      ? yarnBallLandingScroll(yarnCommonStart,yarnTravel,YARN_DROP_SPEEDS[yarnNumber-1])
      : authoredArrival;
    let arrival=Number.isFinite(scheduledArrival)?Math.max(previousArrival+1,scheduledArrival):anchorArrivalScroll(point.y,scrollY,spec.line(),previousArrival+1);
    if(spec.id==='yarn-pile') yarnCommonStart=Math.max(arrival+YARN_START_SETTLE_SCROLL,yarnSceneStart);
    const gap=Math.max(0,arrival-previousArrival);
    const duration=Math.min(HOP_MAX_SCROLL,gap*.72);
    const stop={...spec,arrival,departure:Math.max(previousArrival,arrival-duration),pointAt:spec.point};
    previousArrival=arrival;
    return stop;
  });
  if(scene) {
    const scrollMap={tileLand:routeLandingScroll,tileSettled:routeStartScroll};
    routeStops.forEach(stop=>{
      scrollMap[stop.id]=Math.round(stop.arrival);
      scrollMap[`${stop.id}Departure`]=Math.round(stop.departure);
    });
    if(Number.isFinite(yarnCommonStart)) scrollMap.yarnStartFloor=Math.round(yarnCommonStart);
    [1,2,3].forEach(number=>{
      const contact=Number(yarnScene?.querySelector(`[data-yarn="${number}"]`)?.dataset.catContactScroll);
      if(Number.isFinite(contact)) scrollMap[`yarnRoll${number}`]=Math.round(contact);
    });
    scene.dataset.catScrollMap=JSON.stringify(scrollMap);
  }
}

function showFlyingCat(anchorX, anchorY) {
  if (!cat || !word) return;
  if (cat.parentElement !== word) word.append(cat);
  cat.classList.add('is-flying');
  cat.classList.remove('is-scared','is-landed','is-attached','is-grooming');
  cat.style.left = `${anchorX - EXPECTED_VIEWPORT.anchorX}px`;
  cat.style.top = `${anchorY - EXPECTED_VIEWPORT.anchorY}px`;
}

function attachCat(stop) {
  if (!cat || !stop?.host) return;
  if(getComputedStyle(stop.host).position==='static') stop.host.classList.add('cat-anchor-host');
  if (cat.parentElement !== stop.host) stop.host.append(cat);
  const rect=stop.host.getBoundingClientRect();
  const point=stop.pointAt(rect);
  cat.classList.remove('is-flying','is-scared','is-landed','is-grooming');
  cat.classList.add('is-attached');
  cat.style.left=`${point.x-rect.left-EXPECTED_VIEWPORT.anchorX}px`;
  cat.style.top=`${point.y-rect.top-EXPECTED_VIEWPORT.anchorY}px`;
  cat.style.removeProperty('bottom');
}

function tileRouteStop() {
  if(!tile) return null;
  return {id:'insight-tile',host:tile,pointAt:rect=>({x:rect.left+LANDING_X,y:rect.bottom-LANDING_INSET})};
}

function attachCatToTile() {
  if(!cat || !tile) return;
  tile.classList.add('cat-anchor-host');
  if(cat.parentElement!==tile) tile.append(cat);
  cat.classList.remove('is-flying','is-scared','is-attached','is-grooming');
  cat.classList.add('is-landed');
  cat.style.removeProperty('left');
  cat.style.removeProperty('top');
  cat.style.removeProperty('bottom');
}

function clearImpact() {
  tile?.classList.remove('cat-impacting');
  tile?.style.removeProperty('--cat-tile-rock');
  tile?.style.removeProperty('--cat-tile-sink');
}

function resetCardToggle() {
  manualToggleOverride=null;
  autoToggleActive=false;
  syncCardToggle(false);
}

function updateScene() {
  queued = false;
  if (scrollCounterLabel) {
    scrollCounterLabel.textContent = `scroll ${Math.round(scrollY)}px`;
    frameCounter.dataset.scrollY = String(Math.round(scrollY));
  }
  if (!cat || !word || !world || !scene || !atlases.idle || !atlases.fall || !atlases.transition || !atlases.groom || !atlases.route) return;

  if (reducedMotion.matches) {
    resetCatToWord();
    clearImpact();
    setWorldOffset(0);
    manualToggleOverride=null;
    autoToggleActive=false;
    syncCardToggle(false);
    setIdlePose(0);
    scene.dataset.catScenePhase = 'reduced-motion-static';
    return;
  }

  const y = scrollY;
  const fallProgress = clamp((y - takeoffScroll) / fallDistance);
  setWorldOffset(catWorldOffset(y,scrollMotion));
  // Lock route thresholds after the original impact offset has settled. The
  // yarn worker's contact milestones then use the same final transformed world.
  if(y>=routeStartScroll && !routeStopsLocked && !routeRefreshPending) {
    measureRouteStops();
    routeStopsLocked=true;
  }

  if (y < takeoffScroll) {
    clearImpact();
    resetCardToggle();
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
    resetCardToggle();
    clearImpact();
    const tileRect=tile.getBoundingClientRect();
    const targetX=tileRect.left+LANDING_X;
    const targetY=tileRect.bottom-LANDING_INSET;
    const eased = smooth(fallProgress);
    const anchorX = scaredAnchor.x + (targetX-scaredAnchor.x)*eased;
    const anchorY = scaredAnchor.y + (targetY-scaredAnchor.y)*fallProgress*fallProgress;
    showFlyingCat(anchorX,anchorY);
    setFallPose(flightFrame(fallProgress));
    scene.dataset.catScenePhase = 'falling';
    scene.dataset.catSceneProgress = String(fallProgress.toFixed(3));
    scene.dataset.catRouteStop='insight-tile';
    scene.dataset.catContact='';
    return;
  }

  if(y<routeStartScroll) {
    resetCardToggle();
    const recovery=Math.max(0,y-routeLandingScroll);
    attachCatToTile();
    setFallPose(recoveryFrame(recovery/RECOVERY_SCROLL));
    const impactProgress=clamp(recovery/IMPACT_SCROLL);
    const impact=1-smooth(impactProgress);
    tile.classList.add('cat-impacting');
    tile.style.setProperty('--cat-tile-rock',`${-2.2*impact}deg`);
    tile.style.setProperty('--cat-tile-sink',`${impactDisplacement(impactProgress)}px`);
    scene.dataset.catScenePhase=recovery<RECOVERY_SCROLL?'impact-recovery':'tile-settled';
    scene.dataset.catSceneProgress=String(clamp(recovery/RECOVERY_SCROLL).toFixed(3));
    scene.dataset.catRouteStop='insight-tile';
    scene.dataset.catContact='insight-tile';
    scene.dataset.catYarnStop='';
    scene.dataset.catYarnContact='';
    return;
  }

  clearImpact();
  if(routeRefreshPending) {
    scene.dataset.catScenePhase='route-layout-refresh';
    return;
  }

  const stops=routeStops;
  if(!stops.length) return;
  let currentIndex=-1;
  for(let index=0;index<stops.length;index++) {
    if(y>=stops[index].arrival) currentIndex=index;
    else break;
  }
  const current=currentIndex<0?tileRouteStop():stops[currentIndex];
  const next=currentIndex<0?stops[0]:stops[currentIndex+1];
  const cardIndex=stops.findIndex(stop=>stop.id==='card-toggle');
  const shouldActivateCard=cardIndex>=0 && y>=stops[cardIndex].arrival;
  if(shouldActivateCard!==autoToggleActive) {
    manualToggleOverride=null;
    autoToggleActive=shouldActivateCard;
  }
  syncCardToggle(shouldActivateCard);
  scene.dataset.catRouteStop=current.id;
  scene.dataset.catContact=current.id==='insight-tile'?'insight-tile':current.id;
  scene.dataset.catYarnStop=current.id.startsWith('yarn-')?current.id.replace('yarn-',''):'';
  scene.dataset.catYarnContact=current.id.startsWith('yarn-')?current.id.replace('yarn-',''):'';
  scene.dataset.catYarnTarget='';

  if(next && y>=next.departure && y<next.arrival) {
    const progress=routeProgress(y,next.departure,next.arrival);
    const sourceRect=current.host.getBoundingClientRect();
    const targetRect=next.host.getBoundingClientRect();
    const flightKey=`${current.id}->${next.id}:${next.departure}:${next.arrival}`;
    if(activeFlight?.key!==flightKey) {
      const departureSource=current.pointAt(sourceRect);
      activeFlight={key:flightKey,x:departureSource.x,documentY:departureSource.y+scrollY};
    }
    const source={x:activeFlight.x,y:activeFlight.documentY-scrollY};
    const target=next.pointAt(targetRect);
    const arc=Math.min(116,Math.max(34,Math.abs(target.x-source.x)*.18+Math.abs(target.y-source.y)*.12));
    showFlyingCat(source.x+(target.x-source.x)*progress,
      source.y+(target.y-source.y)*progress-4*arc*progress*(1-progress));
    if(current.id==='insight-tile' && next.id==='text-wall') {
      const pose=progress<.16?0:progress<.34?1:progress<.68?2:3;
      setRouteJumpPose(pose);
    } else {
      const pose=ROUTE_POSES[(Math.max(0,currentIndex)+Math.floor(progress*2))%ROUTE_POSES.length];
      setActionPose(pose);
    }
    scene.dataset.catScenePhase=`jumping-to-${next.id}`;
    scene.dataset.catSceneProgress=String(progress.toFixed(3));
    scene.dataset.catRouteStop=next.id;
    scene.dataset.catContact='';
    scene.dataset.catYarnStop='';
    scene.dataset.catYarnContact='';
    scene.dataset.catYarnTarget=next.id.startsWith('yarn-')?next.id.replace('yarn-',''):'';
    return;
  }

  if(current.id==='insight-tile') {
    attachCatToTile();
    setFallPose(FALL_SEQUENCE[FALL_SEQUENCE.length-1]);
  } else attachCat(current);
  scene.dataset.catSceneProgress='1.000';
  if(current.id==='buyer-question') {
    cat.classList.add('is-grooming');
    scene.dataset.catScenePhase='grooming';
    scene.dataset.catNeedsArt='';
    cat.dataset.groomAction='paw-lick';
    const groomProgress=clamp((y-current.arrival)/GROOM_HOLD_SCROLL);
    setGroomPose(Math.min(GROOM_POSE_IDS.length-1,Math.floor(groomProgress*GROOM_POSE_IDS.length)));
  } else {
    scene.dataset.catScenePhase=current.id.startsWith('yarn-')?'yarn-contact':'landed';
    scene.dataset.catNeedsArt='';
    if(current.id==='text-wall') setRouteJumpPose(y<current.arrival+12?4:5);
    else if(current.id==='card-toggle') setTogglePressPose();
    else if(current.id==='yarn-ball-3') setActionPose('land-6');
    else if(current.id.startsWith('yarn-')) setActionPose('fall-10');
  }
}

function syncCardToggle(active) {
  const toggle=previewCard?.querySelector('[data-cat-toggle]');
  const value=manualToggleOverride ?? active;
  if(toggle) {
    toggle.setAttribute('aria-pressed',String(value));
    toggle.classList.toggle('is-active',value);
  }
  if(!previewCard) return;
  previewCard.dataset.catActive=String(value);
  previewCard.dataset.active=String(value);
}

function requestUpdate() {if(!queued){queued=true;requestAnimationFrame(updateScene);}}

addEventListener('scroll',requestUpdate,{passive:true});
addEventListener('resize',()=>{
  // playground.js updates its yarn contact-scroll milestones on the next
  // animation frame. Wait for that layout pass before measuring route stops.
  routeRefreshPending=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    resetCatToWord();
    setWorldOffset(0);
    measureTrigger();
    setWorldOffset(catWorldOffset(scrollY,scrollMotion));
    measureRouteStops();
    routeStopsLocked=scrollY>=routeStartScroll;
    routeRefreshPending=false;
    updateScene();
  }));
});
previewCard?.querySelector('[data-cat-toggle]')?.addEventListener('click',event=>{
  // playground.js handles the real button first; capture its resulting state
  // so manual use remains authoritative until the cat crosses a route edge.
  manualToggleOverride=event.currentTarget.getAttribute('aria-pressed')==='true';
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
