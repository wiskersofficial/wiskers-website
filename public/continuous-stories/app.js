'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const feed=$('#feed'),device=$('#device'),stories=$$('.story');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motionPreference.matches;
motionPreference.addEventListener('change',e=>{reduced=e.matches;if(reduced)stopMomentum()});
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function persist(){try{localStorage.setItem('story-study',JSON.stringify(state))}catch{}}
const state=read('story-study',{liked:[],saved:[],comments:{},vote:null,messages:[]});
let current=stories[0],panel=null,toastTimer,raf=0,lastFocus,context=null,panelStory=null,aiSession=0;
const starterComments={bank:[],afterword:[],riverfold:[],gestures:[['T','the field guide','Try a diagonal pull anywhere. Return to the story when you’re ready.',0]],higgsfield:[],boelo:[],journey:[['N','nora','That moment the water turns into paper.',78],['E','eli','I scrolled back just to take the turn again.',43]],rain:[['O','owen','I never really thought about where the water goes after the kerb.',46],['T','tess','The two paths make the difference click.',31]],night:[['J','jules','The night bus home always feels like its own little world.',92],['R','ren','Someone starting their day as yours ends. A lovely way to see it.',54]],wash:[['N','nora','I came here to scroll and stayed to watch the blue find its way.',83],['T','tess','That little place where the colours meet.',46]],studio:[['T','tess','the tiny bit of wonk is what makes it feel like someone was here.',71],['N','nora','The blue and lilac together. Such a good combination.',48],['J','jules','A small permission slip to stop straightening everything.',27]],city:[['A','alex','A long table. Somewhere you can sit without having to buy anything.',94],['M','mia','A shady bench is such a small thing until you need one.',57],['R','ren','I would love to see a street where staying is as easy as passing through.',28]],garden:[['M','mia','the best part of my walk is a very determined daisy outside the station.',128],['O','owen','The little patch outside our building is now officially a tiny wilderness.',47],['R','ren','There is something lovely about a city that leaves room for other things.',32]],morning:[['J','jules','“nothing happened. it was lovely.” putting this on my wall.',86],['M','mia','Leaving the headphones behind is such a different kind of walk.',24],['E','eli','An excellent use of a Sunday.',18]],cosmos:[],poll:[]};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function haptic(){try{if(typeof navigator.vibrate==='function')navigator.vibrate(18)}catch{}}
function updateCurrent(){$('#scrollPosition').textContent=Math.round(feed.scrollTop)+' px';let y=feed.scrollTop+feed.clientHeight*.4;current=stories.find(s=>s.offsetTop<=y&&s.offsetTop+s.offsetHeight>y)||stories.at(-1)}
feed.addEventListener('scroll',updateCurrent,{passive:true});
function stopMomentum(){cancelAnimationFrame(raf);raf=0}
function momentum(v){
  stopMomentum();
  if(reduced||!Number.isFinite(v)||Math.abs(v)<.04)return;
  // Gentle swipes still coast visibly; preserve the stronger flick's existing feel.
  v=Math.sign(v)*Math.max(.32,Math.min(6,Math.abs(v)));
  let last=performance.now();
  function tick(now){
    const dt=Math.max(0,Math.min(now-last,32));last=now;
    const old=feed.scrollTop;feed.scrollTop-=v*dt;
    v*=Math.pow(.94,dt/16.67);
    if(Math.abs(v)>.035&&feed.scrollTop!==old)raf=requestAnimationFrame(tick);
    else raf=0;
  }
  raf=requestAnimationFrame(tick);
}

