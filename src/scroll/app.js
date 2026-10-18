import { TOPICS, MEDIA, SNAPSHOT, plainTitle, icon } from './data.js';
import { World } from './world.js';
import { Gestures } from './gestures.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const catalog=new Map(TOPICS.map(t=>[t.id,t]));
const blank=()=>({likes:[],hidden:[],weights:{},comments:{},chats:{},reduced:null,seen:false});
let state=blank();
try{Object.assign(state,JSON.parse(localStorage.getItem('scrollo-flow-v2')||'{}'));}catch{}
for(const key of ['likes','hidden'])if(!Array.isArray(state[key]))state[key]=[];
for(const key of ['weights','comments','chats'])if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
const persist=()=>{try{localStorage.setItem('scrollo-flow-v2',JSON.stringify(state));}catch{}};
const media=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>state.reduced??media.matches;
const feed=$('#feed');
let sequence=[],serial=0,activeIndex=0,layout=[],panel=null,context=null,friend=null,lastFocus=null,closingTimer,statusTimer;
let companion=null,cycle=0,lastY=scrollY,velocity=0;
const world=new World($('#world'),{reduced:reduced()});
document.body.classList.toggle('reduced-motion',reduced());
media.addEventListener('change',()=>{world.reduced=reduced();document.body.classList.toggle('reduced-motion',reduced());});
const current=()=>sequence[activeIndex];
const gesture=new Gestures(feed,{onCommit:action=>act(action),onBend:(x,y)=>world.drag={x,y},reduced});
for(const[action,name]of Object.entries({less:'less',friend:'friend',like:'heart',comments:'chat'}))$(`.bezel[data-action="${action}"] .bezel-icon`).innerHTML=icon(name);
$('#close-panel').innerHTML=icon('close');

