import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeWarehouse,makeEngine,makeConnection,block,finish,palette,decal,textTexture} from './experience-models.js';
import {mountSignalLinks} from './pitchdeck-signals.js';
const clamp=T.MathUtils.clamp,mix=T.MathUtils.lerp;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
const route=points=>new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],0,p[1])));
const smallRoute=route([[-.5,3],[-3.2,1.8],[-3.2,.45],[-3.5,2.1],[-5.7,3.4]]);
const largeRoute=route([[-5.7,3.4],[.2,3.7],[3,.8],[3.2,2.2],[5.9,3.5]]);

function storyPose(time,manual,manualTime,reduced){
 let t=time%42;
 let phase=manual||(t<2.7?'opening':t<11?'small':t<19?'large':t<24?'explore':t<32?'sensors':t<36?'hold':'reset');
 const local=manual?manualTime:phase==='small'?t-2.7:phase==='large'?t-11:phase==='explore'?t-19:phase==='sensors'?t-24:t-36;
 const pose={opening:manual||reduced?1:t>40?1-ramp(t,40,42):ramp(t,0,2),explosion:0,x:-.5,z:3,yaw:-.3,smallLoad:false,largeLoad:false,smallDelivered:false,largeDelivered:false,largeLayout:0,sensing:false,time};
 if(phase==='small'||phase==='large'){
  const big=phase==='large',u=clamp(local/6.5,0,1),curve=big?largeRoute:smallRoute,p=curve.getPoint(ease(u));
  const direction=curve.getTangent(Math.min(.999,ease(u)));pose.x=p.x;pose.z=p.z;pose.yaw=Math.atan2(direction.x,direction.z);
  pose.smallLoad=!big&&u>.36&&u<.96;pose.largeLoad=big&&u>.36&&u<.96;pose.smallDelivered=big||u>=.96;pose.largeDelivered=big&&u>=.96;pose.largeLayout=big?ramp(local,0,2):0;
 }else if(['explore','sensors','hold','reset'].includes(phase)){
  const enter=phase==='explore'?ramp(local,0,2.2):manual?ramp(local,0,1.5):1,reset=phase==='reset'?ramp(t,36,38.6):0;
  pose.explosion=enter*(1-reset);pose.x=mix(5.9,-.6,enter);pose.z=mix(3.5,1.5,enter);pose.yaw=mix(1.9,-.35,enter);pose.smallDelivered=pose.largeDelivered=true;pose.largeLayout=1;pose.sensing=phase==='sensors'||phase==='hold';
  pose.x=mix(pose.x,-.5,reset);pose.z=mix(pose.z,3,reset);pose.yaw=mix(pose.yaw,-.3,reset);
 }
 if(reduced)return {pose:{...pose,opening:1,explosion:0,x:-1,z:2.7,yaw:-.3,smallLoad:true,largeLoad:false,smallDelivered:true,largeDelivered:false,sensing:false},phase:'still'};
 return {pose,phase};
}