function like(x,y){if(!state.liked.includes(current.id)){state.liked.push(current.id);persist()}const b=$('#likeBurst'),r=device.getBoundingClientRect();b.style.left=(x??r.left+r.width/2)-r.left+'px';b.style.top=(y??r.top+r.height*.45)-r.top+'px';b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');haptic();notify('A little love, left here.');}
function renderComments(){const story=panelStory||current;$('#commentsStory').textContent=story.dataset.title;const all=[...starterComments[story.id],...(state.comments[story.id]||[]).map(t=>['Y','you',t,0])];$('#commentList').innerHTML=all.map(([initial,name,text,likes],i)=>`<article class="comment"><span class="avatar ${i%2?'peach':'lime'}">${initial}</span><div class="comment-body"><strong>${name}</strong><p>${escapeHtml(text)}</p><div class="comment-meta"><span>${name==='you'?'Just now · on this device':'A little while ago'}</span><button class="comment-like" aria-label="Like comment by ${name}" data-count="${likes}">♡ ${likes}</button></div></div></article>`).join('')||'<p class="empty-conversation">Start the conversation.</p>';}
function action(which,storyOverride=null){if(window.bankInfoOpen)return;if(!$('#onboarding').hidden)return;stopMomentum();updateCurrent();if(storyOverride)current=storyOverride;if(['save','ai','share','comments'].includes(which)){releaseForeground(true);confirmCorner(which);}if(which==='save'){const i=state.saved.indexOf(current.id);if(i===-1)state.saved.push(current.id);else state.saved.splice(i,1);persist();haptic();saveReceipt(i===-1);return}if(which==='like'){like();return}if(storyOverride)feed.focus({preventScroll:true});openPanel(which)}
let panelClosures=0;
function renderMore(){const story=panelStory||current;$('#moreStory').textContent=story.dataset.title;$$('[data-feedback]').forEach(b=>b.setAttribute('aria-pressed',String(state.feedback?.[story.id]===b.dataset.feedback)));$('#clearFeedback').disabled=!Object.keys(state.feedback||{}).length;}
function closePanel(){if(!panel)return;if(panel==='ai'){aiSession++;endTether(null,true);$('#ai').style.transform='';}const el=$('#'+panel);el.classList.remove('open');$('#shade').classList.remove('show');const old=panel;panelClosures++;panel=null;window.dispatchEvent(new Event('feed:overlay'));setTimeout(()=>{if(panel!==old)el.hidden=true;panelClosures--;window.dispatchEvent(new Event('feed:overlay'))},650);lastFocus?.focus({preventScroll:true});}
function openPanel(which){if(panel)closePanel();lastFocus=document.activeElement;panelStory=current;panel=which;context=null;const el=$('#'+which);el.hidden=false;window.dispatchEvent(new Event('feed:overlay'));if(which==='more')renderMore();if(which==='comments'){if(panelStory.dataset.thread)panelStory=stories.find(story=>story.id===panelStory.dataset.thread)||panelStory;renderComments()}if(which==='share'){$('#shareStory').textContent=panelStory.dataset.title;$('#dmComposer').hidden=true;$$('[data-friend]').forEach(b=>b.classList.remove('active'))}if(which==='ai'){resetAI()}else $('#shade').classList.add('show');requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('open')));setTimeout(()=>{if(panel===which)el.querySelector('button')?.focus({preventScroll:true})},100)}
$$('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));$$('[data-close]').forEach(b=>b.addEventListener('click',closePanel));$('#shade').addEventListener('click',closePanel);
$('#commentForm').addEventListener('submit',e=>{e.preventDefault();const val=$('#commentInput').value.trim();if(!val)return;(state.comments[panelStory.id]??=[]).push(val);persist();renderComments();$('#commentInput').value='';$('#commentList').scrollTop=$('#commentList').scrollHeight;});
$('#commentList').addEventListener('click',e=>{const b=e.target.closest('.comment-like');if(!b)return;const liked=b.dataset.liked==='true';b.dataset.liked=String(!liked);b.textContent=`${liked?'♡':'♥'} ${Number(b.dataset.count)+(liked?0:1)}`;});
let gesture=null,lastTap=0,lastTapPos=null;
function clearGlow(){releaseForeground();$$('.corner-cue').forEach(el=>{if(!el.classList.contains('confirmed'))el.classList.remove('visible','ready')});$$('.corner-glow').forEach(e=>{e.classList.add('releasing');e.style.opacity=0;e.classList.remove('armed')})}
let tileActive=false,tileCommitted=false,tileReturnTimer=null,receiptTimer=null,cornerConfirmTimer=null;
const cornerLabels={save:'Save for later',ai:'Ask the assistant',share:'Pass it on',comments:'Join in'};
function releaseForeground(committed=false){
 committed=committed||tileCommitted;
 if(!tileActive&&!tileReturnTimer)return;
 tileActive=false;tileCommitted=committed;clearTimeout(tileReturnTimer);$('#tileUnderlight').style.transition=`opacity ${committed?720:520}ms ease`;$('#tileUnderlight').style.opacity='0';feed.style.transition=`transform ${committed?720:520}ms cubic-bezier(.18,.78,.2,1),border-radius ${committed?720:520}ms ease,box-shadow 420ms ease`;
 feed.style.transform='none';feed.style.borderRadius='';feed.style.boxShadow='';
 tileReturnTimer=setTimeout(()=>{if(!tileActive){feed.style.transition='';feed.style.willChange='';device.classList.remove('tile-pulling');}tileReturnTimer=null;tileCommitted=false;},committed?740:540);
}
function pullForeground(dx,dy){
 if(reduced)return;
 clearTimeout(tileReturnTimer);tileReturnTimer=null;tileCommitted=false;tileActive=true;device.classList.add('tile-pulling');
 const x=Math.tanh(dx/95),y=Math.tanh(dy/95),amount=Math.min(1,Math.hypot(dx,dy)/135);
 feed.style.willChange='transform';feed.style.transition='transform 65ms cubic-bezier(.2,.65,.3,1),border-radius 100ms ease,box-shadow 100ms ease';
 feed.style.transform=`perspective(1000px) translate3d(${(x*3.5).toFixed(2)}px,${(y*3.5).toFixed(2)}px,0) rotateX(${(-y*3.2).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg) scale(${(1-amount*.026).toFixed(4)})`;
 feed.style.borderRadius=`${12+amount*19}px`;feed.style.boxShadow=`inset 0 0 0 1px rgba(255,255,255,${.12+amount*.28}),0 8px 32px #0005`;
}
function confirmCorner(which){clearTimeout(cornerConfirmTimer);$$('.corner-cue').forEach(el=>{const active=el.dataset.corner===which;el.classList.toggle('visible',active);el.classList.toggle('confirmed',active);el.classList.remove('ready');if(active){el.style.setProperty('--cue-progress','1');el.querySelector('span').textContent=cornerLabels[which];}});cornerConfirmTimer=setTimeout(()=>{$$('.corner-cue.confirmed').forEach(el=>el.classList.remove('confirmed','visible'));cornerConfirmTimer=null;},620);}
function saveReceipt(saved){
 const el=$('#cornerReceipt'),text=saved?'Saved for later':'Removed from saved';clearTimeout(receiptTimer);el.replaceChildren();el.setAttribute('aria-label',text);el.classList.remove('visible');
 const mark=document.createElement('span');mark.className='receipt-mark';mark.textContent=saved?'↖':'✓';mark.setAttribute('aria-hidden','true');el.append(mark);
 const letters=document.createElement('span');letters.className='receipt-letters';letters.setAttribute('aria-hidden','true');[...text].forEach((letter,i)=>{const span=document.createElement('span');span.textContent=letter===' '?'\u00a0':letter;span.style.setProperty('--letter',i);letters.append(span);});el.append(letters);
 requestAnimationFrame(()=>el.classList.add('visible'));receiptTimer=setTimeout(()=>el.classList.remove('visible'),2500);
}
function cornerFor(dx,dy){return dy<0?(dx<0?'save':'ai'):(dx<0?'share':'comments')}
function cornerProgress(which,dx,dy,wasArmed){clearTimeout(cornerConfirmTimer);$$('.corner-cue.confirmed').forEach(el=>el.classList.remove('confirmed'));pullForeground(dx,dy);const projection=(dx*(which==='ai'||which==='comments'?1:-1)+dy*(which==='share'||which==='comments'?1:-1))/Math.SQRT2,strength=Math.max(0,Math.min(1,projection/100)),armed=strength>=1;device.dataset.corner=which;device.style.setProperty('--tile-pull',String(strength));const underlight=$('#tileUnderlight');underlight.dataset.corner=which;underlight.style.transition='opacity 65ms linear';underlight.style.opacity=String(strength*.95);$$('.corner-cue').forEach(el=>{const active=el.dataset.corner===which;el.classList.toggle('visible',active);el.classList.toggle('ready',active&&armed);if(active){el.style.setProperty('--cue-progress',String(strength));el.querySelector('span').textContent=cornerLabels[which];}});if(armed&&!wasArmed)haptic();return armed;}
function controlIntent(dx,dy){const ax=Math.abs(dx),ay=Math.abs(dy),d=Math.hypot(dx,dy);if(d<12)return null;if(ay>ax*1.8)return 'scroll';if(ax>ay*1.8)return 'adjust';if(d>12)return panel==='ai'?(ay>=ax?'scroll':'adjust'):'diagonal';return null;}

feed.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;if(!e.isPrimary||gesture)return;if(window.bankInfoOpen||(panel&&panel!=='ai')||!$('#onboarding').hidden||e.button>0||e.target.closest('button,input,a,.pull-option,.poll-pull,.range-pointer-surface,.puzzle-surface'))return;stopMomentum();gesture={id:e.pointerId,x:e.clientX,y:e.clientY,lastY:e.clientY,lastT:performance.now(),v:0,mode:null,action:null,armed:false,start:feed.scrollTop,story:e.target.closest('.story')||current};feed.setPointerCapture(e.pointerId)});
feed.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const g=gesture,dx=e.clientX-g.x,dy=e.clientY-g.y,d=Math.hypot(dx,dy),ax=Math.abs(dx),ay=Math.abs(dy),now=performance.now();if(!g.mode&&panel!=='ai'&&d>6&&d<=12&&ax>ay*.5&&ay>ax*.3)cornerProgress(cornerFor(dx,dy),dx,dy,false);if(!g.mode&&d>12){if(panel!=='ai'&&ax>ay*.5&&ay>ax*.3){g.mode='diagonal';g.action=dy<0?(dx<0?'save':'ai'):(dx<0?'share':'comments')}else if(ay>ax*1.9||d>24){g.mode='scroll';clearGlow()}}if(g.mode==='scroll'){const delta=e.clientY-g.lastY,dt=Math.max(1,now-g.lastT);feed.scrollTop-=delta;g.v=g.v*.45+(delta/dt)*.55}else if(g.mode==='diagonal'){g.armed=cornerProgress(g.action,dx,dy,g.armed)}g.lastY=e.clientY;g.lastT=now;});
function endGesture(e,cancel=false){if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;gesture=null;clearGlow();if(cancel)return;if(g.mode==='diagonal'&&g.armed){action(g.action,g.story);lastTap=0}else if(g.mode==='scroll'){momentum(performance.now()-g.lastT<160?g.v:0);lastTap=0}else if(panel!=='ai'&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<10){const now=performance.now();if(now-lastTap<310&&lastTapPos&&Math.hypot(e.clientX-lastTapPos.x,e.clientY-lastTapPos.y)<35){current=g.story;like(e.clientX,e.clientY);lastTap=0}else{lastTap=now;lastTapPos={x:e.clientX,y:e.clientY}}}}
feed.addEventListener('pointerup',e=>endGesture(e));feed.addEventListener('pointercancel',e=>endGesture(e,true));feed.addEventListener('lostpointercapture',e=>{if(gesture?.id===e.pointerId)endGesture(e,true)});
feed.addEventListener('wheel',()=>stopMomentum(),{passive:true});
// Side pages keep a thin strip of the story visible and can be swiped away.
$$('.side-panel,.share-panel').forEach(el=>{let start=null;el.addEventListener('pointerdown',e=>{if(e.target.closest('input,button,textarea'))return;start={x:e.clientX,y:e.clientY}});el.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.6&&((el.id==='comments'&&dx>0)||(el.id==='share'&&dx<0)))closePanel();start=null});});
let friend=null;$$('[data-friend]').forEach(b=>b.addEventListener('click',()=>{friend=b.dataset.friend;$$('[data-friend]').forEach(x=>x.classList.toggle('active',x===b));$('#dmComposer').hidden=false;$('#dmLabel').textContent='A note for '+friend;$('#dmText').focus()}));
$('#sendDm').addEventListener('click',()=>{if(!friend)return;state.messages.push({to:friend,story:panelStory.id,note:$('#dmText').value});persist();$('#dmText').value='';notify('Demo message saved for '+friend+'.');closePanel()});
function storyUrl(){const u=new URL(location.href);u.hash=(panelStory||current).id;return u.href}
$('#copyLink').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(storyUrl());notify('Story link copied.')}catch{notify('Copy this link from your address bar.');location.hash=(panelStory||current).id}});
$('#systemShare').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:panelStory.dataset.title,url:storyUrl()})}catch(e){if(e.name!=='AbortError')notify('Sharing is unavailable here. Try copying the link.')}}else $('#copyLink').click()});
const aiIntros={bank:'Halden is a fictional demo bank. Scroll through mortgages, business and personal banking. Pause on a service to see its illustration grow. No real products, rates or financial recommendations are offered.',afterword:'Arrange sixteen words into four groups. Each group shares a partner word before or after all four. A link must also let the remaining words form complete groups. Hints are optional.',riverfold:'A larger five-by-five river puzzle: turn the twenty-five pieces to connect the entrance to the exit through every piece, passing markers one, two and three in order.',gestures:'Pull diagonally from anywhere: top left saves, top right opens me, bottom left shares and bottom right opens comments. Double tap to like. The screen tile tilts toward your pull. When your corner glows, let go to act, or pull back to cancel.',higgsfield:'NVIDIA and TCV joined an extension of Higgsfield’s Series B on 23 October 2026. The announcement does not give the new investment amount. The story links to the company’s original announcement; its user count is a company claim.',boelo:'This is a dated account of Storm Boelo over 24–25 October 2026 and recovery on Monday 26 October. The illustration is schematic, not a forecast. Current Met Office warnings are linked at the end.',journey:'A first-person journey from a night drive to an island ocean and a layered scrapbook garden. Every turn and transformation follows your scroll; you can go back through it too.',rain:'Follow two drops from the same cloud. We can explore runoff over paving, water entering soil, or why the local surface changes the route. The simplified sketch draws on USGS and EPA sources linked below.',night:'An imagined city, seen at three hours. Move the timeline to follow the small handovers between evening, midnight and morning. The people and places are fictional.',wash:'A small colour experiment. We can talk about how the washes meet, the feeling of the piece, or making room for chance in creative work.',studio:'A fictional studio visit, and a little permission to play. We can explore Cleo’s colour study, her quote, or what changes when you move the composition.',response:'A small comment with a whole story behind it. Mia is talking about the tiny wild things on an everyday walk. Her original conversation is shared with the field note.',city:'An imagined neighbourhood with a different set of priorities. Slide between the two streets, or connect me to a detail you want to explore.',garden:'A tiny wilderness, hiding in plain sight. We can explore the plants, the idea behind the story, or ways to notice more on your next walk.',morning:'A small celebration of doing less. We can talk about the photograph, the writing, or making room for an unplanned morning.',cosmos:'A short illustrated community space flight. Scrolling moves you through stars and lilac nebulae towards a spiral galaxy. The Sun, Sirius and Andromeda show how farther light means older light. The route and speed are artistic, not to scale.',poll:'A fan prediction for the December 2026 Abu Dhabi Grand Prix. Tap a driver’s name for their profile; pull their voting rail right and release to vote. Demo percentages are illustrative, with your choice saved only on this device.'};
function addAI(text,user=false){const p=document.createElement('p');p.className='ai-message'+(user?' user':'');p.textContent=text;$('#aiMessages').append(p);$('#aiMessages').scrollTop=$('#aiMessages').scrollHeight;return p;}
function resetAI(){aiSession++;$('#contextPicker').hidden=true;$('#aiStory').textContent=panelStory.dataset.title;$('#aiContext').textContent='THIS WHOLE STORY';$('#clearContext').hidden=true;$('#aiMessages').innerHTML='';$('#aiInput').value='';addAI(aiIntros[panelStory.id])}
function aiAnswer(question,replyContext=context,replyStory=panelStory){
  const q=question.toLowerCase(),id=replyStory.id;
  if(!['rain','higgsfield','boelo','gestures'].includes(id)&&q.includes('who')&&(q.includes('made')||q.includes('wrote')||q.includes('author')))return 'This is a fabricated story made for this interaction study. The people and conversations are fictional; the goal is to explore how the experience feels.';
  if(id==='afterword')return 'Every word belongs in one of four groups. The shared partner can go before or after it. Some words have more than one plausible link, so the whole set must fit. Try the puzzle’s Hint button for a partner clue without revealing its four words.';
  if(id==='riverfold')return 'Connect all twenty-five pieces, starting at the left arrow and exiting at the bottom right. The numbered markers must appear in the river’s route as one, two, three. The blue shows connected water; Hint outlines one piece to reconsider without turning it for you.';
  if(id==='bank')return aiIntros.bank;
  if(id==='gestures')return aiIntros.gestures;
  if(id==='higgsfield')return aiIntros.higgsfield+' The financing is intended for product development, infrastructure, hiring and expansion. The filmstrip is an original explanatory illustration, not a sample generated with Higgsfield.';
  if(id==='boelo')return aiIntros.boelo+' The Met Office’s weekend forecast highlighted Scotland, Northern Ireland and northern England for the strongest winds. By Monday, repairs and fresh warnings remained relevant; use the live source for current conditions.';
  if(id==='journey')return 'The city, bridge, flight, island dive and meadow form one scroll-controlled journey. The camera leaves the car; after the first phrase, the night city becomes a tropical paradise before the dive follows the water into a new landscape. The final words appear among paper flowers and cottages: the journey itself becomes the destination. This is an original fictional visual experience.';
  if(id==='rain'){
    const detail=(replyContext||q).toLowerCase();
    if(q.includes('who')&&/made|wrote|author/.test(q))return 'The illustration was made for this demo; its explanation draws on USGS Water Science School and EPA material linked at the end. The sketch and conversations are imagined, while the runoff/infiltration concepts are factual.';
    if(/paving|runoff|drain/.test(detail)&&/soil|infiltrat/.test(detail))return 'This compares two possible routes from the same rain: water can run over paving towards drainage, while some water on soil enters the ground through infiltration. Hard surfaces generally increase runoff and reduce infiltration. Soil conditions and the local drainage system change the real outcome; the sketch is simplified.';
    if(/soil|infiltrat|root/.test(detail))return 'Infiltration means water entering the soil. It can be held there, used by plants, or continue moving below ground. Soil is not an unlimited sponge: saturated ground, slope and soil properties affect how much rain runs off instead. The diagram is simplified, not a prediction for a real site.';
    if(/drain|paving|runoff/.test(detail))return 'Paving generally keeps rain from soaking into the ground where it lands, so more water can run along the surface towards drainage. The actual destination depends on the local drainage system. The sketch compares routes; it does not model flood risk or a real street.';
    return 'Two drops from the same rain can take different routes. On paving, water can run quickly towards drainage; on soil, some can soak in. Hard surfaces generally increase runoff and reduce infiltration. This is a simplified explanation based on USGS and EPA material, linked at the end of the story.';
  }
  if(id==='night'){
    const detail=(replyContext||q).toLowerCase();
    if(/bakery|loaf|flour|six in the morning|06:00|shutters/.test(detail))return 'The dawn moment follows the bakery before its shutters open: warm light, a flour-dusted sleeve, and the first loaf. It gives the ending its small reversal: morning has already begun for someone before the street wakes up. This is an imagined scene, not a reported person.';
    if(/midnight|bus|driver|window seat|00:00/.test(detail))return 'The midnight moment puts several different days on one bus. For one passenger it is the journey home; for someone else it may be the beginning of a shift. The moving bus makes that shared, temporary little world visible. These journeys are fictional.';
    if(/evening|kettle|handover|shift begins|18:00/.test(detail))return 'The evening glimpse is a handover: a kettle goes on while one person finishes their day and another begins a shift. Lit windows hint at those overlapping lives without turning them into statistics. It is an imagined human rhythm, rather than a report about a real neighbourhood.';
    return 'This is an illustrated, fictional city rather than a news report. At six in the evening, one shift hands over to another; at midnight, a bus carries a small collection of journeys; at six in the morning, the bakery is getting ready. The timeline changes the same street to show how many lives overlap in one place.';
  }
  if(id==='wash')return 'This is a living colour study: a few soft pigments spread and meet on a digital sheet of paper. A single tap adds a drop; scrolling gives it room to settle. The point is to notice an unexpected edge or mixture, rather than make a perfect picture.';
  if(id==='studio'){const detail=(replyContext||'').toLowerCase();if(/quote|lines up|cleared|table/.test(detail))return 'Cleo’s imagined practice leaves room for accidents. The quotation is about noticing the point where a composition feels alive, even when its pieces are not perfectly aligned.';if(/artwork|cut-paper|sun|composition|slider/.test(detail))return 'The coral circle gives the eye a warm place to land, while the blue curve carries it across the page. The slider shifts the balance of the sun and arch; a small change can make the same pieces feel quieter or bolder.';return /simple|explain/.test(q)?'The same few colours and shapes can feel different when you move them around. Try the slider and keep the version you like.':'This imagined studio visit is a discovery story: a person, a piece of work, and a small invitation to try their way of seeing. Cleo is fictional; the illustration was made for this demo.';}
  if(id==='response'){
    const detail=(replyContext||'').toLowerCase();
    if(/station wall|single daisy|illustration/.test(detail))return 'The daisy is the small hero of this drawing: one flower, growing where nobody planned it. The station sign and wall make the scene feel ordinary. Its little smile carries Mia’s affectionate idea of a “determined” flower.';
    if(/footnote/.test(detail))return 'The ending turns the usual order around. A small remark in a discussion can be the part that stays with someone—and become worth a page of its own.';
    if(/the city|field notes|conversation/.test(detail)||/original|thread/.test(q))return 'Mia left this comment on “The city is a little wilder,” the field note about nature in overlooked urban spaces. This highlight leads back to that same discussion, with Mia’s original comment still there.';
    if(replyContext)return '“Determined” is doing a lot of lovely work here. It gives an ordinary daisy a personality and turns a daily walk into a small ritual of noticing. The short, personal observation is what makes the comment worth pausing over.';
    return /simple|explain/.test(q)?'Mia noticed a daisy growing outside a station. Her comment makes the field note’s idea personal: a tiny wild thing becomes something to look forward to.':'The word “determined” gives a tiny flower a personality. It is a small, affectionate observation that other people recognise. The highlighted comment shares its discussion with the original field note.';
  }
  if(id==='city')return /simple|explain/.test(q)?'The two drawings show the same street used differently: parking in one, trees and shared space in the other. It is a fictional proposal, not a report of a real project.':replyContext?.includes('Before and after')?'The buildings stay put. What changes is the space between them: parked cars give way to trees, a bench, and people. Slide the divider to compare the same spot on either side.':'This imagined street asks a simple design question: what happens when a place makes room for people to stay, rather than only to pass through? The before-and-after is an illustration, not evidence from a real scheme.';
  if(replyContext){
    if(id==='garden'){
      if(/determined daisy|best part of my walk/.test(replyContext.toLowerCase()))return 'Mia turns the idea into an everyday observation: a daisy outside the station becomes a small thing to look forward to. The word “determined” gives the flower a little character. This is the same comment highlighted later in the feed, with one shared conversation.';
      if(/flower|bee|illustration/.test(replyContext.toLowerCase()))return q.includes('simple')?'The flowers make the idea visible: even a crack in a city pavement can have a little life in it.':'The flowers are growing out of the gaps between paving stones. They turn an ordinary bit of pavement into the centre of the story. The visiting bee connects that tiny patch to a bigger world. It is an illustration, rather than a record of particular plant species.';
      if(/weed|habitat|crack/.test(replyContext.toLowerCase()))return 'Calling it a “tiny wilderness” changes how we look at it. A plant growing where nobody planned it can feel like a mistake—or like a little space the city has left for nature. That change of perspective is the point of this scrap.';
      return '“A little wilder” is the invitation: look closely at an ordinary city street and notice the life making its own space. The story gradually zooms from a whole city into one small crack.';
    }
    if(id==='morning')return replyContext.toLowerCase().includes('photograph')?'The woodland photograph gives the story somewhere to pause. Its soft light and depth invite a slower look; the paper frame makes it feel like a photo someone kept from a good day.':'The note moves from small actions—leaving headphones, taking a different route—to a simple conclusion: an uneventful morning can still be a lovely one. The short lines leave room to breathe.';
    if(id==='cosmos'&&/one sky|different times/.test(replyContext.toLowerCase()))return 'A single view of the sky combines light that began travelling at different times. Sunlight has travelled for minutes, light from other stars for years, and light from distant galaxies for millions of years. The flight follows three examples of those overlapping past moments.';
    if(id==='cosmos'&&/sirius|8\.6/.test(replyContext.toLowerCase()))return 'Sirius is about 8.6 light-years away. The light arriving now has been travelling for more than eight years. That is the old moment you see when you look at it.';
    if(id==='cosmos'&&/andromeda|million/.test(replyContext.toLowerCase()))return 'Andromeda is roughly 2.5 million light-years away. Its light began travelling long before modern humans existed. The distant galaxy makes that much older light visible in the story.';
    if(id==='cosmos')return replyContext.toLowerCase().includes('sun')?'The Sun is about 150 million kilometres away. Light is fast, but crossing that distance still takes roughly eight minutes. So sunlight arriving now began its journey a little earlier.':'The star flight makes an invisible delay feel tangible. Looking farther away means receiving older light: the sky brings different moments of the past into one view.';
    if(id==='poll')return 'Tap a name to see a driver profile. Pull the voting handle right until it glows, then release. Pull back to cancel. Results are illustrative; your pick stays on this device.';
    return 'The two cups turn the poll into a familiar little scene. Pulling one option is a playful way to choose a side, while the results remain visible even if you just want to look.';
  }
  if(q.includes('simple')||q.includes('explain'))return {garden:'A city can make room for little bits of nature. This story asks you to notice them, starting with a flower growing in a crack.',morning:'A day doesn’t have to be productive to be a good day.',cosmos:'Light takes time to travel. When you look at a star, you see it as it was when that light left it. Farther away means further back in time.',poll:'Tap a name to learn about the driver. Pull their voting handle right and release when it glows. These are demo results.'}[id];
  if(id==='garden'&&/flower|plant|bee/.test(q))return 'The flowers make this small patch of pavement feel alive. The bee adds a visitor, turning a crack into a tiny scene rather than empty space. The illustration is an invitation to notice similar moments on your own walk.';
  return {garden:'The story starts with something easy to overlook, then changes the scale: a crack becomes a habitat. On your next walk, look for a tiny patch of green you usually pass by.',morning:'The photograph gives you a place to linger. The short note gives you permission to linger. Nora and this Sunday are fictional, but you can borrow the idea.',cosmos:'Sunlight reaches Earth in about eight minutes. Sirius is about 8.6 light-years away; Andromeda is roughly 2.5 million. The flight moves through those very different kinds of looking back.',poll:'The Abu Dhabi Grand Prix closes the season in December 2026. These are four fan picks, not the full grid or a prediction model. Your choice updates an illustrative result and stays on this device.'}[id];
}
function ask(q){if(!q.trim())return;addAI(q,true);$('#aiInput').value='';const session=aiSession,replyContext=context,replyStory=panelStory;setTimeout(()=>{if(panel==='ai'&&aiSession===session)addAI(aiAnswer(q,replyContext,replyStory))},350)}
$('#aiForm').addEventListener('submit',e=>{e.preventDefault();ask($('#aiInput').value)});$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.prompt)));$('#clearContext').addEventListener('click',()=>{context=null;resetAI()});
let tethering=false,target=null,tetherStart=null,tetherMoved=false,tetherPointerId=null;const tether=$('#tether'),line=$('#tetherLine path');
tether.addEventListener('pointerdown',e=>{e.preventDefault();if(!e.isPrimary||tethering)return;tetherPointerId=e.pointerId;tethering=true;tetherMoved=false;tetherStart={x:e.clientX,y:e.clientY};$('#contextPicker').hidden=true;tether.setPointerCapture(e.pointerId);$('#ai').style.pointerEvents='none';tether.style.pointerEvents='auto'});
tether.addEventListener('pointermove',e=>{if(!tethering||e.pointerId!==tetherPointerId)return;if(Math.hypot(e.clientX-tetherStart.x,e.clientY-tetherStart.y)>8)tetherMoved=true;const r=device.getBoundingClientRect(),b=tether.getBoundingClientRect(),x=b.left+b.width/2-r.left,y=b.top+b.height/2-r.top,ex=e.clientX-r.left,ey=e.clientY-r.top;line.setAttribute('d',`M${x},${y} Q${x+30},${(y+ey)/2} ${ex},${ey}`);target?.classList.remove('context-target');target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-context]');const overlay=$('#ai').getBoundingClientRect();if(target&&(!target.closest('.story')||e.clientY<=overlay.bottom||e.clientX<r.left||e.clientX>r.right||e.clientY>r.bottom))target=null;target?.classList.add('context-target')});
function endTether(e,cancel=false){if(!tethering||(e&&e.pointerId!==tetherPointerId))return;tethering=false;$('#ai').style.pointerEvents='';tether.style.pointerEvents='';line.setAttribute('d','');if(target&&!cancel)selectContext(target);target?.classList.remove('context-target');target=null;}
tether.addEventListener('pointerup',e=>endTether(e));tether.addEventListener('pointercancel',e=>endTether(e,true));tether.addEventListener('lostpointercapture',e=>endTether(e,true));
// Poll rendering owns its stable drag surface; the shared app owns persistence.
const raceChoices={antonelli:34,norris:29,verstappen:22,leclerc:15};
if(!Object.hasOwn(raceChoices,state.raceVote))state.raceVote=null;
window.storyPoll={get:()=>state.raceVote,set:choice=>{if(Object.hasOwn(raceChoices,choice)){state.raceVote=choice;persist();}}};
$('#enter').addEventListener('click',()=>{$('#onboarding').classList.add('leaving');setTimeout(()=>{$('#onboarding').hidden=true;feed.inert=false;$('.studio').inert=false;try{localStorage.setItem('story-intro-complete','true')}catch{}feed.focus({preventScroll:true})},550)});$('#replay').addEventListener('click',()=>{closePanel();$('#onboarding').hidden=false;$('#onboarding').classList.remove('leaving');feed.inert=true;$('.studio').inert=true;$('#enter').focus({preventScroll:true})});
document.addEventListener('keydown',e=>{
  if(!$('#onboarding').hidden){if(e.key==='Tab'){e.preventDefault();$('#enter').focus()}return}
  if(e.key==='Escape'){closePanel();return}
  if(panel){
    if(e.key==='Tab'&&panel!=='ai'){
      const modal=$('#'+panel),els=[...modal.querySelectorAll('button,input,textarea,summary,[tabindex="0"]')].filter(x=>!x.hidden&&x.offsetParent!==null),first=els[0],last=els.at(-1);
      if(!modal.contains(document.activeElement)){e.preventDefault();(e.shiftKey?last:first)?.focus()}
      else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
    }
    return;
  }
  if(e.target.closest('input,textarea'))return;
  const map={c:'comments',a:'ai',s:'save',h:'share',l:'like',m:'more'};
  if(map[e.key.toLowerCase()]){e.preventDefault();action(map[e.key.toLowerCase()])}
});
if(location.hash){const target=stories.find(s=>s.id===(location.hash.slice(1)==='thread'?'afterword':location.hash.slice(1)));if(target)requestAnimationFrame(()=>{feed.scrollTop=target.offsetTop;updateCurrent()})}
window.addEventListener('blur',()=>{gesture=null;clearGlow();stopMomentum()});

const narrativeRangeLocks=new Set();
let syncingRangeViews=false,streetManualScroll=null,streetManualValue=55;
function renderStreet(){const input=$('#streetReveal'),value=input.value;input.setAttribute('aria-valuetext','Comparison split at '+value+' percent');$('#streetAfter').style.clipPath=`inset(0 0 0 ${value}%)`;$('#streetDivider').style.left=value+'%'}
$('#streetReveal').addEventListener('input',()=>{if(!syncingRangeViews){streetManualScroll=feed.scrollTop;streetManualValue=Number($('#streetReveal').value)}renderStreet()});
feed.addEventListener('street-scroll',e=>{
  if(motionPreference.matches||narrativeRangeLocks.has('streetReveal'))return;
  let value=e.detail.value;
  if(streetManualScroll!==null){
    const distance=Math.abs(feed.scrollTop-streetManualScroll),t=Math.max(0,Math.min(1,(distance-36)/96)),ease=t*t*(3-2*t);
    value=Math.round(streetManualValue+(value-streetManualValue)*ease);
    if(t===1)streetManualScroll=null;
  }
  if(Number($('#streetReveal').value)!==value){$('#streetReveal').value=value;renderStreet()}
});
// The assistant stays connected to its named story while the reader can explore below it.
let aiDrag=null;const aiHeader=$('#ai header');
aiHeader.addEventListener('pointerdown',e=>{if(!e.isPrimary||aiDrag||e.target.closest('button'))return;aiDrag={id:e.pointerId,x:e.clientX,y:e.clientY};aiHeader.setPointerCapture(e.pointerId)});
aiHeader.addEventListener('pointermove',e=>{if(!aiDrag||e.pointerId!==aiDrag.id)return;const dy=Math.min(0,e.clientY-aiDrag.y);$('#ai').classList.add('dragging');$('#ai').style.transform=`translateY(${dy}px)`});
aiHeader.addEventListener('pointerup',e=>{if(!aiDrag||e.pointerId!==aiDrag.id)return;const dy=e.clientY-aiDrag.y,aiDragStartX=aiDrag.x;aiDrag=null;$('#ai').classList.remove('dragging');$('#ai').style.transform='';if(dy < -28&&Math.abs(dy)>Math.abs(e.clientX-aiDragStartX)*1.3)closePanel()});
const cancelAiDrag=e=>{if(!aiDrag||e.pointerId!==aiDrag.id)return;aiDrag=null;$('#ai').classList.remove('dragging');$('#ai').style.transform=''};aiHeader.addEventListener('pointercancel',cancelAiDrag);aiHeader.addEventListener('lostpointercapture',cancelAiDrag);

if(document.documentElement.classList.contains('isolated-story'))$('#onboarding').hidden=true;
try{if(localStorage.getItem('story-intro-complete')==='true'&&!new URLSearchParams(location.search).has('intro'))$('#onboarding').hidden=true}catch{}
$('#artBalance').addEventListener('input',e=>{const value=Number(e.target.value),delta=value-50;$('#posterSun').style.transform=`translate(${delta*.55}px,${-delta*.35}px) scale(${1+delta*.003})`;$('#posterArch').style.transform=`translate(${-delta*.3}px,${delta*.25}px) rotate(${delta*.16}deg)`;$('#artMood').textContent=value<33?'A little more quiet.':value>67?'A little more electric.':'A happy accident.';e.target.setAttribute('aria-valuetext',value+' percent: '+$('#artMood').textContent);$('.art-poster').style.background=value>67?'#eee0a8':value<33?'#e0decd':'#e8ddb8'});
const nightMoments=[
  {time:'18:00',spoken:'six in the evening',sky:['#5a607a','#e9ab86'],stars:.15,voice:'THE EVENING HANDOVER',line:['A kettle goes on.','A shift begins.'],detail:'One day ends at the kitchen table. Another starts across the street.'},
  {time:'00:00',spoken:'midnight',sky:['#172d3c','#45566b'],stars:.95,voice:'THE LAST BUS IS SOMEONE’S FIRST',line:['A small world,','on the way home.'],detail:'A driver and a tired passenger share the last bus.'},
  {time:'06:00',spoken:'six in the morning',sky:['#a5aaba','#efc7a1'],stars:.05,voice:'BEFORE THE SHUTTERS GO UP',line:['The first loaf.','The last yawn.'],detail:'The bakery is already at work before the shutters rise.'}
];
function renderNight(){
  const index=Number($('#nightHour').value),m=nightMoments[index];
  $('#nightTime').textContent=m.time;$('#nightVoice').textContent=m.voice;
  $('#nightLine').replaceChildren(...m.line.flatMap((text,i)=>i?[document.createElement('br'),document.createTextNode(text)]:[document.createTextNode(text)]));
  $('#nightDetail').textContent=m.detail;$('#nightSkyTop').setAttribute('stop-color',m.sky[0]);$('#nightSkyBottom').setAttribute('stop-color',m.sky[1]);$('#nightStars').style.opacity=m.stars;
  $$('.night-window').forEach((w,i)=>{w.style.fill=(index===0?i%4!==1:index===1?i%7===0:i%9===2)?'#efd59a':'#40505a'});
  $('#bakeryWindow').setAttribute('fill',index===2?'#ffe1a0':index===1?'#6c6863':'#d6ae83');
  const label='An imagined city at '+m.spoken;$('#nightIllustration').setAttribute('aria-label',label);$('#nightScene').dataset.context=label;$('#nightGlimpse').dataset.context=m.voice+': '+m.line.join(' ')+' '+m.detail;
  $('#nightHour').setAttribute('aria-valuetext',m.spoken);
}
let nightManual=null;
$('#nightHour').addEventListener('input',()=>{renderNight();if(!syncingRangeViews){const progress=Number($('#nightHour').value)/2;nightManual={anchor:feed.scrollTop,last:feed.scrollTop,from:progress,display:progress,direction:0};$('.night-sequence').style.setProperty('--night-progress',String(progress))}});
feed.addEventListener('night-scroll',e=>{
  if(narrativeRangeLocks.has('nightHour'))return;
  let progress=e.detail.progress;
  if(nightManual){
    const m=nightManual,scroll=feed.scrollTop,direction=Math.sign(scroll-m.last);
    // Reversing begins a fresh handoff from the moment actually on screen.
    if(direction&&m.direction&&direction!==m.direction){m.anchor=scroll;m.from=m.display}
    if(direction)m.direction=direction;
    m.last=scroll;
    const t=Math.max(0,Math.min(1,(Math.abs(scroll-m.anchor)-36)/96)),ease=t*t*(3-2*t);
    progress=m.from+(progress-m.from)*ease;
    // Preserve the chosen moment until the narrative catches it in this direction.
    progress=m.direction<0?Math.min(m.from,progress):Math.max(m.from,progress);
    m.display=progress;
    if(t===1&&(m.direction<0?e.detail.progress<=m.from:e.detail.progress>=m.from))nightManual=null;
  }
  $('.night-sequence').style.setProperty('--night-progress',String(progress));
  const index=Math.min(2,Math.floor(progress*3));
  if(Number($('#nightHour').value)!==index){$('#nightHour').value=index;renderNight()}
});
renderNight();
// Interactive sliders yield vertical intent back to the continuous story scroll.
$$('input[type="range"]').forEach(input=>{
  const surface=document.createElement('div');surface.className='range-pointer-surface';surface.setAttribute('aria-hidden','true');
  if(input.id==='streetReveal'){surface.classList.add('street-range-surface');input.after(surface)}
  else{const shell=document.createElement('div');shell.className='range-control-shell';input.before(shell);shell.append(input,surface)}
  let rangeDrag=null;input.addEventListener('keydown',()=>delete input.dataset.pointerFocus);input.addEventListener('blur',()=>delete input.dataset.pointerFocus);
  function setRangeAt(x){input.dataset.pointerFocus='true';input.focus({preventScroll:true});const r=input.getBoundingClientRect(),pad=8,min=Number(input.min),max=Number(input.max),step=Number(input.step)||1;const ratio=Math.max(0,Math.min(1,(x-r.left-pad)/(r.width-pad*2)));input.value=String(min+Math.round((max-min)*ratio/step)*step);input.dispatchEvent(new Event('input',{bubbles:true}));}
  surface.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;if(!e.isPrimary||rangeDrag||e.button>0)return;e.preventDefault();stopMomentum();rangeDrag={id:e.pointerId,startValue:input.value,story:input.closest('.story'),corner:null,cornerArmed:false,x:e.clientX,y:e.clientY,lastY:e.clientY,lastT:performance.now(),v:0,mode:null,moved:false};narrativeRangeLocks.add(input.id);surface.setPointerCapture(e.pointerId)});
  surface.addEventListener('pointermove',e=>{if(!rangeDrag||e.pointerId!==rangeDrag.id)return;const g=rangeDrag,dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.hypot(dx,dy)>9)g.moved=true;if(!g.mode){const intent=controlIntent(dx,dy);g.mode=intent==='adjust'?'slide':intent;if(g.mode==='diagonal')g.corner=cornerFor(dx,dy);}if(g.mode==='scroll'||g.mode==='slide')narrativeRangeLocks.delete(input.id);if(g.mode==='diagonal'){g.cornerArmed=cornerProgress(g.corner,dx,dy,g.cornerArmed);}else if(g.mode==='scroll'){const delta=e.clientY-g.lastY,now=performance.now();feed.scrollTop-=delta;g.v=g.v*.45+delta/Math.max(1,now-g.lastT)*.55;g.lastT=now;}else if(g.mode==='slide')setRangeAt(e.clientX);g.lastY=e.clientY});
  surface.addEventListener('pointerup',e=>{if(!rangeDrag||e.pointerId!==rangeDrag.id)return;narrativeRangeLocks.delete(input.id);if(rangeDrag.mode==='diagonal'){const g=rangeDrag;rangeDrag=null;clearGlow();if(g.cornerArmed)action(g.corner,g.story);return;}if(!rangeDrag.moved)setRangeAt(e.clientX);if(rangeDrag.mode==='scroll')momentum(performance.now()-rangeDrag.lastT<160?rangeDrag.v:0);rangeDrag=null});
  const cancelRange=e=>{if(!rangeDrag||e.pointerId!==rangeDrag.id)return;narrativeRangeLocks.delete(input.id);if(rangeDrag.mode==='diagonal')clearGlow();if(rangeDrag.mode!=='scroll'){input.value=rangeDrag.startValue;input.dispatchEvent(new Event('input',{bubbles:true}));}rangeDrag=null};surface.addEventListener('pointercancel',cancelRange);surface.addEventListener('lostpointercapture',cancelRange);window.addEventListener('blur',()=>{if(rangeDrag)cancelRange({pointerId:rangeDrag.id})});
});
// Keep composers above a mobile software keyboard without losing the story position.
function syncViewport(){if(!window.visualViewport)return;const h=window.visualViewport.height;document.documentElement.style.setProperty('--app-height',h+'px');device.classList.toggle('keyboard-open',window.innerHeight-h>120&&!!document.activeElement?.closest('input:not([type="range"]),textarea'));}
window.visualViewport?.addEventListener('resize',syncViewport);document.addEventListener('focusin',syncViewport);document.addEventListener('focusout',()=>requestAnimationFrame(syncViewport));syncViewport();

