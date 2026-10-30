import {createPaperWave} from './scrapbook-scene.js?v=75ab22b8c4eb';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// All movement is a pure function of feed position. There is no elapsed-time animation.
const feed=document.querySelector('#feed'),story=document.querySelector('#journey'),stage=story.querySelector('.journey-stage'),host=document.querySelector('#journeyWorld'),phrase=document.querySelector('#journeyPhrase');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const phase=(p,a,b)=>clamp((p-a)/(b-a),0,1),ease=x=>x*x*(3-2*x),beat=(p,a,b)=>ease(phase(p,a,b));
let seed=628;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
let renderer,composer,frame=0,visible=true,progress=0,contextLost=false,renderCost=16,renderSamples=0,qualityScale=1.5;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.035,2400);scene.add(camera);
const city=new THREE.Group(),islands=new THREE.Group(),meadow=new THREE.Group();scene.add(city,islands,meadow);meadow.position.z=-200;
const uniforms={phase:{value:0},day:{value:0},under:{value:0},meadowSky:{value:0}};
function mat(color,roughness=.6,metalness=0,extra={}){return new THREE.MeshStandardMaterial({color,roughness,metalness,...extra})}
function mesh(geo,material,parent=scene,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m}
function box(w,h,d,material,parent,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z)}
const dummy=new THREE.Object3D(),color=new THREE.Color();
function instances(geo,material,count,parent,setup){const m=new THREE.InstancedMesh(geo,material,count);for(let i=0;i<count;i++){dummy.position.set(0,0,0);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);setup(dummy,i,m);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)}m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;if(parent===meadow){m.receiveShadow=true;m.castShadow=geo.attributes.position.count<200&&count<6000;}parent.add(m);return m}
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,255,255,.7)');g.addColorStop(.4,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
const halo=glowTexture();
function lamp(x,y,z,tint,size,parent=city){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:halo,color:tint,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.set(x,y,z);s.scale.set(size,size,1);parent.add(s);return s}

// Atmosphere, shared from midnight through tropical morning to golden meadow.
const sky=mesh(new THREE.SphereGeometry(1800,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uDay:uniforms.day,uPhase:uniforms.phase,uMeadowMix:uniforms.meadowSky,uMeadow:{value:null}},vertexShader:`varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vDir;uniform float uDay;uniform float uPhase;uniform float uMeadowMix;uniform sampler2D uMeadow;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec3 d=normalize(vDir);float y=max(d.y,0.);vec3 night=mix(vec3(.009,.027,.055),vec3(.001,.003,.012),pow(y,.55));vec3 day=mix(vec3(.78,.88,.86),vec3(.14,.47,.66),pow(y,.55));vec3 c=mix(night,day,uDay);vec3 sun=normalize(vec3(-.6,.32,-.7));float sd=max(dot(d,sun),0.);c+=vec3(1.,.72,.4)*pow(sd,90.)*uDay*.65;c+=vec3(1.,.95,.8)*pow(sd,1800.)*uDay*2.;float clouds=smoothstep(.67,.92,sin(d.x*13.+sin(d.z*7.))*sin(d.z*17.+d.x*5.)*.5+.5);c=mix(c,vec3(.98,.93,.83),clouds*uDay*.26*smoothstep(.04,.25,y)*(1.-smoothstep(.5,.8,y)));if(uMeadowMix>0.){vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159265+.5);vec3 photographicSky=texture2D(uMeadow,uv).rgb*.7;c=mix(c,photographicSky,uMeadowMix);}gl_FragColor=vec4(c,1.);}`}),scene);
const starPositions=[];for(let i=0;i<650;i++){const a=rnd()*Math.PI*2,y=.12+rnd()*.85,r=Math.sqrt(1-y*y);starPositions.push(Math.cos(a)*r*1500,y*1500,Math.sin(a)*r*1500)}
const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const starMat=new THREE.PointsMaterial({color:'#c7dceb',size:1.25,transparent:true,depthWrite:false});scene.add(new THREE.Points(starsGeo,starMat));
const hemi=new THREE.HemisphereLight('#9bc6ef','#071a27',1);scene.add(hemi);const sun=new THREE.DirectionalLight('#ffddb2',1);sun.position.set(-70,100,-150);scene.add(sun);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:180});sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;const rim=new THREE.DirectionalLight('#71b6db',.8);rim.position.set(60,30,40);scene.add(rim);
scene.fog=new THREE.FogExp2('#071523',.0038);