function status(text){clearTimeout(statusTimer);$('#flow-status').textContent=text;$('#mix-label').textContent=text;statusTimer=setTimeout(()=>{$('#flow-status').textContent='scroll. wander. repeat.';$('#mix-label').textContent='a little less predictable';},2800);}
function photoHTML(t){if(!t.media)return '';const m=MEDIA[t.media];return `<figure class="photo photo-${t.media}"><img src="${m.src}" alt="${esc(m.alt)}" loading="${t.id==='fully-booked'?'eager':'lazy'}" decoding="async" draggable="false">${t.format==='music'?'<span class="record-label">NPR MUSIC<br>TINY DESK</span>':''}</figure>`;}
function momentHTML(t,instance,index){const heading=index===0?'h1':'h2';return `<section class="moment format-${t.format}" id="${instance}" data-instance="${instance}" data-topic="${t.id}" ${t.kind?`data-kind="${t.kind}"`:''} data-accent="${t.accent}" style="--topic-accent:${t.accent};--length:${t.length};--side:${index%2?1:-1}" aria-label="${esc(plainTitle(t))}">
${photoHTML(t)}${t.kind?'<div class="art-anchor" aria-hidden="true"></div>':''}
<div class="moment-copy"><span class="origin">${esc(t.category)}</span><${heading} class="headline">${t.title.map((line,i)=>`<span class="type-line" style="--line:${i}">${esc(line)}</span>`).join('')}</${heading}>${t.punch?`<p class="punch">${esc(t.punch)}</p>`:''}</div>
${t.replies?`<div class="thread-exchange">${t.replies.map(([text,who],i)=>`<blockquote class="thread-reply reply-${i}" style="--reply:${i}"><p>${esc(text)}</p><cite>${esc(who)}</cite></blockquote>`).join('')}</div>`:''}
${t.words?`<div class="colour-words">${t.words.map(([word,color],i)=>`<span style="--word-color:${color};--word:${i}">${word}</span>`).join('')}</div><p class="scroll-reveal">${esc(t.reveal)}</p>`:''}
${t.floating?`<div class="floating-topics" aria-hidden="true">${t.floating.map((text,i)=>`<span style="--float:${i}">${esc(text)}</span>`).join('')}</div>`:''}
<div class="moment-caption"><p>${esc(t.caption)}</p><button class="source-button" data-source="${t.id}" aria-label="Source and context: ${esc(plainTitle(t))}">source ${icon('arrow')}</button></div></section>`;}
function mount(topics,replaceAfter=null){
 if(replaceAfter!==null){sequence.slice(replaceAfter+1).forEach(n=>document.getElementById(n.instance)?.remove());sequence=sequence.slice(0,replaceAfter+1);}
 const start=sequence.length;
 for(const[tIndex,t]of topics.entries()){const instance=`${t.id}-${++serial}`;sequence.push({topic:t,instance});feed.insertAdjacentHTML('beforeend',momentHTML(t,instance,start+tIndex));}
 world.setEntries($$('.moment[data-kind]'));measure();update(true);
}
function measure(){layout=$$('.moment').map(el=>({el,top:el.offsetTop,height:el.offsetHeight}));world.measure();}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{world.resize();measure();},100);});
document.fonts.ready.then(()=>{world.resize();measure();});
feed.addEventListener('load',measure,true);
let previous=-1;
function update(force=false){
 const y=scrollY+innerHeight*.42;let next=layout.findIndex(l=>y>=l.top&&y<l.top+l.height);if(next<0)next=Math.max(0,layout.length-1);activeIndex=next;
 if(force||next!==previous){previous=next;const n=current();if(n){document.documentElement.style.setProperty('--accent',n.topic.accent);document.documentElement.dataset.activeTopic=n.topic.id;$('[data-action="like"] button').setAttribute('aria-pressed',String(state.likes.includes(n.topic.id)));}}
 if(sequence.length-activeIndex<5){cycle++;mount(candidates().slice(0,8));}
}
function animate(now){
 update();const sy=scrollY;velocity=velocity*.85+(sy-lastY)*.15;lastY=sy;
 for(let i=Math.max(0,activeIndex-2);i<Math.min(layout.length,activeIndex+4);i++){
  const l=layout[i],top=l.top-sy;if(top>innerHeight*1.4||top+l.height< -innerHeight*.4)continue;
  const phase=reduced()?0:clamp((innerHeight*.48-top-l.height*.45)/innerHeight,-1.8,1.8);
  const p=clamp((innerHeight*.85-top)/(l.height+innerHeight*.55),0,1);
  l.el.style.setProperty('--phase',phase.toFixed(4));l.el.style.setProperty('--reveal',p.toFixed(4));
  const entry=world.entries.find(e=>e.el===l.el);if(entry)entry.value=1+p*6;
 }
 if(companion){const el=$('#companion');const l=layout[activeIndex];if(el&&l){el.style.transform=`translate3d(${innerWidth*.69+Math.sin(now*.0004)*35}px,${clamp(l.top-sy+l.height*.5,180,innerHeight-100)+Math.cos(now*.0005)*28}px,0)`;el.style.opacity=panel?'0':'1';}}
}
world.onFrame=animate;
if(!world.renderer){const loop=now=>{animate(now);requestAnimationFrame(loop);};requestAnimationFrame(loop);}
function candidates(){
 const keep=sequence.slice(0,activeIndex+3).map(n=>n.topic.id),recent=keep.slice(-7);
 const sorted=TOPICS.filter(t=>!recent.includes(t.id)&&!state.hidden.includes(t.id)).map((t,i)=>({t,score:(Number(state.weights[t.interest])||0)*8+(i*13+cycle*7)%17-(keep.includes(t.id)?9:0)})).sort((a,b)=>b.score-a.score);
 const list=[];let last=current()?.topic.interest;
 while(sorted.length){let at=sorted.findIndex(o=>o.t.interest!==last);if(at<0)at=0;const {t}=sorted.splice(at,1)[0];list.push(t);last=t.interest;}
 return list.length?list:TOPICS.filter(t=>!recent.includes(t.id));
}
function reshape(){cycle++;const preserve=Math.min(activeIndex+2,sequence.length-1);mount(candidates(),preserve);}
function act(action){
 const n=current();if(!n)return;const t=n.topic;
 if(action==='like'){
  if(!state.likes.includes(t.id))state.likes.push(t.id);
  state.weights[t.interest]=clamp((Number(state.weights[t.interest])||0)+1,-4,6);persist();reshape();
  status(`more ${t.interest==='fun'?'good nonsense':t.interest} in the mix`);
 }else if(action==='less'){
  if(!state.hidden.includes(t.id))state.hidden.push(t.id);state.weights[t.interest]=clamp((Number(state.weights[t.interest])||0)-1.25,-4,6);persist();reshape();
  const target=layout[Math.min(activeIndex+1,layout.length-1)];if(target)window.scrollTo({top:Math.max(0,target.top-innerHeight*.13),behavior:reduced()?'instant':'smooth'});status('a different direction');
 }else if(action==='friend')open('friends',t);else if(action==='comments')open('comments',t);
}