function isVisibleContext(el){if(el.closest('[inert],[aria-hidden="true"]'))return false;const boundary=$('#ai').getBoundingClientRect().bottom,deviceRect=device.getBoundingClientRect(),r=el.getBoundingClientRect();return r.bottom>boundary+10&&r.top<deviceRect.bottom-10&&r.right>deviceRect.left&&r.left<deviceRect.right;}
function selectContext(element){
  if(!isVisibleContext(element)){notify('That detail moved out of view. Try another.');return}
  const nextStory=element.closest('.story');
  if(nextStory!==panelStory){panelStory=nextStory;context=null;resetAI();}
  aiSession++;panelStory=nextStory;context=contextLabel(element);
  $('#aiStory').textContent=panelStory.dataset.title;$('#aiContext').textContent=context;
  $('#clearContext').hidden=false;$('#contextPicker').hidden=true;
  $$('#aiMessages .context-note').forEach(note=>note.remove());
  addAI('Let’s look at “'+context.replace(/\.$/,'')+'”.').classList.add('context-note');
  haptic();
}
tether.addEventListener('click',()=>{
  if(tetherMoved)return;
  const boundary=$('#ai').getBoundingClientRect().bottom,deviceRect=device.getBoundingClientRect();
  const choices=$$('[data-context]').filter(isVisibleContext);
  $('#contextChoices').innerHTML='';
  if(!choices.length){const p=document.createElement('p');p.textContent='Scroll the story to uncover a detail, then try again.';$('#contextChoices').append(p)}
  choices.forEach(el=>{const b=document.createElement('button');b.textContent=contextLabel(el);b.addEventListener('click',()=>{selectContext(el);tether.focus({preventScroll:true})});$('#contextChoices').append(b)});
  $('#contextPicker').hidden=false;$('#closeContextPicker').focus({preventScroll:true});
});
$('#closeContextPicker').addEventListener('click',()=>{$('#contextPicker').hidden=true;tether.focus({preventScroll:true})});
feed.inert=!$('#onboarding').hidden;$('.studio').inert=!$('#onboarding').hidden;if(!$('#onboarding').hidden)$('#enter').focus({preventScroll:true});

