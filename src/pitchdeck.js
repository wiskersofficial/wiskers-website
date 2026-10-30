import { mountActTwo } from './pitchdeck-act-two.js';
import { mountExperienceStudio } from './experience-studio.js';
import { mountOpeningReveal } from './pitchdeck-opening.js';
import { mountLeadMagnet } from './pitchdeck-leadmagnet.js';
import { mount as mountGlass } from './vendor/molten-glass/index.js';
import { mountDeckWaveGrid } from './deck-wave-grid.js';


const slides=[...document.querySelectorAll('.deck-slide')], links=[...document.querySelectorAll('.deck-nav a')];
const counter=document.getElementById('current-slide'), progress=document.getElementById('progress-bar');
const motion=document.querySelector('.deck-motion'), replay=document.querySelector('.deck-replay');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches, active=slides.find(s=>`#${s.id}`===location.hash)||slides[0];
const still=()=>paused||reduce.matches;
const wave=mountDeckWaveGrid(document.querySelector('.wave-stage'));
const solution=mountExperienceStudio(document.getElementById('warehouse-demo'));
const problem=mountLeadMagnet(document.getElementById('slide-2'));
const journey=mountActTwo();
const raise=mountOpeningReveal(document.getElementById('slide-10'),{selector:'[data-raise-reveal]',interval:1100});
function setActive(slide){
 const changed=active!==slide;active=slide;journey.activate(slide,still());counter.textContent=slide.dataset.slide;
 links.forEach(a=>a.hash===`#${slide.id}`?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));
 const light=slide.matches('.act-commercial,.act-audience,.act-sales,.act-bagel,.act-milestones');
 document.body.classList.toggle('scene-light',light);
 document.querySelector('.deck-brand img').src=light?'/pitchdeck-assets/wiskers-v2-wordmark-dark.svg':'/pitchdeck-assets/wiskers-v2-wordmark-light.svg';
 if(changed||!document.body.dataset.sceneStarted){
  document.body.dataset.sceneStarted='true';solution.activate(slide.id);
  for(const [id,scene] of [['slide-1',wave],['slide-2',problem],['slide-10',raise]])slide.id===id?scene.play():scene.pause();
 }
}