// Social actions always carry a stable topic ID. Demo conversations stay local.
const contextHTML=t=>`<div class="context"><span style="color:${t.accent}">${esc(t.category)}</span><h3>${esc(plainTitle(t))}</h3></div>`;
function commentsHTML(t){
 const all=[...t.comments.map(([name,text])=>({name,text})),...(state.comments[t.id]||[])];
 return `${contextHTML(t)}<div class="comments">${all.map((c,i)=>`<article class="comment"><span class="avatar avatar-${i%3}">${esc(c.name[0])}</span><div><strong>${esc(c.name)}</strong><p>${esc(c.text)}</p><button data-reply="${esc(c.name)}">reply</button></div></article>`).join('')}</div><form id="comment-form" class="composer"><label for="comment-input">Add a thought</label><textarea id="comment-input" placeholder="Your take?" maxlength="1000" required></textarea><button class="send" type="submit" aria-label="Add thought">${icon('arrow')}</button></form><p class="footnote">Demo conversation. Replies stay on this device.</p>`;
}
function friendsHTML(t){return `${contextHTML(t)}<p class="panel-intro">Who would get this?</p>${[['Maya','Always up for a rabbit hole'],['Alex','Will have a take'],['Noor','Here for the good nonsense']].map(([name,bio],i)=>`<button class="friend" data-friend="${name}"><span class="avatar avatar-${i}">${name[0]}</span><span><strong>${name}</strong><small>${bio}</small></span>${icon('arrow')}</button>`).join('')}<p class="footnote">Demo friends. Nothing is sent to a real person.</p>`;}
const chatKey=()=>`${context.id}:${friend}`;
function messageHTML(m,name){return `<div class="message ${m.you?'you':''}"><small>${m.you?'You':name}</small>${esc(m.text)}</div>`;}
function chatHTML(t){return `<button class="back" id="back-friends">← friends</button>${contextHTML(t)}<button class="wander" id="wander-together">${icon('friend')} ${companion===friend?'End shared wander':'Wander together'}</button><div id="messages" class="messages"><div class="message"><small>${friend} · demo</small>${friend==='Maya'?'Okay, I love this.':friend==='Alex'?'I have questions.':'This is exactly my kind of detour.'}</div>${(state.chats[chatKey()]||[]).map(m=>messageHTML(m,friend)).join('')}</div><form id="chat-form" class="composer"><label for="chat-input">Message ${friend}</label><textarea id="chat-input" placeholder="This made me think of you…" maxlength="1000" required></textarea><button class="send" type="submit" aria-label="Send demo message">${icon('arrow')}</button></form><p class="footnote">Simulated replies. Nothing leaves this browser.</p>`;}
function sourceHTML(t){const m=t.media?MEDIA[t.media]:null;return `${contextHTML(t)}<p class="source-explanation">${esc(t.source.note)}</p>${t.source.url?`<a class="original-link" href="${t.source.url}" target="_blank" rel="noopener noreferrer"><span>${esc(t.source.name)}<small>${esc(t.source.date)}</small></span>${icon('arrow')}</a>`:'<p class="footnote">Original Scrollo copy and artwork.</p>'}${m?`<div class="photo-credit"><span>Image</span><a href="${m.url}" target="_blank" rel="noopener noreferrer">${esc(m.credit)}</a><p>${esc(m.note)}</p></div>`:''}<button class="share" id="share-topic">${icon('link')} Copy this rabbit hole</button><p class="footnote">News checked ${SNAPSHOT}. This demo uses a prepared mix; it is not a live news service.</p>`;}
function collectionHTML(){const liked=state.likes.map(id=>catalog.get(id)).filter(Boolean);return `<p class="panel-intro">The things that made you stop.</p>${liked.length?liked.map(t=>`<button class="saved" data-goto="${t.id}"><span style="color:${t.accent}">✦</span><span>${esc(plainTitle(t))}</span>${icon('arrow')}</button>`).join(''):'<p class="empty">A bottom-left swipe saves an idea here.</p>'}<hr><button class="setting" data-open="guide"><span>How to steer</span>${icon('arrow')}</button><div class="setting"><label for="motion-setting">Reduce motion</label><input id="motion-setting" type="checkbox" ${reduced()?'checked':''}></div><button class="reset" id="reset-flow">Start a fresh flow</button><div class="legal"><a href="/">Wiskers</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>`;}
function guideHTML(){return `<p class="panel-intro">Scroll through. Swipe into a corner.</p><div class="guide-grid"><span>↖ Less of this</span><span>Bring a friend ↗</span><span>↙ More like this</span><span>Comments ↘</span></div><p>Start anywhere on the feed. The bezel fills as you move diagonally. Release when it is fully lit. A short swipe cancels.</p><p>Phone: drag vertically to scroll and flick to coast. Desktop: wheel normally, drag diagonally, or use a diagonal trackpad gesture.</p><p class="footnote">Physical haptics need browser and device support. They may be unavailable in Safari or desktop browsers. The colour confirmation always works.</p><p class="footnote">Keyboard: J / K to scroll, L to like, C for comments, F for a friend, Esc to close. Corner buttons offer the same actions.</p>`;}
function renderPanel(){
 const titles={comments:['A shared rabbit hole','The conversation'],friends:['Better with company','Bring someone along'],chat:['A shared rabbit hole',friend],source:['A little context','The source'],collection:['Your corner','Things that stayed'],guide:['Scrollo','Follow a feeling']};
 const [kicker,title]=titles[panel];$('#panel-kicker').textContent=kicker;$('#panel-title').textContent=title;
 $('#panel-body').innerHTML=({comments:()=>commentsHTML(context),friends:()=>friendsHTML(context),chat:()=>chatHTML(context),source:()=>sourceHTML(context),collection:collectionHTML,guide:guideHTML})[panel]();$('#panel-body').scrollTop=0;$('#drawer').focus({preventScroll:true});
}
function open(kind,topic){
 clearTimeout(closingTimer);gesture.stopMomentum();gesture.cancel();
 if(!panel)lastFocus=document.activeElement;context=topic||(panel?context:current()?.topic)||TOPICS[0];panel=kind;
 const overlay=$('#overlay');overlay.hidden=false;document.body.style.overflow='hidden';
 for(const el of document.body.children)if(el!==overlay&&el.id!=='toast'&&!el.classList.contains('bezel')&&el.tagName!=='SCRIPT')el.inert=true;
 $$('.bezel button').forEach(el=>el.inert=true);renderPanel();requestAnimationFrame(()=>overlay.classList.add('open'));
}
function close(){if(!panel)return;panel=null;$('#overlay').classList.remove('open');document.body.style.overflow='';for(const el of document.body.children)el.inert=false;$$('.bezel button').forEach(el=>el.inert=false);lastFocus?.focus({preventScroll:true});closingTimer=setTimeout(()=>$('#overlay').hidden=true,reduced()?0:320);measure();}
$('#close-panel').onclick=close;$('.scrim').onclick=close;
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)open(b.dataset.open);const s=e.target.closest('[data-source]');if(s)open('source',catalog.get(s.dataset.source));});
$('#panel-body').addEventListener('click',e=>{
 const f=e.target.closest('[data-friend]');if(f){friend=f.dataset.friend;panel='chat';renderPanel();}
 if(e.target.closest('#back-friends')){panel='friends';renderPanel();}
 const reply=e.target.closest('[data-reply]');if(reply){$('#comment-input').value=`@${reply.dataset.reply} `;$('#comment-input').focus();}
 const saved=e.target.closest('[data-goto]');if(saved){const id=saved.dataset.goto;let i=sequence.findIndex(n=>n.topic.id===id);if(i<0){mount([catalog.get(id)]);i=sequence.length-1;}close();window.scrollTo({top:layout[i].top-innerHeight*.1,behavior:reduced()?'instant':'smooth'});}
 if(e.target.closest('#share-topic'))share();
 if(e.target.closest('#wander-together')){
  if(companion===friend){companion=null;$('#companion')?.remove();status('back to your own flow');renderPanel();}
  else{companion=friend;$('#companion')?.remove();const cursor=document.createElement('div');cursor.id='companion';cursor.setAttribute('aria-hidden','true');cursor.innerHTML=`<span>➤</span><small>${friend} · demo</small>`;document.body.append(cursor);close();status(`wandering with ${friend.toLowerCase()}`);}
 }
 if(e.target.closest('#reset-flow')){
  state=blank();state.seen=true;persist();companion=null;$('#companion')?.remove();sequence=[];activeIndex=0;previous=-1;feed.innerHTML='';mount(TOPICS);close();world.reduced=reduced();document.body.classList.toggle('reduced-motion',reduced());window.scrollTo({top:0,behavior:'instant'});status('fresh eyes. fresh flow.');
 }
});
$('#panel-body').addEventListener('change',e=>{if(e.target.id==='motion-setting'){state.reduced=e.target.checked;persist();world.reduced=reduced();document.body.classList.toggle('reduced-motion',reduced());}});
$('#panel-body').addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.id==='comment-form'){
  const text=$('#comment-input').value.trim();if(!text)return;state.comments[context.id]||=[];state.comments[context.id].push({name:'You',text});persist();renderPanel();$('#comment-input').focus({preventScroll:true});$('.comments').lastElementChild?.scrollIntoView({block:'nearest'});
 }
 if(e.target.id==='chat-form'){
  const text=$('#chat-input').value.trim();if(!text)return;const key=chatKey(),name=friend,store=state;state.chats[key]||=[];state.chats[key].push({you:true,text});persist();renderPanel();$('#chat-input').focus({preventScroll:true});$('#messages').lastElementChild?.scrollIntoView({block:'nearest'});
  setTimeout(()=>{if(state!==store)return;const reply={you:false,text:name==='Alex'?'Okay, that is a good take. Now I want the next rabbit hole.':name==='Maya'?'You know me too well. Keep sending these.':'Exactly this. More of this energy, please.'};state.chats[key].push(reply);persist();if(panel==='chat'&&chatKey()===key){$('#messages').insertAdjacentHTML('beforeend',messageHTML(reply,name));$('#messages').lastElementChild?.scrollIntoView({block:'nearest'});}},1000);
 }
});
async function share(){const url=new URL(location.href);url.hash=`topic=${context.id}`;try{await navigator.clipboard.writeText(url.href);status('rabbit hole copied');$('#share-topic').innerHTML=`${icon('check')} Link copied`;}catch{$('#share-topic').textContent=url.href;}}

