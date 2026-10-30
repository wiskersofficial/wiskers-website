/** Each slide owns a stationary phone. Only its screen changes on entry. */
export function mountActTwo(){
  const scenes=[...document.querySelectorAll('.pitch-act-two')];
  const phones=new Map(),savedPositions=new Map();
  const captions={6:'ILLUSTRATIVE CLIENT EXPERIENCE',7:'ONE CAMPAIGN · ONGOING VALUE',8:'THE EXPERIENCE IN A SALES CONVERSATION',9:'ACTUAL WORKING PROTOTYPE',10:'BAGEL APPLICATION · PROTOTYPE CONTENT',11:'ONE ENGINE · TWO EVIDENCE PATHS'};
  const player=document.createElement('iframe');player.className='prototype-frame';player.title='Actual continuous stories prototype';player.tabIndex=-1;player.style.opacity='0';
  let current=null,still=false,ready=false,exploring=false,feedFrame=0,transitionGeneration=0,boxes=[];
  const clamp=x=>Math.max(0,Math.min(1,x));
  const isProduct=phone=>phone&&phone.number>=9;
  const doc=()=>{try{return player.contentDocument;}catch{return null;}};
  const message=value=>{if(ready)player.contentWindow?.postMessage(value,location.origin);};
  function showStatus(phone,title,body){if(!phone)return;phone.status.replaceChildren();const b=document.createElement('b');b.textContent=title;phone.status.append(b,document.createTextNode(body));phone.status.classList.add('is-shown');}
  for(const slide of scenes){
    // Stable phone stages are independent of the displayed slide number.
    const number=Number(slide.dataset.stage||slide.dataset.slide),device=slide.querySelector('.slide-device'),screen=device.querySelector('.device-screen');
    const content=document.createElement('div');content.className='screen-content';content.append(...screen.childNodes);screen.append(content);
    const status=document.createElement('div');status.className='device-status';status.setAttribute('aria-live','polite');content.append(status);
    const caption=document.createElement('span');caption.className='device-caption';caption.textContent=captions[number];device.append(caption);
    const interact=document.createElement('button');interact.type='button';interact.className='device-interact';interact.textContent='Try the prototype ↗';interact.hidden=number<9||number===11;device.append(interact);
    const phone={slide,number,device,screen,content,status,interact,animations:[]};phones.set(number,phone);
    device.classList.toggle('on-dark',[7,9].includes(number));device.classList.toggle('is-product',number>=9);
    const concept=content.querySelector('.concept-screen');if(concept)concept.style.background=number===7?'#dce8f0':number===8?'#eadbd0':'#dce8df';
    if(number===7)showStatus(phone,'Build. Launch. Learn.','Create → Distribute → Insight');
    if(number===8)showStatus(phone,'Start with a buyer','Use a working demo to open a relevant conversation.');
    if(number===11)showStatus(phone,'Next: prove the value','Delivery quality. Paid demand. Reader return.');
    interact.addEventListener('click',()=>{if(current!==phone)return;setExploring(!exploring);});
    content.querySelectorAll('[data-flow-choice]').forEach(button=>button.addEventListener('click',()=>{
      const choice=button.dataset.flowChoice;content.querySelectorAll('[data-flow-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      content.querySelector('.flow-response').textContent=choice==='Teamwork'?'Explore shared tasks, handovers and one place to work.':'Explore clearer reporting and a view across the team’s work.';
      content.querySelector('.flow-sculpture').style.transform=choice==='Teamwork'?'rotate(-16deg)':'rotate(14deg)';
    }));
  }
  function setExploring(value){
    exploring=value;for(const phone of phones.values()){const selected=phone===current&&value;phone.device.classList.toggle('is-exploring',selected);phone.interact.textContent=selected?'Return to the deck ↙':'Try the prototype ↗';}
    player.tabIndex=value?0:-1;message(value||still||!isProduct(current)?'pitchdeck:pause':'pitchdeck:play');
  }
  function finishScreen(phone){
    if(!phone)return;phone.animations.forEach(a=>{a.cancel();});phone.animations=[];phone.screen.querySelectorAll('.screen-transition').forEach(el=>el.remove());
  }
  function poster(phone){
    const copy=phone.content.cloneNode(true);copy.className='screen-transition';copy.setAttribute('aria-hidden','true');copy.inert=true;
    copy.querySelectorAll('iframe,.screen-transition').forEach(el=>el.remove());copy.querySelectorAll('button,a,input').forEach(el=>el.tabIndex=-1);
    return copy;
  }
  function animateScreen(phone,previous){
    finishScreen(phone);if(still)return;
    // The live feed itself carries the previous screen between product stages.
    if(isProduct(previous)&&isProduct(phone)&&ready){
      if(phone.status.classList.contains('is-shown'))phone.animations=[phone.status.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:800,easing:'ease-out'})];
      return;
    }
    let ghost;
    if(previous)ghost=poster(previous);else{ghost=document.createElement('div');ghost.className='screen-transition screen-brief';ghost.setAttribute('aria-hidden','true');ghost.innerHTML='<span>THE CLIENT BRIEF</span><h3>Make a complex offer worth exploring.</h3><p>Offer · Audience · Goal</p>';}
    phone.screen.append(ghost);
    const direction=previous&&previous.number>phone.number?-1:1;
    const incoming=phone.content.animate([{opacity:.2,transform:`translateY(${direction*9}%)`},{opacity:1,transform:'translateY(0)'}],{duration:1000,easing:'cubic-bezier(.2,.75,.2,1)'});
    const outgoing=ghost.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${-direction*12}%)`}],{duration:850,easing:'cubic-bezier(.2,.75,.2,1)'});
    outgoing.onfinish=()=>ghost.remove();phone.animations=[incoming,outgoing];
  }
  function savePosition(phone){const feed=doc()?.querySelector('#feed');if(isProduct(phone)&&feed)savedPositions.set(phone.number,feed.scrollTop);}
  function selectProduct(phone,previous,animate=true){
    if(!ready||phone!==current)return;const feed=doc()?.querySelector('#feed');if(!feed)return;
    cancelAnimationFrame(feedFrame);message('pitchdeck:pause');
    const editorial=doc().getElementById('higgsfield');
    const fallback=phone.number===9?0:(editorial?.offsetTop||0)+120;
    const target=Math.min(feed.scrollHeight-feed.clientHeight,savedPositions.get(phone.number)??(phone.number===11&&isProduct(previous)?feed.scrollTop:fallback));
    const start=isProduct(previous)?feed.scrollTop:target;
    const generation=transitionGeneration;
    const play=()=>{if(current===phone&&!still&&!exploring)message('pitchdeck:play');};
    if(still||!animate||Math.abs(target-start)<2){feed.scrollTop=target;play();return;}
    const began=performance.now();
    const step=now=>{if(current!==phone||generation!==transitionGeneration)return;const t=clamp((now-began)/1250),ease=t*t*(3-2*t);feed.scrollTop=start+(target-start)*ease;if(t<1)feedFrame=requestAnimationFrame(step);else{feedFrame=0;play();}};
    feedFrame=requestAnimationFrame(step);
  }
  player.addEventListener('load',()=>{ready=true;message('pitchdeck:pause');if(isProduct(current)){current.device.classList.add('has-live-player');selectProduct(current,null,false);player.style.opacity='1';if(!still)player.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});}});
  function activate(slide,reduced=still){
    still=reduced;const next=slide.classList.contains('pitch-act-two')?(phones.get(Number(slide.dataset.stage||slide.dataset.slide))||null):null;
    if(next===current)return;
    const previous=current;savePosition(previous);finishScreen(previous);cancelAnimationFrame(feedFrame);transitionGeneration++;message('pitchdeck:pause');
    current=next;setExploring(false);if(!next)return;
    const prior=previous||phones.get(next.number-1);
    if(isProduct(next)){
      phones.forEach(phone=>phone.device.classList.remove('has-live-player'));
      if(player.isConnected&&typeof next.content.moveBefore==='function')next.content.moveBefore(player,null);else{ready=false;player.style.opacity='0';next.content.append(player);}if(!player.getAttribute('src'))player.src='/continuous-stories/index.html';
      if(ready){next.device.classList.add('has-live-player');selectProduct(next,previous);}
    }
    animateScreen(next,prior);
  }
  function measure(){boxes=scenes.map(slide=>({slide,top:slide.getBoundingClientRect().top+scrollY,height:slide.offsetHeight}));update();}
  function update(){for(const {slide,top,height} of boxes)slide.style.setProperty('--act-exit',still?0:clamp((scrollY-top)/height).toFixed(3));}
  const fees={campaign:'Scope, creative production and launch of an agreed interactive campaign.',service:'Ongoing management, reporting and improvement, where the client needs continuing support.'};
  document.querySelectorAll('[data-fee]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-fee]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('.fee-explanation').textContent=fees[b.dataset.fee];showStatus(phones.get(7),b.dataset.fee==='campaign'?'Build & launch':'Support & improve',b.dataset.fee==='campaign'?'A campaign fee for agreed delivery.':'An ongoing service for reporting, management and improvement.');}));
  const sales={conversation:['Start with a buyer','Use a working demo to open a relevant conversation.'],brief:['Agree the brief','Define the offer, the audience and the outcome to evaluate.'],pilot:['Propose a paid pilot','Agree scope, delivery and measurement before launch.'],repeat:['Earn the next campaign','Review delivery and value with the client, then decide what to improve.']};
  document.querySelectorAll('[data-sales]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-sales]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));showStatus(phones.get(8),...sales[b.dataset.sales]);}));
  const gates={ready:'Readiness: a reviewed experience, clear delivery scope and an agreed measurement plan.',launch:'First evidence: evaluate initial campaigns with buyers, and test Bagel with a defined reader cohort.',prove:'Repeatability: assess delivery cost and quality, repeat demand, reader return and useful outcomes.'};
  document.querySelectorAll('[data-gate]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-gate]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('.gate-explanation').textContent=gates[b.dataset.gate];showStatus(phones.get(11),b.dataset.gate==='ready'?'Build & review':b.dataset.gate==='launch'?'Launch & measure':'Evaluate & improve',b.dataset.gate==='ready'?'A reviewed experience and a clear delivery scope.':b.dataset.gate==='launch'?'Initial campaigns and a defined reader cohort.':'Delivery economics, repeat demand and reader value.');}));
  new ResizeObserver(measure).observe(document.querySelector('#pitch'));addEventListener('resize',measure,{passive:true});document.fonts.ready.then(measure);
  return {activate,update,setReduced(value){still=value;if(value){phones.forEach(finishScreen);cancelAnimationFrame(feedFrame);}message(still||exploring||!isProduct(current)?'pitchdeck:pause':'pitchdeck:play');update();},replay(){if(!current)return;finishScreen(current);if(isProduct(current)){savedPositions.delete(current.number);selectProduct(current,null,false);}animateScreen(current,phones.get(current.number-1));},beforePrint(){phones.forEach(finishScreen);message('pitchdeck:pause');document.body.classList.add('printing-deck');},afterPrint(){document.body.classList.remove('printing-deck');if(isProduct(current)&&!still)message('pitchdeck:play');}};
}
