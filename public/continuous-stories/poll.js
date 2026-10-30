import {baseline,pullIntent,pullAmount,results} from './poll-logic.js?v=55fe1d43bced';
const host=document.querySelector('#poll'),feed=document.querySelector('#feed'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),rows=[...host.querySelectorAll('.driver-row')];
let choice=window.storyPoll.get(),active=null;
const names={antonelli:'Kimi Antonelli',norris:'Lando Norris',verstappen:'Max Verstappen',leclerc:'Charles Leclerc'};
function buzz(){try{navigator.vibrate?.(12)}catch{}}
function render(){const shares=results(choice);rows.forEach(row=>{const selected=row.dataset.driver===choice;row.classList.toggle('picked',selected);row.querySelector('.pull-handle').setAttribute('aria-pressed',String(selected));row.querySelector('.pull-handle span').textContent=selected?'✓':'→';row.querySelector('.pull-label').textContent=selected?'Your pick':'Pull for '+names[row.dataset.driver].split(' ')[0];row.querySelector('.driver-picked').textContent=selected?'YOUR PICK':'';row.querySelector('.driver-share').textContent=shares[row.dataset.driver]+'%';});host.querySelector('#pollStatus').textContent=choice?names[choice]+' · saved':'Choose your winner.';}
function vote(id){if(!Object.hasOwn(baseline,id))return;choice=id;window.storyPoll.set(id);render();buzz();const row=rows.find(r=>r.dataset.driver===id);row.classList.remove('vote-confirmed');requestAnimationFrame(()=>row.classList.add('vote-confirmed'));setTimeout(()=>row.classList.remove('vote-confirmed'),650);}
function clear(){if(!active)return;const g=active;active=null;g.rail.classList.remove('dragging','armed');g.rail.style.setProperty('--pull-x','0px');g.rail.style.setProperty('--pull-progress','0');if(g.rail.hasPointerCapture(g.id))g.rail.releasePointerCapture(g.id);}
rows.forEach(row=>{
 const name=row.querySelector('.driver-name'),profile=row.querySelector('.driver-profile'),rail=row.querySelector('.poll-pull'),handle=row.querySelector('.pull-handle');
 name.addEventListener('click',()=>{const open=name.getAttribute('aria-expanded')!=='true';name.setAttribute('aria-expanded',String(open));profile.inert=!open;profile.setAttribute('aria-hidden',String(!open));profile.classList.toggle('open',open);});profile.setAttribute('aria-hidden','true');
 rail.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button>0||active)return;if(e.pointerType!=='touch')e.preventDefault();active={id:e.pointerId,rail,x:e.clientX,y:e.clientY,lastY:e.clientY,mode:null,armed:false,travel:Math.max(60,rail.clientWidth-68),type:e.pointerType,scroll:feed.scrollTop};});
 rail.addEventListener('pointermove',e=>{const g=active;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.mode){g.mode=pullIntent(dx,dy);if(g.mode==='pull'){rail.setPointerCapture(e.pointerId);rail.classList.add('dragging');}}
  if(g.mode==='scroll'){if(g.type!=='touch')feed.scrollTop-=e.clientY-g.lastY;g.lastY=e.clientY;return;}if(g.mode!=='pull')return;e.preventDefault();const p=pullAmount(dx,g.travel);rail.style.setProperty('--pull-x',p.distance+'px');rail.style.setProperty('--pull-progress',String(p.progress));rail.classList.toggle('armed',p.armed);if(p.armed&&!g.armed)buzz();g.armed=p.armed;
 });
 function end(e,cancel=false){if(!active||active.id!==e.pointerId)return;const cast=!cancel&&active.mode==='pull'&&active.armed;clear();if(cast)vote(row.dataset.driver);}
 rail.addEventListener('pointerup',e=>end(e));rail.addEventListener('pointercancel',e=>end(e,true));rail.addEventListener('lostpointercapture',e=>end(e,true));
 // Enter/Space and assistive activation are equivalent to a completed pull.
 handle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();clear();vote(row.dataset.driver)}if(e.key==='Escape')clear();});handle.addEventListener('click',e=>{if(e.detail===0)vote(row.dataset.driver)});
 row.querySelector('img').addEventListener('error',e=>{e.target.hidden=true;row.querySelector('.driver-thumb').textContent=names[row.dataset.driver].split(' ').map(s=>s[0]).join('');});
});
feed.addEventListener('scroll',()=>{if(active?.mode!=='scroll')clear()},{passive:true});window.addEventListener('blur',clear);window.addEventListener('resize',clear);reduce.addEventListener('change',clear);render();

window.addEventListener('feed:two-touch',clear);