// A viewport-sized source gives both glass tiles the precise photo underneath them.
const team=document.querySelector('.pitch-team'),photo=new Image();photo.src='/pitchdeck-assets/founders-josh-imran.jpg';
let lenses=[],glassMounted=false;
const background=document.createElement('canvas');
function prepareGlass(){if(!photo.complete||!photo.naturalWidth)return;const w=innerWidth,h=innerHeight;background.width=w;background.height=h;const ctx=background.getContext('2d');ctx.fillStyle='#091540';ctx.fillRect(0,0,w,h);let scale,dx,dy;if(w<=720){scale=w/photo.naturalWidth;dx=0;dy=h*.22;}else{scale=h*.92/photo.naturalHeight;dx=(w-photo.naturalWidth*scale)/2;dy=0;}ctx.drawImage(photo,dx,dy,photo.naturalWidth*scale,photo.naturalHeight*scale);ctx.fillStyle='#09154025';ctx.fillRect(0,0,w,h);for(const lens of lenses)lens.setBackground(background);}
function mountTeam(){if(glassMounted||matchMedia('print').matches)return;glassMounted=true;const mount=()=>{prepareGlass();team.querySelectorAll('.founder-glass').forEach(host=>{try{lenses.push(mountGlass(host,{background,twist:.18,refraction:.35,edgeExponent:5,specular:.52,chromaticAberration:.2,tint:'#091540',tintStrength:.31,canvasBlur:1.5,dpr:1.5}));}catch(e){console.warn('Founder glass fallback',e);}});};if(photo.complete&&photo.naturalWidth)mount();else photo.addEventListener('load',mount,{once:true});}
let libraryLenses=[],libraryMounted=false;
function mountLibrary(){if(libraryMounted||matchMedia('print').matches)return;libraryMounted=true;const backdrop=document.createElement('canvas');backdrop.width=backdrop.height=512;const c=backdrop.getContext('2d');const g=c.createLinearGradient(0,0,512,512);g.addColorStop(0,'#203f5f');g.addColorStop(.42,'#61948f');g.addColorStop(.7,'#263550');g.addColorStop(1,'#bd858e');c.fillStyle=g;c.fillRect(0,0,512,512);const backdropImage=backdrop.toDataURL();document.querySelectorAll('.library-glass').forEach(el=>{try{libraryLenses.push(mountGlass(el,{background:backdropImage,twist:.3,refraction:.38,specular:.55,chromaticAberration:.24,tint:'#091540',tintStrength:.35,canvasBlur:2,canvasOpacity:.38,dpr:1}));}catch(e){console.warn('Library glass fallback',e);}});libraryLenses.forEach(l=>l.pause());}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=entry.target;s.classList.toggle('is-visible',entry.isIntersecting);if(entry.isIntersecting&&entry.intersectionRatio>=.38){setActive(s);if(s.classList.contains('pitch-team'))mountTeam();if(s.classList.contains('pitch-library'))mountLibrary();}}},{threshold:[0,.2,.38,.65],rootMargin:'-7% 0px -12% 0px'});
slides.forEach(s=>observer.observe(s));
function updateMotion(){document.body.classList.toggle('motion-paused',paused);if(still()){slides.forEach(s=>s.style.setProperty('--scene-exit',0));wave.setProgress(0);}motion.disabled=reduce.matches;motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume':'Pause';wave.setReduced(still());problem.setReduced(still());raise.setReduced(still());solution.setReduced(still());journey.setReduced(still());lenses.forEach(l=>still()?l.pause():l.resume());libraryLenses.forEach(l=>l.pause());}
motion.addEventListener('click',()=>{paused=!paused;updateMotion();});reduce.addEventListener('change',()=>{paused=reduce.matches;updateMotion();});
replay.addEventListener('click',()=>{journey.replay();if(active.id==='slide-3')solution.replay();else if(active.id==='slide-2')problem.replay();else if(active.id==='slide-10')raise.replay();else if(active.id==='slide-4'){solution.replayEngine();}else{active.classList.remove('is-visible');void active.offsetWidth;active.classList.add('is-visible');}});
addEventListener('keydown',e=>{if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement?.tagName)||document.activeElement?.classList.contains('wave-stage'))return;let direction;if(['ArrowDown','ArrowRight','PageDown'].includes(e.key))direction=1;if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key))direction=-1;if(direction){e.preventDefault();slides[Math.max(0,Math.min(slides.length-1,slides.indexOf(active)+direction))].scrollIntoView({behavior:still()?'auto':'smooth'});}});
let queued=false;function updateProgress(){journey.update();solution.update();if(!still()){const h=innerHeight;for(const slide of slides.slice(0,5)){const r=slide.getBoundingClientRect();const travel=Math.max(0,slide.offsetHeight-h);const exit=Math.min(1,Math.max(0,(-r.top-travel)/h));slide.style.setProperty('--scene-exit',exit.toFixed(3));}}const range=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=`${range>0?Math.max(0,Math.min(100,scrollY/range*100)):0}%`;queued=false;}
addEventListener('scroll',()=>{if(!queued){requestAnimationFrame(updateProgress);queued=true;}},{passive:true});
addEventListener('resize',()=>{updateProgress();if(glassMounted)prepareGlass();},{passive:true});
addEventListener('hashchange',()=>{const s=slides.find(s=>`#${s.id}`===location.hash);if(s)setActive(s);});
addEventListener('beforeprint',()=>{journey.beforePrint();wave.setProgress(0);wave.setReduced(true);document.querySelector('.wave-print').src=document.querySelector('.wave-grid').toDataURL();solution.beforePrint();problem.setReduced(true);raise.setReduced(true);});
addEventListener('afterprint',()=>{journey.afterPrint();solution.afterPrint();updateMotion();updateProgress();if(active.id==='slide-1')wave.play();});
setActive(active);updateMotion();updateProgress();

history.scrollRestoration='manual';
const linkedSlide=slides.find(slide=>`#${slide.id}`===location.hash);
if(linkedSlide){
  const align=()=>{if(location.hash!==`#${linkedSlide.id}`)return;const root=document.documentElement;const previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';scrollTo({top:linkedSlide.offsetTop,left:0,behavior:'instant'});root.style.scrollBehavior=previous;setActive(linkedSlide);};
  if(document.readyState==='complete')requestAnimationFrame(align);else addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(align)),{once:true});
  document.fonts.ready.then(()=>requestAnimationFrame(align));
}