// Moving-water shader: reflections, long swells, lagoon shallows and shoreline foam.
const oceanGeo=new THREE.PlaneGeometry(1800,1800,150,150);oceanGeo.rotateX(-Math.PI/2);
const oceanMaterial=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uDay:uniforms.day,uPhase:uniforms.phase,uUnder:uniforms.under,cameraWorld:{value:new THREE.Vector3()}},vertexShader:`uniform float uPhase;varying vec3 vWorld;varying vec3 vNormal;void main(){vec3 p=position;float t=uPhase*22.;p.y+=sin(p.x*.045+t)*.19+sin(p.z*.08-t*.8)*.12+sin((p.x+p.z)*.18+t)*.055;vNormal=normalize(vec3(-cos(p.x*.045+t)*.00855-cos((p.x+p.z)*.18+t)*.0099,1.,-cos(p.z*.08-t*.8)*.0096-cos((p.x+p.z)*.18+t)*.0099));vWorld=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,fragmentShader:`
 uniform float uDay;uniform float uPhase;uniform float uUnder;uniform vec3 cameraWorld;
 varying vec3 vWorld;varying vec3 vNormal;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.07)*.12+noise(p*8.11)*.05;}
 float ripple(vec2 p,float t){return sin(p.x*1.9+p.y*.85+t)*.025+sin(p.y*3.1-p.x*.4-t*.7)*.014+sin(p.x*7.+p.y*5.+t*.6)*.004;}
 void main(){
 vec3 view=normalize(cameraWorld-vWorld);float t=uPhase*24.;vec2 p=vWorld.xz;
 float e=.05,dx=(ripple(p+vec2(e,0.),t)-ripple(p-vec2(e,0.),t))/(2.*e),dz=(ripple(p+vec2(0.,e),t)-ripple(p-vec2(0.,e),t))/(2.*e);
 vec3 n=normalize(vNormal+vec3(-dx,0.,-dz));float fresnel=.02+.98*pow(1.-max(dot(view,n),0.),5.);
 vec2 island=(p-vec2(42.,-230.))/vec2(1.,.8);float shore=length(island),a=atan(island.y,island.x),edge=45.+sin(a*3.)*5.+sin(a*7.)*2.;
 float depth=max(0.,shore-edge),shallow=exp(-depth*.045);float texture=fbm(p*.13);
 vec3 deep=mix(vec3(.002,.008,.018),vec3(.012,.17,.23),uDay);
 vec3 lagoon=mix(vec3(.035,.35,.34),vec3(.14,.59,.53),texture);
 vec3 water=mix(deep,lagoon,shallow*uDay);
 // Visible sandy seabed falls away with depth; refraction follows the wave normals.
 float sand=fbm((p+n.xz*2.)*.55);water+=vec3(.2,.21,.11)*(sand-.3)*exp(-depth*.08)*uDay;
 vec3 reflected=mix(vec3(.018,.045,.075),vec3(.49,.72,.77),uDay);water=mix(water,reflected,fresnel*.8);
 float caustic=pow(1.-abs(sin(p.x*1.7+sin(p.y*1.5+t*.14))*cos(p.y*1.8+sin(p.x+t*.17))),18.);
 water+=vec3(.25,.35,.22)*caustic*exp(-depth*.055)*uDay*.3;
 float surf=depth+sin(a*19.+t*.2)*.3,breakup=fbm(p*2.3+n.xz*3.);
 float foam=(1.-smoothstep(.1,1.6,abs(surf-1.5-sin(t+shore)*.6)))*smoothstep(.25,.7,breakup);
 foam+=.35*(1.-smoothstep(.1,.6,abs(surf-4.-sin(t*.7)*.5)))*smoothstep(.5,.8,breakup);
 water=mix(water,vec3(.89,.94,.85),foam*uDay*.8);
 vec3 light=normalize(vec3(-.6,.6,-.5));float spec=pow(max(dot(reflect(-light,n),view),0.),250.);
 water+=mix(vec3(.1,.4,.65),vec3(1.,.89,.67),uDay)*spec*2.;
 water=mix(water,vec3(.012,.22,.26),uUnder*.75);gl_FragColor=vec4(water,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
const ocean=mesh(oceanGeo,oceanMaterial,scene,0,-.45,-160);

// Midnight waterfront. Real geometry, individual lit windows and matte roadway.
const concrete=mat('#16232c',.75,.2),asphalt=mat('#101b25',.9,.02),metal=mat('#213a49',.34,.72),warmLight=mat('#ffcca1',.3,.1,{emissive:'#ff9e54',emissiveIntensity:3.5}),cyanLight=mat('#83d4e8',.3,.15,{emissive:'#4dcce8',emissiveIntensity:2.4});
box(18,.5,168,asphalt,city,0,-.25,-14);box(120,.7,165,concrete,city,-69,-.42,-14);box(120,.7,165,concrete,city,69,-.42,-14);box(260,1,225,concrete,city,0,-.7,-487.5);box(18,.5,225,asphalt,city,0,-.1,-487.5);
instances(new THREE.BoxGeometry(.16,.015,2.6),mat('#c1b09b',.7),29,city,(d,i)=>d.position.set(0,.03,66-i*5.5));
const buildings=[];for(let i=0;i<120;i++){const side=i%2?1:-1,cell=i%60,row=Math.floor(cell/6),column=Math.floor(cell/2)%3,z=i<60?65-row*18:-382-row*22,x=side*(19+column*25+(rnd()-.5)*3),w=8+rnd()*9,depth=10+rnd()*7,h=14+Math.pow(rnd(),1.4)*112;buildings.push({x,z,w,depth,h:z< -205&&Math.abs(x)<Math.max(32,(-z-215)*.42)?Math.min(h,32):h,shade:rnd()});}
const buildingMat=mat('#243c4e',.34,.5);
instances(new THREE.BoxGeometry(1,1,1),buildingMat,buildings.length,city,(d,i,m)=>{const b=buildings[i];d.position.set(b.x,b.h/2,b.z);d.scale.set(b.w,b.h,b.depth);color.setHSL(.56+b.shade*.05,.16,.09+b.shade*.08);m.setColorAt(i,color)});
const windows=[];for(const b of buildings){const cols=Math.floor(b.w/1.7),rows=Math.floor(b.h/2.5);for(let row=1;row<rows;row++)for(let c=0;c<cols;c++){if(rnd()<.46)continue;const x=b.x-b.w/2+1+c*1.7,y=row*2.5;windows.push([x,y,b.z+b.depth/2+.025,rnd()]);windows.push([x,y,b.z-b.depth/2-.025,rnd(),false,true]);windows.push([b.x+(b.x>0?-b.w/2:b.w/2),y,b.z-b.depth/2+c*1.6,rnd(),true]);}}
// Recessed rooflines and stepped crowns break up the skyline's silhouette.
instances(new THREE.BoxGeometry(1,1,1),metal,buildings.length*3,city,(d,i)=>{const b=buildings[Math.floor(i/3)],part=i%3;if(part===0){d.position.set(b.x,b.h+.2,b.z);d.scale.set(b.w+1,.4,b.depth+1)}else if(part===1){d.position.set(b.x,b.h+1.3,b.z);d.scale.set(b.w*.45,2.4,b.depth*.5)}else{d.position.set(b.x,b.h*.64,b.z);d.scale.set(b.w+.25,.24,b.depth+.25)}});
const windowMat=new THREE.MeshBasicMaterial({color:'white'});instances(new THREE.PlaneGeometry(.65,1.12),windowMat,windows.length,city,(d,i,m)=>{const [x,y,z,r,side,back]=windows[i];d.position.set(x,y,z);if(back)d.rotation.y=Math.PI;if(side)d.rotation.y=x>0?-Math.PI/2:Math.PI/2;color.set(r>.75?'#a8dce4':r>.25?'#f6b87f':'#5a8eaf');color.multiplyScalar(r>.45?1.8:.7);m.setColorAt(i,color)});
// The phrase belongs to the waterfront: each dot is a window on a real tower.
// Surrounding occupied rooms extinguish in staggered waves; the letter windows stay lit.
const letterPixels={S:['01111','10000','10000','01110','00001','00001','11110'],O:['01110','10001','10001','10001','10001','10001','01110'],M:['10001','11011','10101','10101','10001','10001','10001'],E:['11111','10000','10000','11110','10000','10000','11111'],T:['11111','00100','00100','00100','00100','00100','00100'],I:['11111','00100','00100','00100','00100','00100','11111'],H:['10001','10001','10001','11111','10001','10001','10001'],J:['00111','00010','00010','00010','10010','10010','01100'],U:['10001','10001','10001','10001','10001','10001','01110'],R:['11110','10001','10001','11110','10100','10010','10001'],N:['10001','11001','11001','10101','10011','10011','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],'.':['00000','00000','00000','00000','00000','00100','00100']};
for(let i=0;i<16;i++){const z=65-i*11;for(const x of [-10,10]){mesh(new THREE.CylinderGeometry(.09,.13,6,8),metal,city,x,3,z);box(1.4,.09,.32,warmLight,city,x+(x>0?-.6:.6),6,z);lamp(x,6,z,'#ffb978',5);}}
for(let i=0;i<15;i++){const b=buildings[i*7];box(.15,Math.min(b.h-2,25),.15,i%2?cyanLight:warmLight,city,b.x-b.w/2-.05,b.h*.55,b.z+b.depth/2+.1)}
const headlight=new THREE.SpotLight('#d2e6eb',55,90,.4,.65,1.4);camera.add(headlight,headlight.target);headlight.position.set(0,-.45,-1);headlight.target.position.set(0,-1,-45);

// Bascule bridge: animated leaf, steel ribs, lit rails and far counter-leaf.
const bridge=new THREE.Group();bridge.position.set(0,0,-100);city.add(bridge);const bridgeLeaf=new THREE.Group();bridge.add(bridgeLeaf);
box(17,.7,50,asphalt,bridgeLeaf,0,-.35,-25);box(18,.8,1,metal,bridgeLeaf,0,-.8,-1);
for(const x of [-8.8,8.8]){box(.22,1.1,50,metal,bridgeLeaf,x,1,-25);box(.075,.06,50,cyanLight,bridgeLeaf,x,1.55,-25);for(let i=0;i<=10;i++){box(.15,1.6,.15,metal,bridgeLeaf,x,.7,-i*5);const beam=box(.12,.12,7,metal,bridgeLeaf,x,.2,-i*5-2.5);beam.rotation.x=.18}for(let i=0;i<6;i++)lamp(x,1.6,-i*9,'#83daf1',2,bridgeLeaf)}
const farLeaf=bridgeLeaf.clone();farLeaf.position.z=-100;farLeaf.rotation.y=Math.PI;bridge.add(farLeaf);
for(const z of [-101,-199])for(const x of [-11.5,11.5]){box(3.5,16,4,metal,city,x,6,z);box(2,.18,3.8,cyanLight,city,x,14,z);lamp(x,15,z,'#e4c89a',6)}
const cockpit=new THREE.Group();camera.add(cockpit);
const cockpitFallback=new THREE.Group();cockpit.add(cockpitFallback);box(2.5,.42,.7,mat('#111a20',.5),cockpitFallback,0,-.77,-.95);const wheel=mesh(new THREE.TorusGeometry(.24,.025,12,60),mat('#1a242b',.32,.3),cockpitFallback,-.25,-.5,-.65);wheel.rotation.x=-.25;box(.38,.11,.04,metal,cockpitFallback,-.25,-.5,-.65);for(const x of [-1.03,1.03]){const a=box(.055,1.5,.08,metal,cockpitFallback,x,.12,-1.15);a.rotation.z=x>0?.26:-.26;}box(2.4,.055,.08,metal,cockpitFallback,0,.82,-1.3);
// Glass fragments leave only at the ejection beat; they reverse with the scroll.
const shards=new THREE.Group();scene.add(shards);for(let i=0;i<26;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,.2,0,-.1,-.1,0,.15,-.05,.01],3));g.computeVertexNormals();const m=mesh(g,mat('#a3d7df',.07,.05,{transparent:true,opacity:.32,side:THREE.DoubleSide}),shards);m.userData={x:(rnd()-.5)*4,y:rnd()*3,z:-rnd()*7,spin:rnd()*8};}

// Tropical land has a genuine irregular beach profile and smooth terrain normals.
const landGeo=new THREE.PlaneGeometry(160,160,128,128);landGeo.rotateX(-Math.PI/2);const landColors=[];const pos=landGeo.attributes.position;
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),a=Math.atan2(z,x),r=Math.hypot(x,z/.8),edge=45+Math.sin(a*3)*5+Math.sin(a*7)*2;let h=r>edge?-3-Math.min(35,(r-edge)*2.3):Math.max(-1,(edge-r)*.35);h+=Math.max(0,1-r/36)*Math.sin(x*.12)*Math.cos(z*.1)*7;pos.setY(i,h);const c=new THREE.Color(h<2.6?'#eee4c5':h<5?'#88916a':'#395944');c.multiplyScalar(.88+rnd()*.18);landColors.push(c.r,c.g,c.b)}landGeo.computeVertexNormals();landGeo.setAttribute('color',new THREE.Float32BufferAttribute(landColors,3));
const landMaterial=mat('white',.95,0,{vertexColors:true});landMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('diffuseColor *= sampledDiffuseColor;','diffuseColor *= mix(vec4(1.0),sampledDiffuseColor,.25);'));};mesh(landGeo,landMaterial,islands,42,-1,-230);
const trunkMat=mat('#78674d',.95),leafMat=mat('#547247',.76,0,{side:THREE.DoubleSide});
function islandHeight(x,z){const a=Math.atan2(z,x),r=Math.hypot(x,z/.8),edge=45+Math.sin(a*3)*5+Math.sin(a*7)*2;return r>edge?-3:Math.max(-1,(edge-r)*.35)+Math.max(0,1-r/36)*Math.sin(x*.12)*Math.cos(z*.1)*7;}
function palm(x,z,h,rotation){const group=new THREE.Group();group.position.set(x,islandHeight(x-42,z+230)-1,z);group.rotation.y=rotation;islands.add(group);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.3,h*.4,0),new THREE.Vector3(1,h*.8,.2),new THREE.Vector3(1.4,h,.1)]);mesh(new THREE.TubeGeometry(curve,12,.16,7,false),trunkMat,group);for(let k=0;k<10;k++){
 const a=k*Math.PI*2/10,vertices=[],indices=[],len=h*.48;
 const point=(t,side,width)=>{const along=t*len;return [1.4+Math.cos(a)*along+Math.cos(a+Math.PI/2)*width*side,h+Math.sin(t*Math.PI)*.75-t*t*2.1,.1+Math.sin(a)*along+Math.sin(a+Math.PI/2)*width*side];};
 for(let j=0;j<20;j++){const t=.06+j*.044,w=Math.sin(t*Math.PI)*.68;for(const side of [-1,1]){
 const base=vertices.length/3;vertices.push(...point(t,side,.015),...point(t+.075,side,w),...point(t+.025,side,w*.86),...point(t+.015,side,.015));indices.push(base,base+1,base+2,base,base+2,base+3);
 }}
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setIndex(indices);geom.computeVertexNormals();mesh(geom,leafMat,group);
}}

