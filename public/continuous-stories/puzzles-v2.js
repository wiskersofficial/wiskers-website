import {WORD_LINKS,WORD_ORDER,judgeWords,RIVER_PATH,RIVER_START,RIVER_BASE,RIVER_MARKERS,riverPorts,riverAligned,riverWalk} from './puzzle-rules-v2.js?v=d5e9377bcce4';
const $=s=>document.querySelector(s),reduce=matchMedia('(prefers-reduced-motion: reduce)');
let saved={};try{saved=JSON.parse(localStorage.getItem('story-puzzles-v2'))||{}}catch{}
let solved=[...new Set(Array.isArray(saved.word?.solved)?saved.word.solved:[])].filter(id=>WORD_LINKS.some(l=>l.id===id));
const unavailable=()=>WORD_LINKS.filter(l=>solved.includes(l.id)).flatMap(l=>l.words);
let selected=[...new Set(Array.isArray(saved.word?.selected)?saved.word.selected:[])].filter(w=>WORD_ORDER.includes(w)&&!unavailable().includes(w)).slice(0,4);
let order=Array.isArray(saved.word?.order)&&saved.word.order.length===16&&new Set(saved.word.order).size===16&&saved.word.order.every(w=>WORD_ORDER.includes(w))?saved.word.order:[...WORD_ORDER];
let hinted=[...new Set(Array.isArray(saved.word?.hinted)?saved.word.hinted:[])].filter(id=>WORD_LINKS.some(l=>l.id===id));
let turns=Array.isArray(saved.river)&&saved.river.length===25&&saved.river.every(n=>Number.isInteger(n)&&n>=0&&n<4)?saved.river:[...RIVER_START];
function save(){try{localStorage.setItem('story-puzzles-v2',JSON.stringify({word:{solved,selected,order,hinted},river:turns}))}catch{}}
function buzz(){try{navigator.vibrate?.(8)}catch{}}
const wordButtons=new Map(),wordGrid=$('#wordGrid');let lastBundles='';
for(const word of WORD_ORDER){const b=document.createElement('button');b.type='button';b.textContent=word;b.dataset.word=word;b.addEventListener('click',()=>{if(selected.includes(word))selected=selected.filter(w=>w!==word);else if(selected.length<4)selected.push(word);else{$('#wordStatus').textContent='Four selected. Swap a word or bundle them.';return;}buzz();renderWords(`${selected.length} of 4 selected`);});wordButtons.set(word,b);}
function layoutWords(){for(const w of order)wordGrid.append(wordButtons.get(w));}
function renderWords(message){
 const used=unavailable(),won=solved.length===4;$('#afterword').classList.toggle('puzzle-solved',won);
 wordButtons.forEach((b,w)=>{b.hidden=used.includes(w);b.classList.toggle('selected',selected.includes(w));b.setAttribute('aria-pressed',String(selected.includes(w)));});
 if(lastBundles!==solved.join(',')){
  const list=$('#wordBundles');list.replaceChildren();solved.forEach(id=>{const link=WORD_LINKS.find(l=>l.id===id),el=document.createElement('div');el.className='word-bundle bundle-'+id;const label=document.createElement('strong'),words=document.createElement('span');label.textContent=link.side==='before'?link.partner+' ___':'___ '+link.partner;words.textContent=link.words.join(' · ');el.append(label,words);el.dataset.context=label.textContent+': '+words.textContent;list.append(el)});lastBundles=solved.join(',');
 }
 $('#wordStatus').textContent=message||(won?'All four links, neatly tied.':`${solved.length} of 4 links found`);$('#wordSubmit').disabled=selected.length!==4||won;$('#wordShuffle').disabled=won;$('#wordHint').disabled=won;save();
}
$('#wordSubmit').addEventListener('click',()=>{const result=judgeWords(selected,solved);if(result.kind==='correct'){solved.push(result.id);selected=[];buzz();renderWords();}else renderWords({stranded:'That link works, but it leaves no complete grouping for the other words.',near:'One word is out of place.',wrong:'Try a different link.',incomplete:'Select four words first.'}[result.kind]);});
$('#wordShuffle').addEventListener('click',()=>{const rest=order.filter(w=>!unavailable().includes(w));for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}order=[...unavailable(),...rest];layoutWords();renderWords(selected.length?`${selected.length} of 4 selected`:undefined);});
$('#wordHint').addEventListener('click',()=>{const link=WORD_LINKS.find(l=>!solved.includes(l.id)&&!hinted.includes(l.id))||WORD_LINKS.find(l=>!solved.includes(l.id));if(!link)return;hinted.push(link.id);renderWords(link.side==='before'?`One group can follow ${link.partner}.`:`One group can come before ${link.partner}.`);});
$('#wordReset').addEventListener('click',()=>{solved=[];selected=[];hinted=[];order=[...WORD_ORDER];lastBundles='reset';layoutWords();renderWords();});layoutWords();renderWords();
const grid=$('#riverGrid'),tiles=[],angles=turns.map(n=>n*90),dirs=['north','east','south','west'];let hintPiece=-1;
for(let i=0;i<25;i++){
 const b=document.createElement('button');b.type='button';b.className='river-tile';b.style.setProperty('--paper',['#e9dcc4','#d9e7cb','#e9d1bf','#d3e6df','#e4dbba','#d6d9ec','#dbe4bb','#efd8b8','#d8e6de'][i%9]);b.style.setProperty('--wonk',[-.7,.6,-.4,.5,-.6][i%5]+'deg');
 const marker=RIVER_MARKERS.indexOf(i);b.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true"><g class="river-channel"><path class="river-bank"/><path class="river-ink"/><path class="river-water"/><path class="river-glint"/></g></svg>${marker<0?'':`<span class="river-marker" aria-hidden="true">${marker+1}</span>`}`;
 b.addEventListener('click',()=>{turns[i]=(turns[i]+1)%4;angles[i]+=90;hintPiece=-1;buzz();renderRiver()});grid.append(b);tiles.push(b);
}
function channelPath(ports){const pos=[[50,-4],[104,50],[50,104],[-4,50]],a=pos[ports[0]],b=pos[ports[1]];return ports[0]%2===ports[1]%2?`M${a}L${b}`:`M${a}Q50 50 ${b}`}
function renderRiver(message){
 const result=riverWalk(turns);$('#riverfold').classList.toggle('puzzle-solved',result.won);
 tiles.forEach((b,i)=>{const ports=riverPorts(i,turns[i]),marker=RIVER_MARKERS.indexOf(i);b.setAttribute('aria-label',`Row ${Math.floor(i/5)+1}, column ${i%5+1}${marker<0?'':`, marker ${marker+1}`}. Opens ${ports.map(n=>dirs[n]).join(' and ')}. Turn clockwise.`);b.classList.toggle('flowing',result.path.includes(i));b.classList.toggle('hint-piece',hintPiece===i);b.querySelector('svg').style.transform=`rotate(${angles[i]}deg)`;b.querySelectorAll('path').forEach(path=>path.setAttribute('d',channelPath(RIVER_BASE[i])));b.classList.toggle('marker-passed',marker>=0&&result.passed.includes(marker+1)&&result.orderOK);});
 $('#riverStatus').textContent=message||(result.won?'Every bend. All three markers. One river.':!result.orderOK?'Visit the markers in order: 1 → 2 → 3.':`${result.path.length} of 25 pieces connected · ${result.passed.length} of 3 markers`);$('#riverHint').disabled=result.won;save();
}
$('#riverHint').addEventListener('click',()=>{hintPiece=RIVER_PATH.find(i=>!riverAligned(i,turns[i]))??-1;if(hintPiece>=0)renderRiver(`Try the outlined piece: row ${Math.floor(hintPiece/5)+1}, column ${hintPiece%5+1}.`);});
$('#riverReset').addEventListener('click',()=>{turns=[...RIVER_START];turns.forEach((n,i)=>angles[i]=n*90);hintPiece=-1;renderRiver()});renderRiver();
// Scroll atmosphere belongs to the margins; every puzzle control keeps native vertical panning.
const feed=$('#feed'),sections=[$('#afterword'),$('#riverfold')];let queued=false;
function paint(){queued=false;const r=feed.getBoundingClientRect();sections.forEach(s=>{const y=s.getBoundingClientRect().top-r.top;if(y<r.height&&y>-s.offsetHeight)s.style.setProperty('--puzzle-drift',reduce.matches?'0px':`${Math.max(-26,Math.min(26,y*.055))}px`)})}
feed.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});reduce.addEventListener('change',paint);paint();