// Sideways dismissal complements native vertical scrolling inside a sheet.
let dismiss=null;
const drawer=$('#drawer');
function clearDismiss(){dismiss=null;drawer.classList.remove('sheet-dragging');drawer.style.setProperty('--sheet-drag','0px');}
drawer.addEventListener('pointerdown',e=>{if(!e.target.closest('input,textarea,button,a'))dismiss={id:e.pointerId,x:e.clientX,y:e.clientY,claimed:false};});
drawer.addEventListener('pointermove',e=>{if(!dismiss||dismiss.id!==e.pointerId)return;const dx=e.clientX-dismiss.x,dy=e.clientY-dismiss.y;if(dx>12&&dx>Math.abs(dy)*1.2){dismiss.claimed=true;drawer.setPointerCapture(e.pointerId);drawer.classList.add('sheet-dragging');drawer.style.setProperty('--sheet-drag',`${Math.min(dx*.5,180)}px`);e.preventDefault();}});
drawer.addEventListener('pointerup',e=>{if(dismiss?.claimed&&e.clientX-dismiss.x>85)close();clearDismiss();});
drawer.addEventListener('pointercancel',clearDismiss);
addEventListener('keydown',e=>{
 if(e.key==='Escape'){close();gesture.cancel();return;}
 if(panel){if(e.key==='Tab'){const list=$$('button:not(:disabled),a[href],input,textarea',$('#drawer')).filter(el=>el.getClientRects().length);const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('#drawer'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;}
 if(e.target.closest('input,textarea,[contenteditable]'))return;
 const key=e.key.toLowerCase();if(['j','k','l','c','f','?'].includes(key))e.preventDefault();
 if(key==='j'||key==='k')window.scrollBy({top:innerHeight*.56*(key==='j'?1:-1),behavior:reduced()?'instant':'smooth'});
 if(key==='l')gesture.commit('like');if(key==='c')gesture.commit('comments');if(key==='f')gesture.commit('friend');if(key==='?')open('guide');
});
mount(TOPICS);
function followHash(){const id=new URLSearchParams(location.hash.slice(1)).get('topic');if(!catalog.has(id))return;let index=sequence.findIndex(n=>n.topic.id===id);if(index<0){mount([catalog.get(id)]);index=sequence.length-1;}requestAnimationFrame(()=>window.scrollTo({top:Math.max(0,layout[index].top-innerHeight*.1),behavior:'instant'}));}
followHash();addEventListener('hashchange',followHash);
if(!state.seen){$('#onboarding').classList.add('show');setTimeout(()=>$('#onboarding').classList.remove('show'),5000);state.seen=true;persist();}