for(let i=0;i<45;i++){const a=rnd()*Math.PI*2,r=12+rnd()*23;palm(42+Math.cos(a)*r,-230+Math.sin(a)*r*.78,5+rnd()*5,rnd()*6.28)}
const rockMat=mat('#8c9281',.9);instances(new THREE.DodecahedronGeometry(1,2),rockMat,38,islands,(d,i,m)=>{const a=rnd()*6.28,r=38+rnd()*14;d.position.set(42+Math.cos(a)*r,-.15,-230+Math.sin(a)*r*.8);d.scale.set(1+rnd()*4,.5+rnd()*2,1+rnd()*3);d.rotation.set(rnd(),rnd(),rnd());});

// A brief underwater volume makes the surface crossing readable before earth emerges.
const bubblesGeo=new THREE.BufferGeometry(),bubblePositions=[];for(let i=0;i<130;i++)bubblePositions.push((rnd()-.5)*9,(rnd()-.5)*10,-200+(rnd()-.5)*9);bubblesGeo.setAttribute('position',new THREE.Float32BufferAttribute(bubblePositions,3));
const bubbles=new THREE.Points(bubblesGeo,new THREE.PointsMaterial({map:halo,color:'#c5f5e1',size:.11,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.65}));scene.add(bubbles);
// Asset loads enhance the working geometric scene without delaying the first frame.
const loader=new GLTFLoader();
loader.load('./assets/journey/cockpit.glb',gltf=>{const model=gltf.scene;model.rotation.y=Math.PI;model.position.set(.37,-1.05,.25);model.traverse(n=>{if(!n.isMesh)return;if(/_body$/.test(n.name)){const g=n.geometry.clone(),a=g.attributes.position,index=g.index,keep=[];for(let i=0;i<(index?index.count:a.count);i+=3){const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k),x=ids.reduce((v,j)=>v+a.getX(j),0)/3,y=ids.reduce((v,j)=>v+a.getY(j),0)/3;if(y>1.08&&Math.abs(x)<.79)continue;keep.push(...ids)}g.setIndex(keep);n.geometry=g;}if(/glass/.test(n.name)){n.material=n.material.clone();n.material.transparent=true;n.material.opacity=.035;n.material.depthWrite=false}if(n.material?.emissive)n.material.emissiveIntensity=Math.min(n.material.emissiveIntensity||.1,1.4)});cockpit.add(model);cockpitFallback.visible=false;stage.dataset.cockpit='loaded';request()},undefined,error=>{console.warn('Car interior enhancement unavailable.',error);stage.dataset.cockpit='fallback'});
let nightEnvironment=null,meadowEnvironment=null;new HDRLoader().load('./assets/journey/city-night.hdr',texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;nightEnvironment=texture;scene.environment=texture;request()},undefined,()=>{});
new HDRLoader().load('./assets/journey/meadow_2.hdr',texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;meadowEnvironment=texture;sky.material.uniforms.uMeadow.value=texture;request()},undefined,()=>{});
const textureLoader=new THREE.TextureLoader();textureLoader.load('./assets/journey/coast_sand_01_Diffuse.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(9,9);landMaterial.map=texture;landMaterial.needsUpdate=true;request()});textureLoader.load('./assets/journey/coast_sand_01_nor_gl.jpg',texture=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(9,9);landMaterial.normalMap=texture;landMaterial.normalScale.set(.2,.2);landMaterial.needsUpdate=true;request()});
// Camera choreography, including a short reading beat for the window-lit waterfront.
const keyframes=[
 [.29,[0,30.7,-138.21],[0,51.88,-166.07]], [.35,[0,90,-198],[0,86,-260]],
 [.39,[0,103,-214],[0,91,-270]], [.45,[3,106,-217],[0,91,-270]],
 [.468,[3,106,-217],[0,91,-270]], [.54,[12,118,-185],[0,0,-214]],
 [.595,[0,118,-200],[0,-1,-200.01]], [.68,[0,118,-200],[0,-1,-200.01]],
 [.71,[0,100,-200],[0,-1,-200.01]], [.78,[0,6,-200],[0,-5,-200.01]],
 [.805,[0,-2.5,-200],[0,-9,-200.01]], [.835,[0,-.9,-200],[0,-.3,-213]],
 [.865,[0,.45,-200],[0,1.1,-214]], [.91,[0,1.9,-200],[0,1.8,-214]],
 [.955,[0,2.4,-200],[0,2.75,-212.5]], [1,[0,2.4,-200],[0,2.75,-212.5]]
];
// Shape-preserving cubic interpolation avoids the repeated stop/start of per-key easing.
function trackTangents(track){return keyframes.map((k,i)=>k[track].map((_,axis)=>{
 const slope=j=>(keyframes[j+1][track][axis]-keyframes[j][track][axis])/(keyframes[j+1][0]-keyframes[j][0]);
 if(i===0||i===keyframes.length-1)return 0;
 const left=slope(i-1),right=slope(i);if(left*right<=0)return 0;
 const h0=k[0]-keyframes[i-1][0],h1=keyframes[i+1][0]-k[0],w0=2*h1+h0,w1=h1+2*h0;
 return (w0+w1)/(w0/left+w1/right);
}));}
const positionTangents=trackTangents(1),lookTangents=trackTangents(2),look=new THREE.Vector3();
function sampleTrack(p,track,tangents,out){
 let i=keyframes.length-2;for(let j=0;j<keyframes.length-1;j++)if(p<=keyframes[j+1][0]){i=j;break;}
 const a=keyframes[i],b=keyframes[i+1],h=b[0]-a[0],t=phase(p,a[0],b[0]),t2=t*t,t3=t2*t;
 for(let axis=0;axis<3;axis++)out.setComponent(axis,(2*t3-3*t2+1)*a[track][axis]+(t3-2*t2+t)*h*tangents[i][axis]+(-2*t3+3*t2)*b[track][axis]+(t3-t2)*h*tangents[i+1][axis]);
}
function cameraAt(p){
 if(p<.17){const t=phase(p,0,.17);camera.position.set(Math.sin(t*4)*.08,1.65,lerp(65,-96,t));look.set(0,1.85,camera.position.z-40)}
 else if(p<.29){const t=phase(p,.17,.29),a=lerp(.03,.65,beat(p,.08,.29)),travel=lerp(-4,48,t);camera.position.set(0,1.65+Math.max(0,travel)*Math.sin(a),-100-travel*Math.cos(a));const pitch=a*beat(p,.17,.205);look.set(0,camera.position.y+Math.sin(pitch)*35,camera.position.z-Math.cos(pitch)*35)}
 else{sampleTrack(p,1,positionTangents,camera.position);sampleTrack(p,2,lookTangents,look)}
 camera.up.set(0,1,0);camera.lookAt(look);
 // Resolve the downward turn early, without lookAt's near-vertical up-vector singularity.
 if(p>=.468&&p<=.805){const turn=beat(p,.468,.59);camera.rotation.set(lerp(-.2758,-Math.PI/2+.0005,turn),lerp(.0565,0,turn),0,'YXZ');}

}
// Eleven spaced waterfront addresses, laid out for the existing flight view.
// Projection is used only while building static window geometry, never to move the camera.
const facadeMaterial=new THREE.ShaderMaterial({uniforms:{uDim:{value:0}},vertexShader:`attribute float aLetter;attribute float aSwitch;varying float vLetter;varying float vSwitch;void main(){vLetter=aLetter;vSwitch=aSwitch;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uDim;varying float vLetter;varying float vSwitch;void main(){float room=1.-smoothstep(vSwitch,vSwitch+.36,uDim);float light=mix(room,1.,vLetter);vec3 tint=mix(vec3(.36,.56,.67),vec3(1.,.74,.42),step(.32,vSwitch));tint=mix(tint,vec3(1.,.82,.54),vLetter);gl_FragColor=vec4(mix(vec3(.012,.019,.026),tint*mix(1.25,1.9,vLetter),light),1.);}`});
const phraseBuildings=new THREE.Group();city.add(phraseBuildings);
const messageWindows=[];
// Continue the waterfront blocks beneath the farther district, rather than standing towers in the sea.
box(240,1,230,concrete,city,0,-.7,-490);for(const x of [-72,-36,0,36,72])box(6,.015,220,asphalt,city,x,-.185,-490);for(const z of [-390,-435,-505,-565])box(230,.015,5,asphalt,city,0,-.17,z);

const letteringView=new THREE.PerspectiveCamera(62,(host.clientWidth/host.clientHeight)||420/677,.035,2400),letteringLook=new THREE.Vector3();sampleTrack(.415,1,positionTangents,letteringView.position);sampleTrack(.415,2,lookTangents,letteringLook);letteringView.lookAt(letteringLook);letteringView.updateMatrixWorld();
// More distant addresses use the same sparse room scale as the surrounding city.
const skylinePlan=[];
function skylineLine(chunks,start,top,bottom,pitch,gap,depths){let cursor=start;chunks.forEach((text,i)=>{let count=0;for(const c of text)count+=c==='.'?3:6;count-=text.endsWith('.')?0:1;const width=(count-1)*pitch;skylinePlan.push({text,left:cursor,right:cursor+width,top,bottom,z:depths[i],yaw:[.045,-.055,.065,-.035,-.085,.03][i],roof:top+[.09,.33,.18,.25,.1,.22][i],depth:10+i%3*2,style:i%5});cursor+=width+gap;});}
skylineLine(['SO','ME','TI','ME','S'],-.65,.35,.20,.023,.09,[-424,-459,-437,-477,-448]);
skylineLine(['TH','E','JO','UR','NE','Y...'],-.74,-.08,-.22,.0195,.072,[-374,-402,-381,-418,-391,-410]);
function viewRay(x,y){const dir=new THREE.Vector3(x,y,.5).unproject(letteringView).sub(letteringView.position).normalize();return new THREE.Ray(letteringView.position,dir);}
for(const [address,plan] of skylinePlan.entries()){
 const centreRay=viewRay((plan.left+plan.right)/2,0),centre=centreRay.at((plan.z-letteringView.position.z)/centreRay.direction.z,new THREE.Vector3()),normal=new THREE.Vector3(Math.sin(plan.yaw),0,Math.cos(plan.yaw)),plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,centre),tower=new THREE.Group();tower.position.set(centre.x,0,centre.z);tower.rotation.y=plan.yaw;phraseBuildings.add(tower);tower.updateMatrixWorld(true);
 const hit=(x,y)=>tower.worldToLocal(viewRay(x,y).intersectPlane(plane,new THREE.Vector3()));
 const l=hit(plan.left-.018,0).x,r=hit(plan.right+.018,0).x,width=r-l,offset=(l+r)/2,height=hit((plan.left+plan.right)/2,plan.roof).y;
 const shell=buildingMat;box(width,height,plan.depth,shell,tower,offset,height/2,-plan.depth/2);if(address%3===0)box(width*.5,height*.44,plan.depth*.9,shell,tower,l-width*.2,height*.22,-plan.depth*.6);if(address%4===1)box(width*.36,height*.62,plan.depth*.7,shell,tower,r+width*.12,height*.31,-plan.depth*.7);box(width+.45,.45,plan.depth+.4,metal,tower,offset,height+.2,-plan.depth/2);
 // Modest rooflines and crowns share the surrounding city's materials and room scale.
 if(plan.style===0){box(width*.66,3.7,plan.depth*.7,shell,tower,offset-.5,height+2,-plan.depth*.52);box(.13,7,.13,metal,tower,offset+width*.25,height+3.5,-4);}
 if(plan.style===1){box(width*.72,6.5,plan.depth*.74,shell,tower,offset,height+3.4,-plan.depth*.51);for(const x of [l,r])box(.17,height+1,.4,metal,tower,x,height/2,.12);}
 if(plan.style===2){box(width*.9,1.7,plan.depth*.92,concrete,tower,offset,height+1.1,-plan.depth/2);for(const x of [l+.22,r-.22])box(.2,height,.25,metal,tower,x,height/2,.14);}
 if(plan.style===3){box(width*.55,4,plan.depth*.65,shell,tower,offset+1,height+2,-plan.depth*.5);box(.12,9,.12,metal,tower,offset+width*.25,height+7,-plan.depth*.5);}
 if(plan.style===4){box(width*.68,2.5,plan.depth*.6,shell,tower,offset-.5,height+1.4,-plan.depth*.5);for(let y=12;y<height-4;y+=14)box(width+.1,.15,.18,metal,tower,offset,y,.08);}
 let advance=0;const lit=new Set();for(const char of plan.text){const glyph=letterPixels[char];if(glyph)glyph.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')lit.add(`${advance+x},${y}`)}));advance+=char==='.'?3:6;}
 const cols=advance-(plan.text.endsWith('.')?0:1),dx=(plan.right-plan.left)/Math.max(1,cols-1),dy=(plan.top-plan.bottom)/6,rooms=[];
 for(let row=-Math.ceil((plan.roof-plan.top)/dy);row<160;row++){const y=plan.top-row*dy,point=hit((plan.left+plan.right)/2,y);if(point.y<2)break;if(point.y>height-1)continue;for(let col=-1;col<=cols;col++){const letter=lit.has(`${col},${row}`);if(!letter&&rnd()<.49)continue;const p=hit(plan.left+col*dx,y);if(p.x<l+.16||p.x>r-.16)continue;rooms.push({p,letter,switch:rnd()*.64});}}
 for(const room of rooms){if(!room.letter)continue;messageWindows.push({centre:tower.localToWorld(new THREE.Vector3(room.p.x,room.p.y,.025)),corners:[[-.325,-.56],[.325,-.56],[.325,.56],[-.325,.56]].map(([x,y])=>tower.localToWorld(new THREE.Vector3(room.p.x+x,room.p.y+y,.025)))});}
 const geometry=new THREE.PlaneGeometry(.65,1.12);geometry.setAttribute('aLetter',new THREE.InstancedBufferAttribute(new Float32Array(rooms.map(w=>w.letter?1:0)),1));geometry.setAttribute('aSwitch',new THREE.InstancedBufferAttribute(new Float32Array(rooms.map(w=>w.switch)),1));instances(geometry,facadeMaterial,rooms.length,tower,(d,i)=>{d.position.copy(rooms[i].p);d.position.z=.025});
 // Recessed side rooms reveal depth as the unchanged camera passes the architecture.
 const sideRooms=[];for(let row=4;row<height-3;row+=3.1)for(let z=-1.6;z>-plan.depth+1;z-=2.4)if(rnd()>.55)sideRooms.push([row,z]);instances(new THREE.PlaneGeometry(.55,.85),windowMat,sideRooms.length,tower,(d,i)=>{d.position.set(address%2?l-.025:r+.025,sideRooms[i][0],sideRooms[i][1]);d.rotation.y=address%2?-Math.PI/2:Math.PI/2;});
 tower.userData.words=plan.text;
}

// Taller side streets and distant background towers continue the same sparse city vocabulary.
box(360,1,230,concrete,city,0,-.7,-685);
const backdropTowers=[];for(let i=0;i<22;i++){const flank=i<12,side=i%2?1:-1;backdropTowers.push({x:flank?side*(77+(i%3)*22):((i-12)-4.5)*23,z:flank?-405-Math.floor(i/2)*40:-645-(i%3)*34,w:8+rnd()*10,d:12+rnd()*8,h:65+rnd()*100});}
for(const [i,b] of backdropTowers.entries()){box(b.w,b.h,b.d,buildingMat,city,b.x,b.h/2,b.z);box(b.w+.5,.35,b.d+.5,metal,city,b.x,b.h+.2,b.z);if(i%3===0)box(b.w*.55,4,b.d*.6,metal,city,b.x+.7,b.h+2.2,b.z);const rooms=[];for(let y=2.5;y<b.h-2;y+=2.5)for(let x=-b.w/2+1;x<b.w/2-.5;x+=1.7)if(rnd()>.46)rooms.push([x,y]);instances(new THREE.PlaneGeometry(.65,1.12),windowMat,rooms.length,city,(o,j,m)=>{o.position.set(b.x+rooms[j][0],rooms[j][1],b.z+b.d/2+.03);color.set(j%3?'#f6b87f':'#a8dce4');color.multiplyScalar(.8);m.setColorAt(j,color)});}
// Letter windows continue on whichever real facade/roof is visible in front of them.
// Ray projection follows the existing camera; it never moves that camera or makes walls transparent.
city.updateMatrixWorld(true);
const messageSolids=[];city.traverse(object=>{if(object.isMesh&&[buildingMat,metal,concrete].includes(object.material))messageSolids.push(object)});
const relayPositions=new Float32Array(messageWindows.length*12),relayIndices=[];
for(let i=0;i<messageWindows.length;i++){const n=i*4;relayIndices.push(n,n+1,n+2,n,n+2,n+3)}
const relayGeometry=new THREE.BufferGeometry();relayGeometry.setAttribute('position',new THREE.BufferAttribute(relayPositions,3).setUsage(THREE.DynamicDrawUsage));relayGeometry.setAttribute('aLetter',new THREE.BufferAttribute(new Float32Array(messageWindows.length*4).fill(1),1));relayGeometry.setAttribute('aSwitch',new THREE.BufferAttribute(new Float32Array(messageWindows.length*4),1));relayGeometry.setIndex(relayIndices);relayGeometry.setDrawRange(0,0);
const relayMaterial=facadeMaterial.clone();relayMaterial.vertexShader=relayMaterial.vertexShader.replace('modelViewMatrix*instanceMatrix*','modelViewMatrix*');relayMaterial.uniforms.uDim=facadeMaterial.uniforms.uDim;relayMaterial.uniforms.uRelay={value:0};relayMaterial.fragmentShader='uniform float uRelay;'+relayMaterial.fragmentShader.replace('light),1.);','light)*uRelay,1.);');
const relayLights=new THREE.Mesh(relayGeometry,relayMaterial);relayLights.frustumCulled=false;relayLights.visible=false;city.add(relayLights);
const messageRaycaster=new THREE.Raycaster(),messageRay=new THREE.Ray(),messageNormal=new THREE.Vector3(),messagePlane=new THREE.Plane(),messageMatrix=new THREE.Matrix4(),messageInstance=new THREE.Matrix4(),messageNormalMatrix=new THREE.Matrix3(),messageDirection=new THREE.Vector3(),messagePoint=new THREE.Vector3();
function relayMessageWindows(p){
 relayLights.visible=p>.345&&p<.468;if(!relayLights.visible)return;
 relayMaterial.uniforms.uRelay.value=beat(p,.345,.375);camera.updateMatrixWorld(true);let count=0;
 for(const window of messageWindows){
  messageDirection.copy(window.centre).sub(camera.position);const distance=messageDirection.length();messageDirection.normalize();messageRaycaster.set(camera.position,messageDirection);messageRaycaster.far=distance-.12;
  const hit=messageRaycaster.intersectObjects(messageSolids,false)[0];if(!hit||!hit.face)continue;
  messageMatrix.copy(hit.object.matrixWorld);if(hit.object.isInstancedMesh){hit.object.getMatrixAt(hit.instanceId,messageInstance);messageMatrix.multiply(messageInstance)}
  messageNormal.copy(hit.face.normal).applyNormalMatrix(messageNormalMatrix.getNormalMatrix(messageMatrix)).normalize();messagePlane.setFromNormalAndCoplanarPoint(messageNormal,hit.point);
  let valid=true;const corners=[];for(const corner of window.corners){messageRay.origin.copy(camera.position);messageRay.direction.copy(corner).sub(camera.position).normalize();if(!messageRay.intersectPlane(messagePlane,messagePoint)){valid=false;break}corners.push(messagePoint.clone().addScaledVector(messageNormal,.055));}
  if(!valid)continue;for(let i=0;i<4;i++)corners[i].toArray(relayPositions,count*12+i*3);count++;
 }
 relayGeometry.setDrawRange(0,count*6);relayGeometry.attributes.position.needsUpdate=true;stage.dataset.relayWindows=String(count);
}

// Refraction and turbulent water wash spread from the impact point, without a hard reveal edge.
const waterEnvelope=new ShaderPass({uniforms:{tDiffuse:{value:null},uDive:{value:0},uAspect:{value:1},uPhase:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float uDive;uniform float uAspect;uniform float uPhase;varying vec2 vUv;
void main(){vec2 uv=vUv,delta=(uv-vec2(.5,.48))*vec2(uAspect,1.);float r=length(delta),a=atan(delta.y,delta.x),t=uPhase*25.;float wave=.025*sin(a*7.+t)+.018*sin(a*13.-t*.7)+.012*sin(a*23.+t*.5);float front=mix(-.23,1.02,uDive),d=r+wave-front;float wet=(1.-smoothstep(-.15,.14,d))*smoothstep(0.,.08,uDive);float rim=exp(-abs(d)*24.)*smoothstep(0.,.12,uDive);vec2 flow=normalize(delta+vec2(.0001))*vec2(1./uAspect,1.);vec2 bend=flow*(sin(r*58.-t*2.)*.009*wet+.018*rim);bend+=vec2(sin(uv.y*28.+t),cos(uv.x*31.-t))*.003*wet;
vec3 original=texture2D(tDiffuse,clamp(uv+bend,.001,.999)).rgb;float lattice=pow(1.-abs(sin(uv.x*24.+sin(uv.y*21.+t*.2))*cos(uv.y*25.+sin(uv.x*19.-t*.15))),12.);vec3 water=mix(vec3(.015,.21,.28),vec3(.07,.55,.58),smoothstep(.65,0.,r));water+=vec3(.12,.25,.22)*lattice;water+=vec3(.3,.53,.48)*rim*.65;gl_FragColor=vec4(mix(original,water,wet*.96),1.);}`});

const updateScrapbook=createPaperWave(document.querySelector('#scrapbookEnding'));
function update(){
 frame=0;if(contextLost||document.hidden)return;
 const box=story.getBoundingClientRect(),height=feed.clientHeight;progress=clamp((feed.getBoundingClientRect().top-box.top)/(story.offsetHeight-height),0,1);
 if(!visible)return;
 // Remove the former .595–.68 camera hold from the physical scroll timeline.
 const compact=progress*.915,p=compact<.595?compact:compact+.085;
 updateScrapbook(p,reduce.matches);
 if(!renderer){phrase.style.opacity=String(beat(p,.355,.38)*(1-beat(p,.445,.468)));stage.style.setProperty('--destination-opacity',String(beat(p,.91,.95)));stage.style.background=p<.468?'linear-gradient(#081628,#285365)':p<.82?'linear-gradient(#7cbec7,#117d82)':'linear-gradient(#bfd9d5,#41633d)';return;}uniforms.phase.value=reduce.matches?0:progress;const day=beat(p,.468,.55),growth=beat(p,.817,.91),submerge=beat(p,.785,.805)*(1-beat(p,.825,.86));uniforms.day.value=day;uniforms.under.value=submerge;uniforms.meadowSky.value=meadowEnvironment?beat(p,.845,.92):0;
 const reducedFrame=p<.17?.06:p<.29?.23:p<.355?.335:p<.468?.41:p<.60?.54:p<.68?.65:p<.805?.73:p<.86?.84:.98;cameraAt(reduce.matches?reducedFrame:p);oceanMaterial.uniforms.cameraWorld.value.copy(camera.position);sky.position.copy(camera.position);
 const morph=beat(p,.468,.55);city.visible=p<.56;city.position.y=-morph*190;islands.visible=p>.468&&p<.85;islands.position.y=lerp(-28,0,morph)-beat(p,.82,.85)*30;
 meadow.visible=false;ocean.visible=p<.846;
 bridgeLeaf.rotation.x=lerp(.03,.65,beat(p,.08,.29));farLeaf.rotation.x=bridgeLeaf.rotation.x;
 const eject=beat(p,.29,.389);cockpit.visible=p<.389;cockpit.position.set(0,-eject*1.85,eject*3.2);cockpit.rotation.x=eject*.28;
 shards.visible=p>.287&&p<.37;shards.position.set(0,26,-143);const sh=phase(p,.287,.37);shards.children.forEach((m,i)=>{const d=m.userData;m.position.set(d.x*sh,2+d.y*sh,-sh*(12-d.z));m.rotation.set(sh*d.spin,sh*d.spin*.4,sh*d.spin*.7);m.scale.setScalar(1-sh*.8)});
 hemi.intensity=lerp(.55,1.2,day);hemi.color.set(day>.5?'#d9ecda':'#8db9db');hemi.groundColor.set(day>.5?'#52613a':'#071827');sun.intensity=lerp(.17,2.6,day);sun.position.set(lerp(-70,-35,growth),lerp(100,55,growth),lerp(-150,-180,growth));sun.target.position.set(0,0,-200*growth);rim.intensity=lerp(.65,.7,day);headlight.intensity=p<.31?55:0;scene.environment=p>.83?(meadowEnvironment||nightEnvironment):nightEnvironment;scene.environmentIntensity=p>.83?.55:lerp(.5,.28,day);
 const fog=new THREE.Color().lerpColors(new THREE.Color('#071523'),new THREE.Color('#a7cbc3'),day);fog.lerp(new THREE.Color('#036071'),submerge*.94);if(p>.83)fog.lerp(new THREE.Color('#c9d9a9'),beat(p,.83,.9));scene.fog.color.copy(fog);scene.fog.density=p>.83?.0045:lerp(.0038,.0026,day)+submerge*.12;
 bubbles.visible=p>.779&&p<.848;bubbles.material.opacity=submerge*.65;bubbles.position.y=(p-.79)*12;starMat.opacity=1-day;renderer.toneMappingExposure=lerp(1.05,1.06,day);stage.style.setProperty('--journey-vignette',String(lerp(.75,.18,day)));
 const lightsOut=beat(p,.345,.392);facadeMaterial.uniforms.uDim.value=lightsOut;windowMat.color.setScalar(1-lightsOut*.97);phrase.style.opacity='0';relayMessageWindows(p);waterEnvelope.enabled=p>.77&&p<.831;waterEnvelope.uniforms.uDive.value=beat(p,.772,.812);waterEnvelope.uniforms.uPhase.value=progress;stage.dataset.windowMessage=lightsOut.toFixed(3);stage.dataset.waterWash=waterEnvelope.uniforms.uDive.value.toFixed(3);
 stage.style.setProperty('--destination-opacity','0');
 const renderStart=performance.now();if(p<.83)composer.render();
 const cost=performance.now()-renderStart;renderCost=renderCost*.92+Math.min(cost,100)*.08;
 if(++renderSamples>45&&renderSamples%45===0&&renderCost>24&&qualityScale>1){qualityScale=Math.max(1,qualityScale-.25);renderer.setPixelRatio(Math.min(devicePixelRatio||1,qualityScale));composer.setPixelRatio(Math.min(devicePixelRatio||1,qualityScale));resize();}
 stage.dataset.quality=String(qualityScale);
 stage.dataset.progress=p.toFixed(4);stage.dataset.beat=p<.17?'drive':p<.29?'bridge':p<.355?'flight':p<.468?'journey-phrase':p<.68?'island':p<.805?'dive':p<.86?'emergence':'scrapbook';
}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update)}
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h||!renderer)return;camera.aspect=w/h;waterEnvelope.uniforms.uAspect.value=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);request()}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,qualityScale));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.append(renderer.domElement);
 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(waterEnvelope);const bloom=new UnrealBloomPass(new THREE.Vector2(400,700),.24,.45,1.1);composer.addPass(bloom);composer.addPass(new OutputPass());
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true});renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;request()});resize();
}catch(error){stage.classList.add('journey-no-webgl');console.warn('3D rendering unavailable on this browser.',error);}
reduce.addEventListener('change',request);feed.addEventListener('scroll',request,{passive:true});new ResizeObserver(resize).observe(host);window.addEventListener('resize',resize);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request()},{root:feed,rootMargin:'100px 0px'}).observe(story);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else request()});
new MutationObserver(request).observe(document.querySelector('#onboarding'),{attributes:true,attributeFilter:['hidden']});
request();