feed.addEventListener('scroll',()=>{if(!$('#contextPicker').hidden)$('#contextPicker').hidden=true},{passive:true});
// Browsers may restore form values on reload; keep illustrations and copy in sync.
function syncRangeViews(){syncingRangeViews=true;try{$$('input[type="range"]').forEach(input=>input.dispatchEvent(new Event('input',{bubbles:true})))}finally{syncingRangeViews=false}}
syncRangeViews();window.addEventListener('pageshow',()=>requestAnimationFrame(syncRangeViews));window.addEventListener('load',()=>requestAnimationFrame(syncRangeViews));
// Story primitives expose meaningful context, including headings, prose and community replies.
stories.forEach(story=>{
  story.querySelectorAll('h2,h3,p,.inline-comment,.byline,.light-control,.pull-option').forEach(el=>{
    if(el.dataset.context)return;
    el.dataset.contextAuto='true';const text=readableContextText(el);
    if(text.length>3)el.dataset.context=text.length>190?text.slice(0,187)+'…':text;
  });
});

function readableContextText(el){const copy=el.cloneNode(true);copy.querySelectorAll('[aria-hidden="true"]').forEach(node=>node.remove());copy.querySelectorAll('br').forEach(node=>node.replaceWith(' '));return copy.textContent.replace(/\s+/g,' ').trim()}
function contextLabel(el){const text=el.dataset.contextAuto?readableContextText(el):el.dataset.context;return text.length>190?text.slice(0,187)+'…':text;}

