import { progressAcrossViewport, observeLayoutChanges } from './primitives/scroll-timing.js';

// Scroll-driven Canvas2D adaptations of Drive Constellation Links and Wave Field.
// No hover listeners, cursor proximity, or pointer-triggered decorative effects.
const feed=document.querySelector('#feed'),device=document.querySelector('#device');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const visible=new Set(),scenes=[];
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
let frame=0,boxes=new Map(),lastNightScroll=null,lastNightProgress=null;
const request=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(update)};
const arrivals=[...feed.querySelectorAll('.paper,.photo,.art-poster,.quote-scrap')];
arrivals.forEach(el=>el.classList.add('scroll-arrival'));
const targets=[...new Set([...arrivals,...feed.querySelectorAll('.garden-art,.space-scene,.response-flower,.night-sequence,.street-view,.thread-line,.rain-sequence')])];
const stems=[...feed.querySelectorAll('.garden-art svg > g[fill="none"] > path')];
// A faint complete sketch connects the blossoms before the ink has caught up.
for(const group of new Set(stems.map(path=>path.parentElement))){
  const guide=group.cloneNode(true);guide.classList.add('stem-guide');guide.setAttribute('aria-hidden','true');group.before(guide);
}
stems.forEach(path=>{path.setAttribute('pathLength','1');path.classList.add('growing-stem')});
function measure(){
  device.style.setProperty('--feed-h',feed.clientHeight+'px');
  boxes=new Map(targets.map(el=>{
    let top=0;
    for(let node=el;node&&node!==feed&&node!==device;node=node.offsetParent)top+=node.offsetTop;
    return [el,{top,height:el.offsetHeight}];
  }));request();
}
function canvasScene(host,kind){
  if(!host)return;
  const canvas=document.createElement('canvas');canvas.className='living-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}
  let seed=9;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const scene={host,canvas,ctx,kind,w:0,h:0,nodes:Array.from({length:48},()=>({u:random(),v:random(),size:.7+random()*1.2}))};
  scenes.push(scene);
  new ResizeObserver(()=>{scene.w=host.clientWidth;scene.h=host.clientHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(scene.w*ratio);canvas.height=Math.round(scene.h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);request()}).observe(host);
}
canvasScene(document.querySelector('.space-scene'),'stars');
canvasScene(document.querySelector('.art-poster'),'waves');
function paintStars(s,p){
  const {ctx,w,h}=s;ctx.clearRect(0,0,w,h);
  const nodes=s.nodes.map(n=>({...n,x:clamp(n.u+(p-.5)*.14+Math.sin(n.v*9+p*3)*.025)*w,y:clamp(n.v+Math.cos(n.u*7+p*3)*.035)*h}));
  const reach=55+p*50;
  for(let i=0;i<nodes.length;i++){
    const a=nodes[i];
    for(let j=i+1;j<nodes.length;j++){const b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<reach){ctx.strokeStyle=`rgba(187,180,226,${(1-d/reach)*.4})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
    ctx.fillStyle='#e9dff8';ctx.beginPath();ctx.arc(a.x,a.y,a.size,0,Math.PI*2);ctx.fill();
  }
}
function paintWaves(s,p){
  const {ctx,w,h}=s;ctx.clearRect(0,0,w,h);
  for(let row=0;row<14;row++){
    ctx.beginPath();
    for(let x=0;x<=w;x+=6){const base=h*.18+row*h*.048,y=base+Math.sin(x*.018+p*9+row*.3)*(6+p*5)+Math.cos(x*.009-p*6)*4;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.strokeStyle=`rgba(255,248,219,${.1+row*.008})`;ctx.lineWidth=.9;ctx.stroke();
  }
}
function sceneProgress(el,scroll,height){const b=boxes.get(el);return b?clamp((scroll-b.top+height*.92)/(b.height+height*.55)):.5}
const rainSequence=document.querySelector('.rain-sequence'),shortRain=matchMedia('(max-height: 480px)');
const rainRoutes=[['#rainRunoff','#runoffDrop',81],['#rainInfiltration','#soilDrop',82]].map(([path,drop,fall])=>{const el=document.querySelector(path);return {path:el,drop:document.querySelector(drop),length:el.getTotalLength(),fall}});
const rainPassages=[
  {chapter:'01 / THE LANDING',line:['Same cloud.','Different landing.'],detail:'Two drops land: one on paving, one on soil.'},
  {chapter:'02 / THE QUICKER ROUTE',line:['Over the surface.','Towards a drain.'],detail:'Paving sends water along the surface towards drainage.'},
  {chapter:'03 / ANOTHER WAY DOWN',line:['A little room','to soak in.'],detail:'Some water enters the soil. This is infiltration.'},
  {chapter:'RUNOFF + INFILTRATION',line:['Two surfaces.','Two ways through.'],detail:'Paving sends water towards drainage. Soil lets some enter the ground: infiltration.'}
];
let rainChapter=-1;
function renderRain(p){
  for(const route of rainRoutes){
    const distance=p<=.25?route.fall*p/.25:route.fall+(route.length-route.fall)*(p-.25)/.75;
    route.path.style.strokeDasharray='1';route.path.style.strokeDashoffset=String(1-distance/route.length);
    const point=route.path.getPointAtLength(distance);
    route.drop.setAttribute('transform',`translate(${point.x},${point.y})`);
  }
  const index=reduced.matches||shortRain.matches?3:p<.25?0:p<.65?1:2;
  if(index===rainChapter)return;
  rainChapter=index;const passage=rainPassages[index];
  document.querySelector('#rainChapter').textContent=passage.chapter;
  document.querySelector('#rainLine').replaceChildren(...passage.line.flatMap((text,i)=>i?[document.createElement('br'),document.createTextNode(text)]:[document.createTextNode(text)]));
  document.querySelector('#rainDetail').textContent=passage.detail;
  document.querySelector('#rainPassage').dataset.context=passage.chapter+': '+passage.line.join(' ')+' '+passage.detail;
  document.querySelectorAll('.rain-chapter-dots i').forEach((dot,i)=>dot.style.background=i===index?'#477c87':'#477c8750');
}
renderRain(reduced.matches?1:0);
function update(){
  frame=0;
  const paused=document.hidden||!document.querySelector('#onboarding').hidden||document.querySelector('#shade').classList.contains('show');
  device.classList.toggle('motion-paused',paused||reduced.matches);
  if(paused)return;
  const height=feed.clientHeight,scroll=feed.scrollTop;
  for(const [el,box] of boxes){
    if(box.top+box.height<scroll-100||box.top>scroll+height+100)continue;
    el.style.setProperty('--arrival',String(reduced.matches?1:progressAcrossViewport(box,scroll,height,.98,.58)));
    el.style.setProperty('--scene',String(reduced.matches?1:sceneProgress(el,scroll,height)));
    if(el.classList.contains('thread-line'))el.style.setProperty('--thread-draw',String(reduced.matches?1:progressAcrossViewport(box,scroll,height,.85,.60)));
  }
  for(const story of visible)story.style.setProperty('--journey',String(reduced.matches?.5:clamp((scroll-story.offsetTop+height)/(story.offsetHeight+height))));
  for(const scene of scenes){
    if(!visible.has(scene.host.closest('.story')))continue;
    const box=boxes.get(scene.host);if(box&&(box.top+box.height<scroll||box.top>scroll+height))continue;
    const p=reduced.matches?.5:sceneProgress(scene.host,scroll,height);
    scene.kind==='stars'?paintStars(scene,p):paintWaves(scene,p);
  }
  const street=document.querySelector('.street-view'),streetBox=boxes.get(street);
  if(streetBox&&!reduced.matches&&visible.has(street.closest('.story'))){
    const p=progressAcrossViewport(streetBox,scroll,height,.55,.08);
    feed.dispatchEvent(new CustomEvent('street-scroll',{detail:{value:100-Math.round(p*100)}}));
  }
  const rainBox=boxes.get(rainSequence);
  if(rainBox&&visible.has(rainSequence.closest('.story'))){
    const span=rainBox.height-rainSequence.firstElementChild.offsetHeight;
    const p=span>1?clamp((scroll-rainBox.top)/span):sceneProgress(rainSequence,scroll,height);
    renderRain(reduced.matches?1:p);
  }
  const sequence=document.querySelector('.night-sequence'),box=boxes.get(sequence);
  if(box&&visible.has(sequence.closest('.story'))){
    const span=box.height-sequence.firstElementChild.offsetHeight;
    const p=span>1?clamp((scroll-box.top)/span):clamp((scroll-box.top+height*.65)/(box.height+height*.1));
    if(scroll!==lastNightScroll||p!==lastNightProgress){feed.dispatchEvent(new CustomEvent('night-scroll',{detail:{index:Math.min(2,Math.floor(p*3)),progress:p}}));lastNightScroll=scroll;lastNightProgress=p}
  }
}
const observer=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('motion-visible',e.isIntersecting);e.isIntersecting?visible.add(e.target):visible.delete(e.target)}request()},{root:feed,threshold:0});
feed.querySelectorAll('.story').forEach(el=>observer.observe(el));
feed.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',measure);
document.addEventListener('visibilitychange',()=>{if(document.hidden){device.classList.add('motion-paused');cancelAnimationFrame(frame);frame=0}else request()});
reduced.addEventListener('change',measure);
const overlayObserver=new MutationObserver(request);
overlayObserver.observe(document.querySelector('#onboarding'),{attributes:true,attributeFilter:['hidden']});overlayObserver.observe(document.querySelector('#shade'),{attributes:true,attributeFilter:['class']});
observeLayoutChanges([feed,...feed.querySelectorAll('.story')],measure);
document.fonts.ready.then(measure);measure();
