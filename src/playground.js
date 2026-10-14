import './review-map.js';

// Mattz's original 80 × 64 cells face left. The common foot anchor is (40, 48).
const layer = document.querySelector('#pixel-cat-layer');
const motionButton = document.querySelector('#motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const panel = document.querySelector('#problem-panel');
const card = document.querySelector('#paw-card');
const answer = document.querySelector('#perch-jump');
const wall = document.querySelector('#cat-route-wall');
const bowl = document.querySelector('#cat-bowl');
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const strips = {
  idle: ['IDLE', 8, 7], walk: ['WALK', 12, 12], run: ['RUN', 8, 14],
  paw: ['ATTACK 1', 8, 10], pounce: ['ATTACK 2', 9, 11],
  jump: ['JUMP', 3, 7], runningJump: ['RUNNING JUMP', 3, 7],
  climb: ['CLIMB', 9, 12], slide: ['SLIDE', 3, 9],
  lick: ['LICK', 15, 10], sleep: ['SLEEP', 8, 6],
  waking: ['WAKING UP', 2, 5], eat: ['EAT', 7, 8], scare: ['SCARE', 11, 12],
};
const stages = ['hero', 'bridge', 'paw', 'jump', 'approach', 'contact']
  .map(name => ({ name, target: document.querySelector(`#perch-${name}`) }))
  .filter(stage => stage.target);
const actor = document.createElement('div');
actor.className = 'pixel-cat'; actor.setAttribute('aria-hidden', 'true');
const sprite = document.createElement('div'); sprite.className = 'pixel-cat__sprite';
const shadow = document.createElement('div'); shadow.className = 'pixel-cat__shadow';
actor.append(shadow, sprite); layer?.append(actor);
actor.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
sprite.style.cssText = 'position:absolute;image-rendering:pixelated;background-repeat:no-repeat;transform-origin:50% 75%';
shadow.style.cssText = 'position:absolute;width:70px;height:7px;border-radius:50%;background:rgba(9,21,64,.16);transform:translate(-50%,-50%);pointer-events:none';
let paused = reduced.matches, loaded = false, raf = 0, lastTime = 0, clock = 0;
let dirty = true, route = [], progress = scrollY, wallBounds = null;
let facing = -1, distance = 0, previousPosition = null, action = null, visit = '';
let lastAsset = '', lastFrame = -1, scale = 4, pageHeight = 0;
let replayRequest = null, lastActivity = 0, sleeping = false, groomed = false;
let previousScroll = scrollY, scrollDirection = 1, stopped = false, parked = null;
const bounds = element => {
  if (!element) return null;
  const r = element.getBoundingClientRect();
  return {left:r.left, right:r.right, top:r.top + scrollY, bottom:r.bottom + scrollY, width:r.width, height:r.height};
};

// Keep the buyer tool independent of the decorative actor.
document.querySelector('.problem-trigger')?.addEventListener('click', () => {
  panel?.showModal(); if (panel) panel.scrollTop = 0;
  document.body.classList.add('panel-open'); activity();
});
panel?.querySelectorAll('.problem-close,.problem-done').forEach(button => button.addEventListener('click', () => panel.close()));
panel?.addEventListener('close', () => { document.body.classList.remove('panel-open'); lastTime = 0; activity(); });
const answers = {
  compare: ['Compare around the job, not the feature list.', 'Write down the decision you need to make, the constraints that matter, and what success would look like. Then use those criteria to compare each option.'],
  justify: ['Build the case around the cost of standing still.', 'Start with the problem your team already recognises. Agree on the outcome, map the costs and trade-offs, and make the next step small enough to test.'],
  plan: ['Find the smallest question worth answering.', 'Pick one audience and one decision. Build a useful first version, put it in front of real buyers, and let what they do guide the next iteration.'],
};
document.querySelector('#buyer-question')?.addEventListener('change', event => {
  const value = answers[event.target.value]; if (!value) return;
  const result = document.querySelector('#buyer-result');
  result?.querySelector('h3') && (result.querySelector('h3').textContent = value[0]);
  result?.querySelector('p:last-child') && (result.querySelector('p:last-child').textContent = value[1]);
  dirty = true; replay('jump', false);
});
function measure() {
  scale = innerWidth <= 650 ? 3 : 4;
  pageHeight = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  wallBounds = bounds(wall);
  const focus = innerHeight * (innerWidth <= 650 ? .8 : .55), safeHalf = 18 * scale;
  route = stages.map(({name, target}) => {
    const r = bounds(target);
    const surfaceOffset = {hero:-16, bridge:-8, jump:-5, approach:-13}[name] || 0;
    const y = r.top + surfaceOffset;
    const inset = Math.min(safeHalf + 12, r.width * .3);
    const from = clamp(r.left + inset, safeHalf + 8, innerWidth - safeHalf - 8);
    let to = clamp(r.left + r.width * .72, safeHalf + 8, innerWidth - safeHalf - 8);
    if (name === 'paw') {
      const paper = bounds(card);
      to = clamp((paper?.right || r.right) + 20 * scale, safeHalf + 8, innerWidth - safeHalf - 8);
    }
    return {name, target, y, from, to, at:clamp(y-focus, 0, pageHeight), width:r.width};
  }).sort((a,b) => a.y-b.y);
  const minimumGap = Math.min(100, pageHeight / Math.max(1, route.length-1));
  for (let i=route.length-2; i>=0; i--) route[i].at = Math.min(route[i].at,route[i+1].at-minimumGap);
  if (route[0]?.at < 0) {
    const start = route[0].at, span = route.at(-1).at-start;
    route.forEach(node => node.at = (node.at-start)/Math.max(1,span)*pageHeight);
  }
  route.forEach((node,i) => {
    const before = i ? node.at-route[i-1].at : 200;
    const after = i<route.length-1 ? route[i+1].at-node.at : 250;
    node.hold = Math.max(1,Math.min(70,before*.16,after*.16));
  });
  sprite.style.width = `${80*scale}px`; sprite.style.height = `${64*scale}px`;
  sprite.style.left = `${-40*scale}px`; sprite.style.top = `${-48*scale}px`;
  lastAsset = ''; lastFrame = -1; dirty = false;
}
function positionAt(scroll) {
  const first = route[0], final = route.at(-1);
  if (scroll < first.at-first.hold) return {x:first.from,y:first.y,stage:first.name,perch:true};
  for (let i=0; i<route.length; i++) {
    const node = route[i];
    if (scroll<=node.at+node.hold && scroll>=node.at-node.hold) {
      const p=clamp((scroll-node.at+node.hold)/(node.hold*2));
      return {x:lerp(node.from,node.to,ease(p)),y:node.y,stage:node.name,perch:true};
    }
    const next=route[i+1];
    if (next && scroll>node.at+node.hold && scroll<next.at-next.hold) {
      const p=clamp((scroll-node.at-node.hold)/(next.at-next.hold-node.at-node.hold));
      // This dedicated wall is an actual piece of scenery: descend on its
      // right face, then pull onto the ledge when the reader scrolls upward.
      if (node.name==='bridge' && next.name==='paw' && wallBounds) {
        const wallX=wallBounds.right+2*scale;
        let x,y,state,index,air=0;
        if (p<.18) {
          const q=p/.18;
          x=lerp(node.to,wallX,ease(q)); y=lerp(node.y,node.y+24*scale,ease(q));
          if (scrollDirection<0) {state='climb'; index=Math.floor((1-q)*8);}
        } else if (p<.78) {
          const q=(p-.18)/.6;
          x=wallX; y=lerp(node.y+24*scale,next.y,ease(q));
          state='slide'; index=Math.floor(clock*9)%3;
        } else {
          const q=(p-.78)/.22;
          x=lerp(wallX,next.from,ease(q)); y=next.y;
        }
        return {x,y,stage:p>.78?next.name:node.name,transfer:true,p,state,index,wall:true,air};
      }
      const quiet=innerWidth<=650 && (node.name==='jump'||node.name==='approach');
      const gutter=quiet?innerWidth+26*scale:innerWidth-(18*scale+14);
      let x,y,air=0;
      if (p<.18) {x=lerp(node.to,gutter,ease(p/.18));y=node.y;}
      else if(p>.78) {const q=(p-.78)/.22;x=lerp(gutter,next.from,ease(q));y=next.y;air=Math.sin(q*Math.PI)*36;}
      else {const q=(p-.18)/.6;x=gutter;y=lerp(node.y,next.y,ease(q));air=Math.sin(q*Math.PI)*(innerWidth<=650?38:58);}
      return {x,y:y-air,ground:y,air,stage:p>.78?next.name:node.name,transfer:true,p};
    }
  }
  return {x:final.to,y:final.y,stage:final.name,perch:true};
}
function play(name, origin=null) {
  if (paused) return;
  sleeping=false; action={name,start:clock,hit:false,origin};
  if(name==='paw') card?.classList.remove('is-pawed');
  if(name==='pounce') answer?.classList.remove('cat-landed');
}
const stageAction = name => name==='paw'?'paw':name==='jump'?'pounce':name==='contact'?'eat':'lick';
function replay(name, scroll=true) {
  if(dirty) measure();
  const node=route.find(node=>node.name===name);if(!node)return;
  activity(); visit=''; action=null; parked=null; replayRequest=name;
  if(scroll) window.scrollTo({top:node.at+node.hold*.8,behavior:paused?'instant':'smooth'});
  else if(route.length && positionAt(progress).stage===name) {play(stageAction(name));replayRequest=null;}
  wake();
}
document.querySelectorAll('[data-replay]').forEach(button=>button.addEventListener('click',()=>replay(button.dataset.replay)));
document.querySelector('#feed-cat')?.addEventListener('click',()=>replay('contact'));
function syncMotion() {
  if(motionButton) {
    motionButton.textContent=paused?'Play cat motion':'Pause cat motion';
    motionButton.setAttribute('aria-pressed',String(paused));
  }
  document.documentElement.classList.toggle('cat-motion-paused',paused);
}
motionButton?.addEventListener('click',()=>{paused=!paused;action=null;sleeping=false;lastTime=0;syncMotion();activity();});
reduced.addEventListener('change',event=>{paused=event.matches;action=null;sleeping=false;lastTime=0;syncMotion();activity();});
function draw(state,frame,position) {
  const [file,count]=strips[state];frame=clamp(frame,0,count-1);
  if(lastAsset!==state) {
    sprite.style.backgroundImage=`url("/assets/mattz-cat/${encodeURIComponent(file)}.png")`;
    sprite.style.backgroundSize=`${80*count*scale}px ${64*scale}px`;lastAsset=state;lastFrame=-1;
  }
  if(lastFrame!==frame) {sprite.style.backgroundPosition=`${-80*frame*scale}px 0`;lastFrame=frame;}
  sprite.style.transform=`scaleX(${facing>0?-1:1})`;
  actor.style.transform=`translate3d(${Math.round(position.x)}px,${Math.round(position.y-scrollY)}px,0)`;
  shadow.style.opacity=position.wall?'0':String(position.air?Math.max(0,.75-position.air/85):.8);
  shadow.style.top=`${position.air||0}px`;
  actor.dataset.stage=position.stage;actor.dataset.action=state;actor.dataset.frame=String(frame);
  if(layer){layer.dataset.stage=position.stage;layer.dataset.action=state;layer.dataset.loaded='true';}
}
function frame(now) {
  raf=0;const dt=Math.min(.05,(now-(lastTime||now))/1000);lastTime=now;
  if(dirty)measure();if(!route.length||!loaded||stopped)return;
  const blocked=panel?.open||document.activeElement?.matches('select');
  if(!paused&&!blocked)clock+=dt;
  const target=scrollY;
  progress=paused?target:lerp(progress,target,1-Math.exp(-dt*18));
  if(Math.abs(progress-target)<.25)progress=target;
  const position=positionAt(progress);
  const movement=previousPosition?Math.hypot(position.x-previousPosition.x,position.y-previousPosition.y):0;
  if(previousPosition&&Math.abs(position.x-previousPosition.x)>.12)facing=position.x>previousPosition.x?1:-1;
  distance+=movement;previousPosition={...position};
  const settled=Math.abs(progress-target)<2&&movement<.65;
  if(position.perch&&settled&&!paused&&!blocked) {
    if(visit!==position.stage) {
      visit=position.stage;
      if(visit==='paw')play('paw');else if(visit==='jump')play('pounce');
    }
    if(replayRequest===position.stage) {play(position.stage==='hero'?'scare':stageAction(position.stage));replayRequest=null;}
  } else if(position.transfer) {visit='';action=null;sleeping=false;parked=null;}
  if(parked&&parked.stage===position.stage&&settled)position.x=parked.x;
  let state='idle',index=Math.floor(clock*7)%8;
  if(!settled&&!paused&&!blocked) {
    state=position.state||(position.transfer&&position.air>5?'runningJump':movement>6?'run':'walk');
    index=position.index??(state==='runningJump'?clamp(Math.floor((position.p||0)*3),0,2):Math.floor(distance/(scale*3))%strips[state][1]);
    if(position.wall)facing=-1;
  }
  if(position.wall&&settled&&!paused&&!blocked) {
    state=position.state||'slide';index=position.index??0;facing=-1;
  }
  const idleFor=clock-lastActivity;
  if(settled&&position.perch&&!paused&&!blocked&&!action) {
    if(idleFor>16) {sleeping=true;state='sleep';index=Math.floor(clock*6)%8;}
    else if(idleFor>5&&!groomed) {groomed=true;play('lick');}
  }
  if(action&&!paused&&!blocked) {
    const t=clock-action.start;
    if(action.name==='paw') {
      const paper=card?.getBoundingClientRect();
      const strikeX=clamp((paper?.right||position.x)-20*scale,18*scale+8,innerWidth-18*scale-8);
      action.origin??={x:position.x,y:position.y};
      const approach=clamp(t/.35);
      position.x=lerp(action.origin.x,strikeX,ease(approach));
      if(approach<1){facing=action.origin.x<strikeX?1:-1;state='walk';index=Math.floor(t*12)%12;}
      else {
        facing=-1;state='paw';index=Math.min(7,Math.floor((t-.35)*10));
        if(index>=4&&!action.hit){card?.classList.add('is-pawed');action.hit=true;}
      }
      if(t>=1.15){parked={stage:position.stage,x:position.x};action=null;}
    } else if(action.name==='pounce') {
      // Approach the card top, leap, and spring once on landing. ATTACK 2 is
      // a compact forward pounce; its impact frames are 3–4, not its last cell.
      const duration=1.25,p=clamp(t/duration);
      action.origin??={x:position.x,y:position.y};
      const destination=clamp(action.origin.x+12*scale,18*scale+8,innerWidth-18*scale-8);
      facing=1;position.x=lerp(action.origin.x,destination,ease(p));
      if(p<.38){const q=p/.38;state='jump';index=Math.min(2,Math.floor(q*3));position.air=Math.sin(q*Math.PI)*42;position.y-=position.air;}
      else {state='pounce';index=Math.min(8,Math.floor((p-.38)/.62*9));
        if(index>=3&&!action.hit){answer?.classList.add('cat-landed');action.hit=true;}}
      if(p===1){parked={stage:position.stage,x:position.x};action=null;}
    } else if(action.name==='eat') {
      const food=bounds(bowl),node=route.find(node=>node.name==='contact');
      action.origin??={x:position.x,y:position.y};
      const foodX=food?clamp((food.left+food.right)/2+12*scale,18*scale+8,innerWidth-18*scale-8):node.to;
      const q=clamp(t/.65);position.x=lerp(action.origin.x,foodX,ease(q));facing=-1;
      state=q<1?'walk':'eat';index=q<1?Math.floor(t*12)%12:Math.floor((t-.65)*8)%7;
      if(t>3.3){parked={stage:position.stage,x:position.x};action=null;}
    } else {
      state=action.name;const [,count,fps]=strips[state];index=Math.min(count-1,Math.floor(t*fps));
      if(t>=count/fps)action=null;
    }
  }
  if(paused||blocked){state='idle';index=0;}
  // Keep the small-screen reading column clear; use the actual opaque bounds.
  const pixels={left:position.x-34*scale,right:position.x+26*scale,top:position.y-scrollY-33*scale,bottom:position.y-scrollY+2*scale};
  const intersects=rect=>pixels.right>rect.left&&pixels.left<rect.right&&pixels.bottom>rect.top&&pixels.top<rect.bottom;
  const crossesCopy=innerWidth<=650&&[...document.querySelectorAll('.approach-intro,.approach-list h3,.approach-list p')].some(element=>intersects(element.getBoundingClientRect()));
  const controls=motionButton?.getBoundingClientRect();
  const coversControl=controls&&intersects(controls);
  // A scroll pause can land between surfaces. Keep the cat off the reading
  // column rather than leaving an idle pose suspended in empty space.
  const betweenSurfaces=position.transfer&&settled&&!position.wall;
  const clippedTransfer=position.transfer&&!position.wall&&position.x>innerWidth-24*scale;
  actor.hidden=!!panel?.open||crossesCopy||coversControl||betweenSurfaces||clippedTransfer||position.y-scrollY<-180||position.y-scrollY>innerHeight+180;
  draw(state,index,position);
  if(!paused&&!document.hidden)raf=requestAnimationFrame(frame);
}
function wake(){if(!raf&&!document.hidden&&!stopped)raf=requestAnimationFrame(frame);}
function activity() {
  lastActivity=clock;groomed=false;
  if(sleeping&&!paused){sleeping=false;play('waking');}
  wake();
}
window.addEventListener('scroll',()=>{
  if(Math.abs(scrollY-previousScroll)>.5)scrollDirection=scrollY>previousScroll?1:-1;
  previousScroll=scrollY;activity();
},{passive:true});
window.addEventListener('pointerdown',activity,{passive:true});
window.addEventListener('keydown',activity);
window.addEventListener('resize',()=>{dirty=true;wake();},{passive:true});
window.visualViewport?.addEventListener('resize',()=>{dirty=true;wake();},{passive:true});
const observer=new ResizeObserver(()=>{dirty=true;wake();});
stages.forEach(stage=>observer.observe(stage.target));
const main=document.querySelector('main');if(main)observer.observe(main);
if(wall)observer.observe(wall);
document.fonts.ready.then(()=>{dirty=true;wake();});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(raf);raf=0;}
  else{lastTime=0;activity();}
});
document.addEventListener('focusin',activity);document.addEventListener('focusout',wake);
syncMotion();
Promise.all(Object.values(strips).map(([file])=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=resolve;image.onerror=reject;
  image.src=`/assets/mattz-cat/${encodeURIComponent(file)}.png`;
}))).then(()=>{loaded=true;document.documentElement.classList.add('cat-ready');wake();}).catch(()=>{
  if(layer)layer.hidden=true;if(motionButton)motionButton.hidden=true;
  document.querySelectorAll('[data-replay],#feed-cat').forEach(button=>{button.textContent='Cat unavailable';button.disabled=true;});
});
window.addEventListener('pagehide',()=>{stopped=true;cancelAnimationFrame(raf);raf=0;observer.disconnect();});
window.addEventListener('pageshow',()=>{stopped=false;lastTime=0;stages.forEach(stage=>observer.observe(stage.target));if(main)observer.observe(main);if(wall)observer.observe(wall);dirty=true;wake();});