export function mountExperienceStudio(host){
 const s3=host.closest('section'),s4=document.querySelector('#slide-4'),stage4=s4.querySelector('.engine-studio-stage');
 const canvas=document.createElement('canvas');canvas.className='experience-studio-canvas';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch(error){s3.classList.remove('pdf-intro');canvas.remove();document.body.classList.add('studio-no-webgl');s3.querySelectorAll('[data-demo]').forEach(b=>b.disabled=true);s3.classList.add('has-static-demo');host.classList.add('warehouse-fallback');return {activate(){},update(){},setReduced(){},replay(){},replayEngine(){},beforePrint(){},afterPrint(){}};}
 host.querySelector('.warehouse-canvas').hidden=true;host.setAttribute('role','img');host.setAttribute('aria-label','Northline demo: a warehouse robot handles parcels and opens to reveal its sensors, lifting mechanism and drive wheels.');
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.setClearColor(0x091540,0);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-12,12,8,-8,.1,170);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.06).texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight('#dcefee','#0a182d',.85));const key=new T.DirectionalLight('#fff1d9',3.5);key.position.set(-9,19,13);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-22,right:22,top:22,bottom:-22});key.shadow.radius=3;key.shadow.normalBias=.045;key.shadow.bias=-.00015;scene.add(key);
 const rim=new T.DirectionalLight('#91dbe1',2.1);rim.position.set(16,9,-12);scene.add(rim);const fill=new T.DirectionalLight('#d9b5c1',.5);fill.position.set(6,5,18);scene.add(fill);
 const world=makeWarehouse(),secondary=makeWarehouse({secondary:true}),engine=makeEngine(),engineGroup=new T.Group(),cardGroup=new T.Group();scene.add(world.root,engineGroup,cardGroup);engineGroup.add(engine.root);engine.root.position.set(-3,0,-.8);engine.root.scale.setScalar(1.18);
 const card=block(cardGroup,7.2,.25,5.4,finish('#dce5d9',.3,.4),0,0,0,.18);cardGroup.position.set(7.8,3.6,.5);
 decal(cardGroup,textTexture('NORTHLINE     /     HANDLE THE LOAD',{font:'600 43px Arial',color:'#213a45'}),5.9,.21,0,.24,-2.46,[-Math.PI/2,0,0]);
 for(const [x,text] of [[-1.65,'Small parcels'],[1.65,'Large boxes']]){block(cardGroup,2.75,.055,.42,finish(x<0?'#203e4c':'#92bdb4'),x,.24,2.37,.065);decal(cardGroup,textTexture(text,{font:'500 48px Arial',color:x<0?'#f3f0e9':'#18343d'}),2.35,.22,x,.275,2.37,[-Math.PI/2,0,0]);}

 secondary.root.scale.setScalar(.22);secondary.root.position.set(9.2,1.3,-5.0);secondary.root.rotation.y=-.2;scene.add(secondary.root);const altBase=block(scene,4.4,.16,3.05,finish('#83aaa4',.3,.35),9.2,1.2,-5,.11);decal(altBase,textTexture('NORTHLINE  /  FIND YOUR WAY',{font:'600 45px Arial',color:'#18343d'}),3.8,.18,0,.095,-1.28,[-Math.PI/2,0,0]);
 const connections=new T.Group();scene.add(connections);const wires=[makeConnection(connections,[[-14,.4,1],[-10,.4,1],[-6.7,.4,0]],'#ef767a'),makeConnection(connections,[[.5,.5,0],[3,.5,0],[4.1,.5,.5]],'#55c4ac'),makeConnection(connections,[[8.2,3.5,-2],[9.2,2.2,-3.2],[9.2,1.5,-3.8]],'#63abcf')];
 const shadow=new T.Mesh(new T.PlaneGeometry(140,140),new T.ShadowMaterial({opacity:.27}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.64;shadow.receiveShadow=true;scene.add(shadow);
 const pointer=s3.querySelector('.demo-pointer'),buttons=[...s3.querySelectorAll('[data-demo]')],resume=s3.querySelector('.demo-resume'),phaseLabel=s3.querySelector('.warehouse-phase'),events=[...s3.querySelectorAll('[data-activity]')];s3.append(pointer);
 const signals=mountSignalLinks(s3,s4);
 const annotations=document.createElement('div');annotations.className='studio-annotations';annotations.setAttribute('aria-hidden','true');annotations.innerHTML='<span data-part="sensor">Sensors<i></i></span><span data-part="lift">Lifting mechanism<i></i></span><span data-part="wheel">Drive wheels<i></i></span>';document.body.append(annotations);
 const engineAnnotations=document.createElement('div');engineAnnotations.className='studio-engine-annotations';engineAnnotations.setAttribute('aria-hidden','true');engineAnnotations.innerHTML='<span>Scene</span><span>Robot</span><span>Choices</span><span>Interaction cues</span>';document.body.append(engineAnnotations);const printLabels=document.createElement('div');printLabels.className='studio-print-labels';printLabels.innerHTML='<span>Scene</span><span>Robot</span><span>Choices</span><span>Interaction cues</span>';stage4.append(printLabels);
 let box3,box4,top3=0,top4=0,height3=1,width=1,height=1,reduced=false,active=0,frame=0,last=0,clock=0,manual=null,manualClock=0,manualUntil=0,phase='',pointed='',pointerMotion=null,engineClock=0,engineFromDemo=false,scrollT=0,holdTime=null,printing=false;
 const recorded=new Set();let manualStart=null,currentPose=null,dirty=true,lastRender=0,lastLayoutProgress=-1;
 const engineSteps=[...s4.querySelectorAll('[data-engine-reveal]')],engineSkip=s4.querySelector('[data-reveal-skip]');s4.classList.add('is-revealing','engine-journey-live');
 function paintEngine(time){engineSteps.forEach((el,i)=>el.classList.toggle('is-revealed',time>=[0,.65,4.15,6.2,7.1][i]));engineSkip.hidden=time>=9;s4.classList.toggle('reveal-complete',time>=9);s4.style.setProperty('--engine-dispatch',ramp(time,6.2,7.4));}

 const phaseNames={opening:'THE EXPERIENCE OPENS AROUND THE PRODUCT',small:'SMALL PARCELS / PICK. CARRY. SORT.',large:'LARGE BOXES / A DIFFERENT JOB. A DIFFERENT ROUTE.',explore:'EXPLORE / INSIDE THE ROBOT',sensors:'SENSORS / SEE HOW IT SEES',hold:'FROM PRODUCT EXPLORATION TO OBSERVABLE CHOICES',reset:'ANOTHER JOB. ANOTHER WAY IN.',still:'SMALL PARCELS / LARGE BOXES / PRODUCT EXPLORATION'};
 function measure(){width=innerWidth;height=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,width<720?1.4:1.8));renderer.setSize(width,height,false);top3=s3.offsetTop;top4=s4.offsetTop;height3=s3.offsetHeight;const a=host.getBoundingClientRect(),b=stage4.getBoundingClientRect();box3={x:a.left,y:a.top+scrollY-top3,w:a.width,h:a.height};box4={x:b.left,y:b.top+scrollY-top4,w:b.width,h:b.height};signals.measure();update();}
 function mark(key){recorded.add(key);events.forEach(li=>li.classList.toggle('is-recorded',recorded.has(li.dataset.activity)));signals.record(key);}
 function ui(next){if(next===phase)return;phase=next;if(next==='opening'){recorded.clear();signals.reset();events.forEach(li=>li.classList.remove('is-recorded'));}if(['small','large','sensors'].includes(next))mark(next);phaseLabel.textContent=phaseNames[next];buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demo===next)));s3.classList.toggle('is-cutaway',['explore','sensors','hold'].includes(next));}
 function pointAt(next){const button=buttons.find(b=>b.dataset.demo===next);if(!button)return;const a=button.getBoundingClientRect(),b=s3.getBoundingClientRect();pointer.style.left=`${a.left-b.left+a.width*.73}px`;pointer.style.top=`${a.top-b.top+a.height*.6}px`;pointerMotion?.cancel();pointerMotion=pointer.animate([{opacity:0,transform:'translate(24px,24px)'},{opacity:1,transform:'translate(0,0)',offset:.45},{opacity:1,transform:'scale(.78)',offset:.65},{opacity:1,transform:'scale(1)',offset:.8},{opacity:0}],{duration:1400,fill:'forwards'});}
 function project(object,offset,el,rect,{dx=0,dy=0}={}){const v=object.localToWorld(new T.Vector3(...offset)).project(camera);el.style.transform=`translate(${rect.x+(v.x+1)*rect.w/2+dx}px,${rect.y+(1-v.y)*rect.h/2+dy}px) translate(-50%,-100%)`;}
 function renderAt(p,rect,{capture=false,staticStory=false}={}){
  if(rect.w<2||rect.h<2)return;
  const story=storyPose(Math.max(0,(holdTime??clock)-3.2),manual,manualClock,reduced||staticStory);let pose=story.pose;const pdfIntro=!capture&&!reduced&&p<.005&&clock<2.8&&!manual;if(!capture){s3.classList.toggle('pdf-intro',pdfIntro);canvas.style.opacity=pdfIntro?'0':'1';}
  if(manualStart&&manual){const e=ramp(manualClock,0,.85);for(const name of ['x','z','yaw','explosion'])pose[name]=mix(manualStart[name],pose[name],e);}
  currentPose={...pose};
  const fold=ramp(p,0,.3);pose={...pose,explosion:pose.explosion*(1-fold),sensing:pose.sensing&&p<.05,opening:mix(pose.opening,1,fold),x:mix(pose.x,-.5,fold),z:mix(pose.z,2.6,fold),yaw:mix(pose.yaw,-.3,fold),smallLoad:fold>.6?true:pose.smallLoad,largeLoad:fold>.6?false:pose.largeLoad};
  shadow.material.opacity=mix(.23,.1,p);
  const f=ramp(p,.06,.96),engineTime=reduced||staticStory?10:engineClock,engineAmount=ramp(p,.2,.86)*Math.max(.12,ramp(engineTime,.65,4.6)),mainAmount=reduced||staticStory||engineFromDemo||active!==4?1:ramp(engineTime,4.15,5.15),secondAmount=ramp(engineTime,4.9,6.15),dispatch=ramp(engineTime,6.2,7.4)*f;if(!capture)paintEngine(engineTime);
  world.pose(pose);world.root.scale.setScalar(mix(1,.36,f)*mix(.12,1,pose.opening)*mix(1,mainAmount,f));world.root.position.set(mix(0,6.7,f)+dispatch*1.1,mix(0,4.05,f)-dispatch*.27,mix(0,-.3,f)+dispatch*.8);world.root.rotation.y=mix(0,.03,f);cardGroup.position.copy(world.root.position);cardGroup.position.y-=.18;
  engineGroup.visible=cardGroup.visible=secondary.root.visible=altBase.visible=connections.visible=p>.005;engine.reveal(engineAmount,engineTime);cardGroup.scale.setScalar(Math.max(.001,ramp(p,.42,.87)*mainAmount));
  const altProgress=ramp(engineTime,5.0,6.7);secondary.pose({opening:1,largeLayout:1,x:mix(-3.2,2.8,altProgress),z:mix(2.4,.7,altProgress),yaw:-.8,largeLoad:true});
  secondary.root.scale.setScalar(.22*ramp(p,.62,1)*secondAmount);secondary.root.position.set((width<721?6.5:8.5)+dispatch*.7,1.3,-5.3+dispatch*.3);altBase.position.copy(secondary.root.position);altBase.position.y-=.1;altBase.scale.setScalar(Math.max(.001,ramp(p,.62,1)*secondAmount));
  connections.children.forEach(m=>{if(m.material)m.material.opacity=.4*engineAmount;});wires.forEach((wire,i)=>{const u=(engineTime*.18-i*.22)%1;wire.dot.position.copy(wire.curve.getPoint(Math.max(0,u)));wire.dot.visible=engineTime>i*2&&engineTime<8.8&&u>=0;});
  const aspect=rect.w/rect.h,cut=pose.explosion*(1-f);let span=aspect<1.1?12:8.1;span=mix(span,span*.8,cut);span=mix(span,Math.max(width<721?8.7:7.3,12.3/aspect),f);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.position.set(mix(19,18,f)-cut*6,mix(18,15,f)-cut*5,mix(25,25,f)-cut*5);camera.lookAt(mix(0,1.7,f),mix(.25,3.8,f)+cut*1.4,mix(0,-.1,f)+cut*1.5);camera.updateProjectionMatrix();
  renderer.setViewport(rect.x,height-rect.y-rect.h,rect.w,rect.h);renderer.setScissor(rect.x,height-rect.y-rect.h,rect.w,rect.h);renderer.setScissorTest(true);renderer.render(scene,camera);renderer.setScissorTest(false);if(p>.98&&active===4&&!capture){const v=world.root.localToWorld(new T.Vector3(0,.3,2)).project(camera);signals.engineTime(engineTime,{x:rect.x+(v.x+1)*rect.w/2,y:rect.y+(1-v.y)*rect.h/2},reduced);}
  if(capture&&p===1)engine.layers.forEach((layer,i)=>{const v=layer.localToWorld(new T.Vector3(-2.6,.25,1.1)).project(camera);printLabels.children[i].style.left=`${(v.x+1)*50}%`;printLabels.children[i].style.top=`${(1-v.y)*50}%`;});
  if(!capture){ui(story.phase);const showAnnotations=cut>.75&&p<.01&&!reduced;annotations.hidden=!showAnnotations;if(showAnnotations){project(world.robot.sensor,[0,.5,0],annotations.children[0],rect,{dx:65,dy:-14});project(world.robot.lift,[-1.1,1.65,0],annotations.children[1],rect,{dx:-45,dy:-6});project(world.robot.g,[2.1,.55,.65],annotations.children[2],rect,{dx:30,dy:13});}engineAnnotations.hidden=p<.9||width<721||engineTime<4.7;if(p>=.9&&width>=721&&engineTime>=4.7)engine.layers.forEach((layer,i)=>project(layer,[-2.6,.25,1.1],engineAnnotations.children[i],rect,{dx:-19,dy:-4}));}
 }
 function geometry(){const y3=top3-scrollY,y4=top4-scrollY;const raw=clamp((scrollY-top3)/(top4-top3),0,1);scrollT=raw;signals.update(raw);if(Math.abs(raw-lastLayoutProgress)>.001){s3.style.setProperty('--studio-exit',ramp(raw,.04,.25));s4.style.setProperty('--studio-enter',ramp(raw,.92,.995));lastLayoutProgress=raw;}pointer.style.visibility=raw>.02?'hidden':'visible';if(raw>.002&&raw<.998){if(holdTime===null)holdTime=clock;}else holdTime=null;
  if(y3>0)return {p:0,rect:{...box3,y:box3.y+y3}};
  if(y4<0)return {p:1,rect:{...box4,y:box4.y+y4}};
  const t=ease(raw);return {p:raw,rect:{x:mix(box3.x,box4.x,t),y:mix(box3.y,box4.y,t),w:mix(box3.w,box4.w,t),h:mix(box3.h,box4.h,t)}};
 }
 function draw(){if(printing||!box3)return;const y3=top3-scrollY,y4=top4-scrollY;const visible=y3<height&&y4+s4.offsetHeight>0;canvas.hidden=!visible;annotations.hidden=true;engineAnnotations.hidden=true;if(!visible){signals.update(0);return;}renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.clear();const {p,rect}=geometry();renderAt(reduced?(active===4?1:0):p,rect);if(reduced){events.forEach(li=>li.classList.add('is-recorded'));buttons.forEach(b=>b.setAttribute('aria-pressed','false'));}}
 function tick(now){frame=0;if(printing)return;if(!active){if(dirty){draw();dirty=false;}return;}const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(!reduced){if(active===3&&scrollT<.02){clock+=dt;if(manual)manualClock+=dt;}if(active===4&&scrollT>.96)engineClock+=dt;if(manual&&active===3&&scrollT<.02&&now>manualUntil){manual=null;manualStart=null;clock=3.2;resume.hidden=true;phase='';}if(!manual&&active===3&&scrollT<.01){const t=Math.max(0,clock-3.2)%42;for(const [key,at] of [['small',2.7],['large',11],['explore',19],['sensors',24]])if(t>=at-.75&&t<at&&pointed!==key){pointed=key;pointAt(key);}if(t<1)pointed='';}}
  if(dirty||now-lastRender>=32){draw();dirty=false;lastRender=now;}if(!reduced&&(active!==4||scrollT<.998||engineClock<10))frame=requestAnimationFrame(tick);
 }
 function update(){dirty=true;if(!frame&&!printing)frame=requestAnimationFrame(tick);}
 function activate(id){const next=id==='slide-3'?3:id==='slide-4'?4:0;if(next===active)return;if(next===4){engineFromDemo=active===3;engineClock=0;}if(next===3&&manual&&active!==3)manualUntil=performance.now()+18000;active=next;cancelAnimationFrame(frame);frame=0;last=0;if(!active){pointerMotion?.cancel();annotations.hidden=true;engineAnnotations.hidden=true;draw();return;}draw();if(!reduced&&(active!==4||scrollT<.998||engineClock<10))frame=requestAnimationFrame(tick);}
 s4.querySelector('[data-reveal-skip]').addEventListener('click',()=>{engineClock=10;draw();});
 buttons.forEach(button=>button.addEventListener('click',()=>{manualStart=currentPose?{...currentPose}:null;manual=button.dataset.demo;manualClock=0;manualUntil=performance.now()+18000;phase='';resume.hidden=false;draw();}));resume.addEventListener('click',()=>{manual=null;manualStart=null;clock=3.2;phase='';resume.hidden=true;draw();});
 function capture(p,target){const rect=target.getBoundingClientRect();const w=Math.round(rect.width),h=Math.round(rect.height);if(w<2||h<2)return null;const saved={width,height};width=w;height=h;renderer.setPixelRatio(2);renderer.setSize(w,h,false);renderer.setScissorTest(false);renderer.clear();const saveActive=active,saveEngineClock=engineClock;active=p?4:3;engineClock=10;renderAt(p,{x:0,y:0,w,h},{capture:true,staticStory:true});const png=canvas.toDataURL('image/png');active=saveActive;engineClock=saveEngineClock;width=saved.width;height=saved.height;return png;}
 function refreshAssetStills(){
  const target={getBoundingClientRect:()=>({width:720,height:420})};const png=capture(0,target);if(png){document.querySelector('.warehouse-output').src=png;document.querySelector('.setting-asset').src=png;}const enginePng=capture(1,target);if(enginePng)stage4.querySelector('.engine-studio-print').src=enginePng;engineGroup.visible=cardGroup.visible=secondary.root.visible=altBase.visible=connections.visible=false;
  world.context.visible=false;world.robot.cargo.visible=false;world.root.position.set(0,0,0);world.root.scale.setScalar(1);world.robot.g.position.set(0,0,0);world.robot.g.rotation.y=-.35;
  renderer.setPixelRatio(2);renderer.setSize(720,450,false);renderer.setScissorTest(false);renderer.setViewport(0,0,720,450);renderer.clear();camera.left=-3.8;camera.right=3.8;camera.top=2.5;camera.bottom=-2.5;camera.position.set(7,4.8,9);camera.lookAt(0,1,0);camera.updateProjectionMatrix();renderer.render(scene,camera);document.querySelector('.robot-asset').src=canvas.toDataURL('image/png');world.context.visible=true;measure();
 }
 addEventListener('resize',measure,{passive:true});const ro=new ResizeObserver(measure);ro.observe(host);ro.observe(stage4);document.fonts.ready.then(measure);measure();refreshAssetStills();
 return {activate,update,setReduced(value){reduced=value;signals.setReduced(value);pointerMotion?.cancel();cancelAnimationFrame(frame);frame=0;last=0;draw();if(active&&!value)frame=requestAnimationFrame(tick);},replay(){clock=0;manual=null;manualStart=null;phase='';recorded.clear();signals.reset();resume.hidden=true;draw();},replayEngine(){engineClock=0;engineFromDemo=false;draw();update();},beforePrint(){printing=true;s3.classList.remove('pdf-intro');signals.setReduced(true);cancelAnimationFrame(frame);frame=0;const a=capture(0,host),b=capture(1,stage4);if(a)host.querySelector('.warehouse-print').src=a;if(b)stage4.querySelector('.engine-studio-print').src=b;events.forEach(li=>li.classList.add('is-recorded'));annotations.hidden=engineAnnotations.hidden=true;},afterPrint(){printing=false;signals.setReduced(reduced);measure();if(active&&!reduced)frame=requestAnimationFrame(tick);},destroy(){cancelAnimationFrame(frame);ro.disconnect();signals.destroy();canvas.remove();annotations.remove();engineAnnotations.remove();renderer.dispose();}};
}
