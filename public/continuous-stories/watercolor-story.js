// Washes, MIT, pinned Drive package: 14e485b6e83dba1b5d02c987ae2ddd2222c60063.
// The feed owns every drag. Only a completed single tap adds pigment.
const feed=document.querySelector('#feed'), stage=document.querySelector('#washStage');
const host=document.querySelector('#washEngine'), hint=document.querySelector('#washHint');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let engine=null, mounting=null, failed=false, start=null, pending=null, colour=0, gateFrame=0;
const pigments=['rose','yellow','blue'];
let hintText='Colour, taking its time.';
function setHint(text){if(hintText!==text){hintText=text;hint.textContent=text}}
function near(){const r=stage.getBoundingClientRect(),f=feed.getBoundingClientRect();return r.bottom>f.top-400&&r.top<f.bottom+400}
function visible(){const r=stage.getBoundingClientRect(),f=feed.getBoundingClientRect();return r.bottom>f.top&&r.top<f.bottom}
function occluded(){return document.hidden||!document.querySelector('#onboarding').hidden||document.querySelector('#shade').classList.contains('show')}
function aiOpen(){return document.querySelector('#ai').classList.contains('open')}
function cancelPending(){if(pending)clearTimeout(pending.timer);pending=null;}
function gate(){
  gateFrame=0;
  const active=!reduced.matches&&!occluded()&&visible();
  if(engine){
    active?engine.resume():engine.pause();
    stage.setAttribute('role',reduced.matches?'img':'button');
    if(reduced.matches)stage.removeAttribute('tabindex');else stage.tabIndex=0;
    stage.setAttribute('aria-label',reduced.matches?'A still rose, yellow and blue watercolour study':'Living watercolour on paper. Tap or press Enter to add a drop of colour.'+(aiOpen()?'':' Double tap to like.'));
    setHint(reduced.matches?'Colour, taking its time.':'Tap the paper. Add a little colour.');
  }
  if(!active){cancelPending();start=null;stage.classList.remove('tap-preview')}
}
function requestGate(){if(!gateFrame)gateFrame=requestAnimationFrame(gate)}
async function mount(){
  if(engine||mounting||failed||reduced.matches)return;
  mounting=(async()=>{
    try{
      const {Washes}=await import('./primitives/washes/washes.js');
      if(reduced.matches)return;
      engine=Washes.create(host,{pointer:false,cursorPreview:false,scale:2.75,canvasScale:1,seed:19,paperColor:{r:239/255,g:233/255,b:216/255}});
      engine.pause({acceptInput:true});
      engine.paint(.36,.40,.31,'rose',.65).paint(.65,.45,.29,'yellow',.55).paint(.49,.66,.33,'blue',.6);
      engine.stir(.4,.46,.8,.4,.32).stir(.58,.60,-.6,-.3,.30);
      engine.canvas.setAttribute('aria-hidden','true');
      stage.classList.add('wash-live');
      gate();
    }catch(error){
      engine?.destroy();engine=null;failed=true;host.replaceChildren();
      stage.classList.remove('wash-live');
      setHint('Colour, taking its time.');
      // The designed SVG remains the story's complete static artwork.
      console.warn('Watercolour enhancement unavailable; showing the colour study.',error);
    }finally{mounting=null}
  })();
  return mounting;
}
function drop(point){
  if(!engine||reduced.matches||occluded()||!visible())return;
  const pigment=pigments[colour++%pigments.length];
  engine.paint(point.x,point.y,.14,pigment,.6).rewet(point.x,point.y,.22).stir(point.x,point.y,.5,-.3,.18);
  document.querySelector('#washStatus').textContent=`A ${pigment} drop added to the paper.`;
}
function preview(point){
  stage.style.setProperty('--tap-x',point.x*100+'%');stage.style.setProperty('--tap-y',point.y*100+'%');
  stage.classList.remove('tap-preview');void stage.offsetWidth;stage.classList.add('tap-preview');
}
function singleTap(point,e){
  preview(point);
  const now=performance.now();
  if(!aiOpen()&&pending&&now-pending.time<310&&Math.hypot(e.clientX-pending.clientX,e.clientY-pending.clientY)<35){cancelPending();return;}
  if(pending){const prior=pending.point;cancelPending();drop(prior)}
  const record={point,time:now,clientX:e.clientX,clientY:e.clientY};
  record.timer=setTimeout(()=>{if(pending===record){pending=null;drop(point)}},315);
  pending=record;
}
feed.addEventListener('pointerdown',e=>{
  if(start||!e.isPrimary||e.button>0||!e.target.closest('#washStage')||!engine||reduced.matches||occluded())return;
  start={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
},{passive:true});
feed.addEventListener('pointermove',e=>{if(start?.id===e.pointerId&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>=9)start.moved=true},{passive:true});
feed.addEventListener('pointerup',e=>{
  if(!start||start.id!==e.pointerId)return;
  const initial=start;start=null;
  if(initial.moved||Math.hypot(e.clientX-initial.x,e.clientY-initial.y)>=9||occluded())return;
  const r=stage.getBoundingClientRect();
  const point={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
  if(point.x>=0&&point.x<=1&&point.y>=0&&point.y<=1)singleTap(point,e);
},{passive:true});
for(const event of ['pointercancel','lostpointercapture'])feed.addEventListener(event,e=>{if(start?.id===e.pointerId)start=null},{passive:true});
stage.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&engine&&!reduced.matches){e.preventDefault();cancelPending();const point={x:.35+(colour%3)*.15,y:.48};preview(point);drop(point)}
});
new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))mount();requestGate()},{root:feed,rootMargin:'400px 0px',threshold:0}).observe(stage);
feed.addEventListener('scroll',requestGate,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){engine?.pause();cancelPending();start=null}else requestGate()});
const overlays=new MutationObserver(requestGate);
overlays.observe(document.querySelector('#onboarding'),{attributes:true,attributeFilter:['hidden']});
overlays.observe(document.querySelector('#shade'),{attributes:true,attributeFilter:['class']});
overlays.observe(document.querySelector('#ai'),{attributes:true,attributeFilter:['class','hidden']});
reduced.addEventListener('change',()=>{cancelPending();if(!reduced.matches&&near())mount();requestGate()});
window.addEventListener('resize',requestGate);
window.addEventListener('pageshow',requestGate);
window.addEventListener('pagehide',e=>{engine?.pause();cancelPending();if(!e.persisted){engine?.destroy();engine=null}});
if(near())mount();
