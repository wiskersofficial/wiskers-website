import {THREAD_EDGES,threadStep,threadWon,RIVER_START,RIVER_BASE,riverPorts,riverWalk} from './puzzle-rules.js?v=65adcff49461';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let saved={};try{saved=JSON.parse(localStorage.getItem('story-puzzles-v1'))||{}}catch{}
let thread=[];if(Array.isArray(saved.thread))for(const n of saved.thread)thread=threadStep(thread,n);
let turns=Array.isArray(saved.river)&&saved.river.length===9&&saved.river.every(n=>Number.isInteger(n)&&n>=0&&n<4)?saved.river:[...RIVER_START];
function save(){try{localStorage.setItem('story-puzzles-v1',JSON.stringify({thread,river:turns}))}catch{}}
function buzz(){try{navigator.vibrate?.(8)}catch{}}
const points=[[52,57],[160,40],[265,66],[43,157],[151,150],[274,169],[65,264],[169,269],[267,266]];
const svg=$('#threadBoard'),guide=$('#threadGuides'),line=$('#threadLine'),nodes=$('#threadStars');
THREAD_EDGES.forEach(([a,b])=>{const el=document.createElementNS(NS,'path');el.setAttribute('d',`M${points[a]}L${points[b]}`);guide.append(el)});
points.forEach(([x,y],i)=>{const el=document.createElementNS(NS,'g');el.classList.add('thread-star');el.dataset.star=i;el.setAttribute('transform',`translate(${x} ${y})`);el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',i===0?'Start star':i===8?'Finish star':`Star ${i+1}`);el.innerHTML=`<circle class="star-hit" r="27"/><circle class="star-ring" r="17"/><path d="M0 -10Q2 -2 10 0Q2 2 0 10Q-2 2 -10 0Q-2 -2 0 -10Z"/><circle class="star-core" r="3"/><text y="39">${i===0?'START':i===8?'FINISH':''}</text>`;nodes.append(el);el.addEventListener('click',()=>step(i));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();step(i)}})});
function renderThread(){
 line.setAttribute('d',thread.map((n,i)=>(i?'L':'M')+points[n]).join(' '));
 const won=threadWon(thread);$('#thread').classList.toggle('puzzle-solved',won);
 nodes.querySelectorAll('[data-star]').forEach(el=>{const n=+el.dataset.star;el.classList.toggle('visited',thread.includes(n));el.classList.toggle('endpoint',thread.at(-1)===n);el.setAttribute('aria-pressed',String(thread.includes(n)))});
 $('#threadStatus').textContent=won?'A constellation, all yours.':thread.length?`${thread.length} of 9 stars threaded`:'0 of 9 stars threaded';
 $('#threadUndo').disabled=!thread.length;save();
}
function step(n){const next=threadStep(thread,n);if(next===thread)return;thread=next;buzz();renderThread()}
let drag=null,dragStartThread=null;
function nearest(e){const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*320/r.height;return points.findIndex(p=>Math.hypot(p[0]-x,p[1]-y)<27)}
svg.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button>0)return;const n=nearest(e);if(n<0)return;e.preventDefault();dragStartThread=[...thread];step(n);if(thread.at(-1)!==n)return;drag=e.pointerId;svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(drag!==e.pointerId)return;step(nearest(e))});
function end(e){if(drag!==e.pointerId)return;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId)}
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',()=>drag=null);window.addEventListener('blur',()=>drag=null);
$('#threadUndo').onclick=()=>{thread=thread.slice(0,-1);renderThread()};$('#threadReset').onclick=()=>{thread=[];renderThread()};
renderThread();
const grid=$('#riverGrid'),tiles=[],angles=turns.map(n=>n*90);
const dirs=['north','east','south','west'];
for(let i=0;i<9;i++){
 const b=document.createElement('button');b.type='button';b.className='river-tile';b.style.setProperty('--paper', ['#e9dcc4','#d9e7cb','#e9d1bf','#d3e6df','#e4dbba','#d6d9ec','#dbe4bb','#efd8b8','#d8e6de'][i]);b.style.setProperty('--wonk',[-1.3,.8,-.7,1,-1.1,.8,-.6,1.2,-.8][i]+'deg');
 b.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true"><g class="river-channel"><path class="river-bank"/><path class="river-ink"/><path class="river-water"/><path class="river-glint"/></g></svg><span class="tile-number">${String(i+1).padStart(2,'0')}</span>`;
 b.addEventListener('click',()=>{turns[i]=(turns[i]+1)%4;angles[i]+=90;buzz();renderRiver()});grid.append(b);tiles.push(b);
}
function channelPath(ports){const pos=[[50,-4],[104,50],[50,104],[-4,50]],a=pos[ports[0]],b=pos[ports[1]];return ports[0]%2===ports[1]%2?`M${a}L${b}`:`M${a}Q50 50 ${b}`}
function renderRiver(){
 const result=riverWalk(turns);$('#riverfold').classList.toggle('puzzle-solved',result.won);
 tiles.forEach((b,i)=>{const ports=riverPorts(i,turns[i]);b.setAttribute('aria-label',`Piece ${i+1}, row ${Math.floor(i/3)+1}, column ${i%3+1}. River opens ${ports.map(n=>dirs[n]).join(' and ')}. Tap to turn clockwise.`);b.classList.toggle('flowing',result.path.includes(i));b.querySelector('svg').style.transform=`rotate(${angles[i]}deg)`;b.querySelectorAll('path').forEach(p=>p.setAttribute('d',channelPath(RIVER_BASE[i])));});
 $('#riverStatus').textContent=result.won?'The river has found its way.':`${result.path.length} of 9 pieces connected`;
 save();
}
$('#riverReset').onclick=()=>{turns=[...RIVER_START];turns.forEach((n,i)=>angles[i]=n*90);renderRiver()};renderRiver();
// The margins drift with the feed. Neither puzzle pins or captures the surrounding scroll.
const feed=$('#feed'),sections=[$('#thread'),$('#riverfold')];let queued=false;
function paint(){queued=false;const r=feed.getBoundingClientRect();sections.forEach(s=>{const y=s.getBoundingClientRect().top-r.top;if(y<r.height&&y>-s.offsetHeight)s.style.setProperty('--puzzle-drift',reduce.matches?'0px':`${Math.max(-32,Math.min(32,y*.065))}px`)})}
feed.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});reduce.addEventListener('change',paint);paint();

window.addEventListener('feed:two-touch',()=>{if(drag===null)return;const id=drag;drag=null;if(dragStartThread){thread=dragStartThread;renderThread();}if(svg.hasPointerCapture(id))svg.releasePointerCapture(id);});