// Touch scroll belongs to the browser: no scrollTop writes, velocity filter or custom coast.
// Only an explicitly non-vertical gesture prevents the native default.
let touchSession=null;
function clearTouch(cancel=false){const g=touchSession;if(!g)return;touchSession=null;feed.removeEventListener('touchmove',moveTouch);if(g.kind==='range'){narrativeRangeLocks.delete(g.input.id);if(cancel&&g.mode==='slide'){g.input.value=g.startValue;g.input.dispatchEvent(new Event('input',{bubbles:true}));}}clearGlow();}
function touchRange(g,x){const r=g.input.getBoundingClientRect(),pad=8,min=Number(g.input.min),max=Number(g.input.max),step=Number(g.input.step)||1,ratio=Math.max(0,Math.min(1,(x-r.left-pad)/(r.width-pad*2)));g.input.value=String(min+Math.round((max-min)*ratio/step)*step);g.input.dispatchEvent(new Event('input',{bubbles:true}));}
function moveTouch(e){const g=touchSession;if(!g)return;if(e.touches.length!==1){clearTouch(true);return;}const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y,d=Math.hypot(dx,dy),ax=Math.abs(dx),ay=Math.abs(dy);if(d>8)g.moved=true;
 if(!g.mode){
  // Yield on the first clear vertical movement. Once yielded, there is no blocking move listener.
  if(ay>ax*1.6){g.mode='native';feed.removeEventListener('touchmove',moveTouch);return;}
  if(e.cancelable)e.preventDefault();if(d<8)return;
  if(g.kind==='range'&&ax>ay*1.8){g.mode='slide';narrativeRangeLocks.add(g.input.id);}else if(panel!=='ai'&&ax>ay*.5&&ay>ax*.3){g.mode='diagonal';g.corner=cornerFor(dx,dy);}else g.mode='idle';
 }
 if(g.mode==='native')return;if(e.cancelable)e.preventDefault();
 if(g.mode==='diagonal'){g.armed=cornerProgress(g.corner,dx,dy,g.armed);}
 else if(g.mode==='slide')touchRange(g,t.clientX);
}
feed.addEventListener('touchstart',e=>{clearTouch(true);if(window.bankInfoOpen||e.touches.length!==1||(panel&&panel!=='ai')||!$('#onboarding').hidden)return;const target=e.target;if(target.closest('button,input,a,textarea,.puzzle-surface,.poll-pull'))return;const t=e.touches[0],surface=target.closest('.range-pointer-surface');touchSession={id:t.identifier,x:t.clientX,y:t.clientY,story:target.closest('.story')||current,kind:surface?'range':'story',mode:null,moved:false,armed:false};if(surface){touchSession.input=surface.parentElement.querySelector('input[type="range"]');touchSession.startValue=touchSession.input.value;}feed.addEventListener('touchmove',moveTouch,{passive:false});},{passive:true});
feed.addEventListener('touchend',e=>{const g=touchSession;if(!g||![...e.changedTouches].some(t=>t.identifier===g.id))return;if(g.mode==='native'){lastTap=0;clearTouch();return;}const custom=!!g.mode;if(custom&&e.cancelable)e.preventDefault();if(g.mode==='diagonal'&&g.armed)action(g.corner,g.story);else if(g.kind==='range'&&!g.moved)touchRange(g,g.x);else if(g.kind==='story'&&!g.moved&&panel!=='ai'){const now=performance.now();if(now-lastTap<310&&lastTapPos&&Math.hypot(g.x-lastTapPos.x,g.y-lastTapPos.y)<35){current=g.story;like(g.x,g.y);lastTap=0;}else{lastTap=now;lastTapPos={x:g.x,y:g.y};}}if(g.moved)lastTap=0;clearTouch();},{passive:false});
feed.addEventListener('touchcancel',()=>clearTouch(true),{passive:true});window.addEventListener('blur',()=>clearTouch(true));

$$('[data-feedback]').forEach(b=>b.addEventListener('click',()=>{state.feedback??={};state.feedback[panelStory.id]=b.dataset.feedback;persist();renderMore();$('#menuFeedback').textContent='Saved on this device.';haptic();}));
$('#clearFeedback').addEventListener('click',()=>{state.feedback={};persist();renderMore();$('#menuFeedback').textContent='Content preferences cleared.';});
window.feedMotionBridge={blocked:()=>!!window.bankInfoOpen||!!panel||panelClosures>0||!$('#onboarding').hidden,story:()=>{updateCurrent();return current;},menu:story=>action('more',story),cancel:()=>{clearTouch(true);gesture=null;lastTap=0;lastTapPos=null;clearGlow();stopMomentum();}};
