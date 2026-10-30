import {twoFingerIntent,autoStep} from './feed-motion-rules.js?v=6d1af6096266';
const feed=document.querySelector('#feed'),device=document.querySelector('#device'),bridge=window.feedMotionBridge,cue=document.querySelector('#twoFingerCue'),autoToggle=document.querySelector('#autoToggle'),accessible=document.querySelector('#accessibleAuto');
let enabled=true,touchCount=0,mouse=new Set(),focused=true,frame=0,last=0,position=0,written=0,velocity=0,wheelUntil=0,wheelTimer=0,multi=null,cueTimer=0,suppressClicksUntil=0;
const held=()=>touchCount>0||mouse.size>0;
function showCue(text,armed=false){clearTimeout(cueTimer);cue.querySelector('span').textContent=text;cue.classList.toggle('ready',armed);cue.classList.add('show');}
function hideCue(){cue.classList.remove('show','ready');}
function ack(text){showCue(text);cueTimer=setTimeout(hideCue,1700);}
function canRun(){return enabled&&!held()&&!bridge.blocked()&&!document.hidden&&performance.now()>=wheelUntil;}
function stop(){cancelAnimationFrame(frame);frame=0;last=0;velocity=0;}
function reconcile(){if(!canRun()){stop();return;}if(!frame){position=written=feed.scrollTop;last=performance.now();frame=requestAnimationFrame(tick);}}
function tick(now){frame=0;if(!canRun()){stop();return;}if(Math.abs(feed.scrollTop-written)>2)position=feed.scrollTop;const step=autoStep(position,velocity,now-last,feed.scrollHeight-feed.clientHeight);last=now;position=step.position;velocity=step.velocity;feed.scrollTop=position;written=feed.scrollTop;if(step.done){setAuto(false,false);return;}frame=requestAnimationFrame(tick);}
function setAuto(on,announce=true){enabled=!!on;autoToggle.setAttribute('aria-checked',String(enabled));accessible.setAttribute('aria-pressed',String(enabled));reconcile();if(announce)ack(enabled?'Auto-scroll on':'Auto-scroll off');}
autoToggle.addEventListener('click',()=>setAuto(!enabled));accessible.addEventListener('click',()=>setAuto(!enabled));
const touches=list=>[...list].map(t=>({id:t.identifier,x:t.clientX,y:t.clientY}));
function reserve(e){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();}
// Capture a pair before the ordinary one-finger story/range handlers see it.
feed.addEventListener('touchstart',e=>{
 if(multi){multi.cancelled=true;reserve(e);return;}
 if(e.touches.length<2||bridge.blocked()||![...e.touches].every(t=>feed.contains(t.target)))return;
 bridge.cancel();window.dispatchEvent(new Event('feed:two-touch'));multi={start:touches(e.touches),intent:null,story:e.target.closest('.story')||bridge.story(),cancelled:e.touches.length!==2,ending:false};reserve(e);
},{capture:true,passive:false});
window.addEventListener('touchstart',e=>{if(device.contains(e.target)||multi){touchCount=e.touches.length;reconcile();}},{capture:true,passive:true});
window.addEventListener('touchmove',e=>{if(!multi)return;reserve(e);if(e.touches.length!==2||multi.cancelled||multi.ending){if(e.touches.length>2)multi.cancelled=true;return;}const points=touches(e.touches),spread=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(Math.abs(spread(points)-spread(multi.start))>Math.max(24,spread(multi.start)*.2)){multi.cancelled=true;hideCue();return;}const intent=twoFingerIntent(multi.start,points);if(intent&&!multi.intent){try{navigator.vibrate?.(12)}catch{}}multi.intent=intent;if(intent)showCue(intent==='auto'?(enabled?'Auto-scroll off':'Auto-scroll on'):'Feed menu',true);else hideCue();},{capture:true,passive:false});
function endTouches(e,cancel=false){touchCount=e.touches.length;reconcile();if(!multi)return;reserve(e);if(cancel)multi.cancelled=true;multi.ending=true;if(e.touches.length)return;const g=multi;multi=null;suppressClicksUntil=performance.now()+400;bridge.cancel();hideCue();if(!g.cancelled&&g.intent){if(g.intent==='auto')setAuto(!enabled);else bridge.menu(g.story);}reconcile();}
window.addEventListener('touchend',e=>endTouches(e),{capture:true,passive:false});window.addEventListener('touchcancel',e=>endTouches(e,true),{capture:true,passive:false});
// Touch hold uses touchend, not pointercancel: native panning can cancel a pointer while the finger is still down.
device.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;mouse.add(e.pointerId);reconcile();},{capture:true});
window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')return;mouse.delete(e.pointerId);reconcile();},{capture:true});window.addEventListener('pointercancel',e=>{if(e.pointerType==='touch')return;mouse.delete(e.pointerId);reconcile();},{capture:true});
feed.addEventListener('wheel',()=>{wheelUntil=performance.now()+650;stop();clearTimeout(wheelTimer);wheelTimer=setTimeout(reconcile,670);},{passive:true});
window.addEventListener('feed:overlay',reconcile);new MutationObserver(reconcile).observe(document.querySelector('#onboarding'),{attributes:true,attributeFilter:['hidden']});
window.addEventListener('blur',()=>{focused=false;touchCount=0;mouse.clear();multi=null;hideCue();stop();});window.addEventListener('focus',()=>{focused=true;reconcile();});document.addEventListener('visibilitychange',()=>{if(document.hidden){touchCount=0;mouse.clear();multi=null;hideCue();}reconcile();});
document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||bridge.blocked()||e.target.closest('button,input,textarea,a,summary,[role="button"],.puzzle-surface'))return;e.preventDefault();bridge.cancel();setAuto(!enabled);});

// Suppress compatibility taps left over from either contact of a reserved pair.
feed.addEventListener('click',e=>{if(multi||performance.now()<suppressClicksUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});

window.addEventListener('message',e=>{if(e.data==='pitchdeck:play'){if(feed.scrollTop>=feed.scrollHeight-feed.clientHeight-2){feed.scrollTop=0;position=written=0;velocity=0;}setAuto(true,false);}if(e.data==='pitchdeck:pause')setAuto(false,false);});
requestAnimationFrame(()=>setTimeout(()=>setAuto(true,false),900));
