const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const META={
 less:{label:'Less of this',ready:'Release to skip',done:'Flow changed',color:'#ffae95',confirm:'#ff7966'},
 friend:{label:'Bring a friend',ready:'Release to talk',done:'Let’s talk',color:'#c4adff',confirm:'#a58aff'},
 like:{label:'More like this',ready:'Release to like',done:'More of this',color:'#f5b7ce',confirm:'#b9f4b6'},
 comments:{label:'The conversation',ready:'Release to join',done:'You’re in',color:'#a4ddec',confirm:'#70e1e8'},
};

export class Gestures {
 constructor(element,{onCommit,onBend=()=>{},reduced=()=>false}){
  this.el=element;this.onCommit=onCommit;this.onBend=onBend;this.reduced=reduced;
  this.bezels=new Map([...document.querySelectorAll('.bezel')].map(el=>[el.dataset.action,el]));
  this.threshold=()=>clamp(Math.min(innerWidth,innerHeight)*.25,86,138);
  this.el.addEventListener('pointerdown',e=>this.start(e));
  this.el.addEventListener('pointermove',e=>this.move(e));
  this.el.addEventListener('pointerup',e=>this.end(e));
  this.el.addEventListener('pointercancel',()=>this.cancel());
  this.el.addEventListener('lostpointercapture',()=>{if(this.pointer)this.cancel();});
  this.el.addEventListener('dragstart',e=>e.preventDefault());
  this.el.addEventListener('click',e=>{if(Date.now()<this.suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  this.el.addEventListener('wheel',e=>this.wheel(e),{passive:false});
  addEventListener('blur',()=>this.cancel());
  this.bezels.forEach((el,action)=>el.querySelector('button').addEventListener('click',()=>this.commit(action)));
 }
 pulse(kind){
  if(typeof navigator.vibrate!=='function'){document.documentElement.dataset.haptics='unavailable';return;}
  try{const ok=navigator.vibrate(kind==='confirm'?[12,28,22]:8);document.documentElement.dataset.haptics=ok?'requested':'unavailable';}catch{document.documentElement.dataset.haptics='unavailable';}
 }
 start(e){
  if(!e.isPrimary){this.cancel();return;}
  if(e.button!==0||e.target.closest('input,textarea,[contenteditable]'))return;
  this.stopMomentum();window.scrollTo({top:scrollY,behavior:'instant'});clearTimeout(this.wheelTimer);this.wheelGesture=null;
  this.suppressUntil=0;
  const tapTarget=e.target.closest('button,a');
  this.pointer={tapTarget,id:e.pointerId,x:e.clientX,y:e.clientY,lastY:e.clientY,lastTime:e.timeStamp,velocity:0,mode:null};
  // Claim the pointer before the UA can turn a diagonal into a cancelled pan.
  // The document still scrolls normally; touch dragging adds momentum below.
  (tapTarget||this.el).setPointerCapture(e.pointerId);e.preventDefault();
 }
 move(e){
  const p=this.pointer;if(!p||p.id!==e.pointerId)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y,dist=Math.hypot(dx,dy);
  if(!p.mode&&dist>5){
   if(Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)*.55)p.mode='swipe';
   else if(dist>9)p.mode='scroll';
  }
  if(p.mode==='scroll'){
   const elapsed=clamp(e.timeStamp-p.lastTime,4,40),delta=p.lastY-e.clientY;
   window.scrollBy({top:delta,behavior:'instant'});p.velocity=p.velocity*.3+(delta/elapsed)*.7;
  }else if(p.mode==='swipe')this.preview(dx,dy);
  p.lastY=e.clientY;p.lastTime=e.timeStamp;e.preventDefault();
 }
 preview(dx,dy){
  const action=dx<0?(dy<0?'less':'like'):(dy<0?'friend':'comments');
  const distance=Math.hypot(dx,dy),alignment=Math.min(1,Math.abs(dx)/28,Math.abs(dy)/25);
  const progress=clamp(distance/this.threshold(),0,1)*alignment;
  const armed=progress>.995;
  if(armed&&(!this.active?.armed||this.active.action!==action))this.pulse('arm');
  this.active={action,progress,armed};
  document.body.classList.add('swiping');
  document.documentElement.style.setProperty('--bend-x',`${Math.tanh(dx/180)*54}px`);
  document.documentElement.style.setProperty('--bend-y',`${Math.tanh(dy/200)*18}px`);
  this.onBend(this.reduced()?0:Math.tanh(dx/180)*65,this.reduced()?0:Math.tanh(dy/200)*24);
  this.bezels.forEach((el,key)=>{
   el.classList.toggle('preview',key===action);el.classList.toggle('armed',key===action&&armed);
   if(key!==action&&!el.classList.contains('confirmed'))el.style.setProperty('--progress',0);
  });
  const bezel=this.bezels.get(action);bezel.style.setProperty('--progress',progress);
  bezel.style.setProperty('--bezel-color',META[action].color);
  bezel.querySelector('.bezel-label').textContent=armed?META[action].ready:META[action].label;
  const root=document.documentElement;root.dataset.gesture=action;root.dataset.gestureProgress=progress.toFixed(3);root.dataset.gestureState=armed?'armed':'tracking';
 }
 end(e){
  const p=this.pointer;if(!p||p.id!==e.pointerId)return;
  this.pointer=null;
  if(p.mode)this.suppressUntil=Date.now()+400;
  if(!p.mode&&p.tapTarget){this.reset();p.tapTarget.click();this.suppressUntil=Date.now()+400;return;}
  if(p.mode==='swipe'&&this.active?.armed){const action=this.active.action;this.reset();this.commit(action);}
  else{this.reset();if(p.mode==='scroll'&&e.timeStamp-p.lastTime<100)this.momentum(p.velocity);}
 }
 reset(){
  this.active=null;document.body.classList.remove('swiping');
  document.documentElement.style.setProperty('--bend-x','0px');document.documentElement.style.setProperty('--bend-y','0px');this.onBend(0,0);
  this.bezels.forEach(el=>{el.classList.remove('preview','armed');if(!el.classList.contains('confirmed'))el.style.setProperty('--progress',0);});
  document.documentElement.dataset.gestureState='idle';
 }
 cancel(){this.pointer=null;clearTimeout(this.wheelTimer);this.wheelGesture=null;this.reset();}
 commit(action){
  if(!META[action])return;this.stopMomentum();this.reset();
  const bezel=this.bezels.get(action),meta=META[action];clearTimeout(bezel._confirmation);
  bezel.style.setProperty('--progress',1);bezel.style.setProperty('--bezel-color',meta.confirm);bezel.classList.add('confirmed');
  bezel.querySelector('.bezel-label').textContent=meta.done;
  const root=document.documentElement;root.dataset.lastGesture=action;root.dataset.gestureState='confirmed';
  this.pulse('confirm');this.onCommit(action);
  bezel._confirmation=setTimeout(()=>{bezel.classList.remove('confirmed');bezel.style.setProperty('--progress',0);bezel.querySelector('.bezel-label').textContent=meta.label;if(root.dataset.gestureState==='confirmed')root.dataset.gestureState='idle';},950);
 }
 wheel(e){
  if(this.pointer)return;this.stopMomentum();
  const diagonal=Math.abs(e.deltaX)>2&&Math.abs(e.deltaX)>Math.abs(e.deltaY)*.48;
  if(!diagonal&&!this.wheelGesture)return;
  e.preventDefault();this.wheelGesture||={x:0,y:0};this.wheelGesture.x-=e.deltaX;this.wheelGesture.y-=e.deltaY;
  this.preview(this.wheelGesture.x,this.wheelGesture.y);clearTimeout(this.wheelTimer);
  this.wheelTimer=setTimeout(()=>{const action=this.active?.armed?this.active.action:null;this.wheelGesture=null;this.reset();if(action)this.commit(action);},150);
 }
 stopMomentum(){cancelAnimationFrame(this.momentumFrame);this.momentumFrame=null;}
 momentum(velocity){
  this.stopMomentum();if(this.reduced()||Math.abs(velocity)<.06)return;
  let last=performance.now(),v=clamp(velocity,-3,3);
  const step=now=>{const dt=Math.min(now-last,32);last=now;v*=Math.exp(-dt/230);const before=scrollY;window.scrollBy({top:v*dt,behavior:'instant'});if(Math.abs(v)>.015&&scrollY!==before)this.momentumFrame=requestAnimationFrame(step);};
  this.momentumFrame=requestAnimationFrame(step);
 }
}
