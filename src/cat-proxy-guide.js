import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// Simple editable volume model built from the approved five-view proportions.
// The complete base-model sheet is displayed unchanged as the visual authority.
export const BASE_MODEL_URL='/art/cat-motion-proxy-v1/base-model.png';
export const MODEL_VERSION='base-model-motion-v2';
const CREAM='#f6f0e7',DEG=Math.PI/180;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const REFERENCE={pixelsPerUnit:170,footY:591,frontCenterX:196,backCenterX:1437,profileCenterX:1004};
export const POSES={
  front:{label:'Front',yaw:0,roll:0,pitch:0,chest:0,chestYaw:0,hipYaw:0,head:0,tuck:0,tail:0},
  threeQuarter:{label:'Three-quarter',yaw:-32,roll:0,pitch:0,chest:0,head:0,tuck:0,tail:0},
  profile:{label:'Profile',yaw:-90,roll:0,pitch:0,chest:0,head:0,tuck:0,tail:0},
  back:{label:'Back',yaw:180,roll:0,pitch:0,chest:0,head:0,tuck:0,tail:0},
  belly:{label:'Belly-up',yaw:-8,roll:-24,pitch:10,chest:0,head:-4,tuck:1,tail:.24},
  fall3:{label:'fall-3 · pose calibration',yaw:-4,roll:-23,pitch:-9,chest:3,chestYaw:12,hipYaw:0,head:6,tuck:1,tail:.22,legAngles:{foreLeft:{swing:3,bend:110},foreRight:{swing:3,bend:110}}},
};
const raisedFront=(bend,swing=4)=>({foreLeft:{swing,bend},foreRight:{swing,bend}});
const tuckedAll=(frontBend,hindBend=24)=>({...raisedFront(frontBend,10),hindLeft:{swing:12,bend:hindBend},hindRight:{swing:12,bend:hindBend}});
export const SEQUENCE_GUIDE=[
  ['fall-1',{yaw:0,roll:0,pitch:0,head:-8,tuck:0,tail:0}],
  ['fall-2',{yaw:0,roll:-8,pitch:-5,chest:5,head:2,tuck:.28,tail:.08,legAngles:raisedFront(35,6)}],
  ['fall-3',POSES.fall3],
  ['fall-4',{yaw:-4,roll:-42,pitch:-10,chest:4,head:8,tuck:.92,tail:.30,legAngles:tuckedAll(105,45)}],
  ['twist-1',{yaw:-8,roll:-60,pitch:-12,chest:8,chestYaw:8,head:6,tuck:1,tail:.36,legAngles:tuckedAll(105,52)}],
  ['fall-5',{yaw:-12,roll:-76,pitch:-12,chest:5,head:4,tuck:1,tail:.40,legAngles:tuckedAll(100,58)}],
  ['twist-2',{yaw:-15,roll:-88,pitch:-8,chest:12,chestYaw:24,hipYaw:4,head:4,tuck:.96,tail:.42,legAngles:tuckedAll(96,56)}],
  ['twist-3',{yaw:-19,roll:-100,pitch:-4,chest:14,chestYaw:42,hipYaw:15,head:1,tuck:.90,tail:.38,legAngles:tuckedAll(90,52)}],
  ['fall-6',{yaw:-20,roll:-112,pitch:0,chest:12,chestYaw:52,hipYaw:28,head:0,tuck:.86,tail:.30,legAngles:tuckedAll(82,48)}],
  ['twist-4',{yaw:-17,roll:-126,pitch:4,chest:10,chestYaw:72,hipYaw:42,head:-2,tuck:.78,tail:.20,legAngles:tuckedAll(70,40)}],
  ['twist-5',{yaw:-12,roll:-142,pitch:6,chest:8,chestYaw:92,hipYaw:65,head:-3,tuck:.67,tail:.10,legAngles:tuckedAll(55,32)}],
  ['fall-7',{yaw:-8,roll:-156,pitch:5,chest:5,chestYaw:108,hipYaw:84,head:-2,tuck:.58,tail:0,legAngles:tuckedAll(42,25)}],
  ['twist-6',{yaw:-4,roll:-170,pitch:2,chest:3,chestYaw:122,hipYaw:105,head:0,tuck:.48,tail:-.08,legAngles:tuckedAll(32,18)}],
  ['fall-8',{yaw:0,roll:-180,pitch:0,chest:0,chestYaw:132,hipYaw:126,head:0,tuck:.42,tail:-.12,legAngles:tuckedAll(28,12)}],
  ['fall-9',{yaw:0,roll:-180,pitch:8,chest:0,chestYaw:90,hipYaw:72,head:-2,tuck:.30,tail:-.08,legAngles:tuckedAll(18,8)}],
  ['fall-10',{yaw:0,roll:-180,pitch:0,chest:0,chestYaw:0,hipYaw:0,head:0,tuck:.12,tail:0,legAngles:tuckedAll(8,0)}],
  ['land-1',{yaw:0,roll:-180,pitch:-10,chest:-5,head:2,tuck:.74,tail:.02,legAngles:tuckedAll(24,18)}],
  ['land-2',{yaw:0,roll:-180,pitch:5,chest:4,head:-1,tuck:.34,tail:.05,legAngles:tuckedAll(12,8)}],
  ['fall-11',{yaw:0,roll:-180,pitch:-3,chest:-2,head:0,tuck:.18,tail:.02,legAngles:tuckedAll(4,0)}],
  ['land-3',{yaw:0,roll:-180,pitch:0,chest:8,head:-2,tuck:.08,tail:.04,legAngles:tuckedAll(0,0)}],
  ['land-4',{yaw:0,roll:-180,pitch:0,chest:5,head:0,tuck:.04,tail:.06,legAngles:tuckedAll(0,0)}],
  ['land-5',{yaw:0,roll:-180,pitch:0,chest:2,head:0,tuck:0,tail:.08}],
  ['land-6',{yaw:0,roll:-180,pitch:0,chest:0,head:0,tuck:0,tail:.06}],
  ['fall-12',POSES.front],
].map(([id,pose],index)=>({id,number:index+4,pose:{...POSES.front,...pose}}));
const sourceImage=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=BASE_MODEL_URL;});
function surface(color){return new THREE.MeshStandardMaterial({color,roughness:1,metalness:0});}
const fur=surface('#e57d1f'),white=surface('#fff6e9'),pink=surface('#eea0a5');
const stripe=surface('#a94a15'),dark=surface('#482817'),blue=surface('#329bd5'),pupil=surface('#102331'),shine=surface('#ffffff');
const outlineMat=new THREE.MeshBasicMaterial({color:'#482817',side:THREE.BackSide});

function ball(parent,name,center,scale,mat=fur,outline=[fur,white,pink].includes(mat)){
  const geometry=new THREE.SphereGeometry(1,48,32),m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(...center);m.scale.set(...scale);parent.add(m);
  if(outline){const shell=new THREE.Mesh(geometry,outlineMat);shell.name=`${name} outline`;shell.scale.setScalar(1.045);shell.renderOrder=1;m.add(shell);}
  return m;
}
function whisker(parent,side,y,tilt){
  const curve=new THREE.CatmullRomCurve3([V(side*.55,y,.574),V(side*.84,y+tilt*.45,.62),V(side*1.09,y+tilt,.60)]);
  const m=new THREE.Mesh(new THREE.TubeGeometry(curve,20,.008,6,false),white);m.name='Whisker';parent.add(m);
}
function eggHeadGeometry(){
  const geometry=new THREE.SphereGeometry(1,64,48),positions=geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++){
    const y=positions.getY(i),width=1-.14*y-.08*Math.max(0,y)**2;
    positions.setX(i,positions.getX(i)*width);positions.setZ(i,positions.getZ(i)*width);
  }
  positions.needsUpdate=true;geometry.computeVertexNormals();return geometry;
}
function ear(parent,side){
  const s=new THREE.Shape();s.moveTo(-.18,-.13);s.quadraticCurveTo(-.075,-.09,-.055,.015);s.lineTo(-.17,.44);s.quadraticCurveTo(-.17,.51,-.095,.45);s.lineTo(.19,.045);s.quadraticCurveTo(.24,-.08,.075,-.13);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.17,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.035,bevelThickness:.04,curveSegments:16});if(side>0)g.scale(-1,1,1);
  const name=side<0?'Left ear':'Right ear',x=side*.40,y=.53;
  const earSurface=fur.clone();earSurface.side=THREE.DoubleSide;
  const m=new THREE.Mesh(g,earSurface);m.name=name;m.position.set(x,y,.055);m.scale.set(.98,.99,.94);parent.add(m);
  const outlinePoints=s.getPoints(32).map(point=>V(side<0?point.x:-point.x,point.y,.235));
  const outlineCurve=new THREE.CatmullRomCurve3(outlinePoints,true),earOutline=new THREE.Mesh(new THREE.TubeGeometry(outlineCurve,96,.018,8,true),surface('#482817'));earOutline.name=`${name} outline`;earOutline.position.set(x,y,0);parent.add(earOutline);
  const innerShape=new THREE.Shape();innerShape.moveTo(-.12,-.045);innerShape.lineTo(-.12,.29);innerShape.quadraticCurveTo(-.12,.35,-.055,.29);innerShape.lineTo(.13,.025);innerShape.quadraticCurveTo(.17,-.04,.06,-.045);innerShape.closePath();
  const innerGeometry=new THREE.ExtrudeGeometry(innerShape,{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.01,bevelThickness:.01,curveSegments:12});if(side>0)innerGeometry.scale(-1,1,1);
  const innerSurface=pink.clone();innerSurface.side=THREE.DoubleSide;
  const inner=new THREE.Mesh(innerGeometry,innerSurface);inner.name='Pink inner ear';inner.position.set(x,y+.015,.245);parent.add(inner);
}
function stroke(parent,name,points,radius=.025,mat=stripe){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,24,radius,8,false),mat);m.name=name;parent.add(m);return m;}
function headPoint(x,y,back=false){const yn=y/.55,width=1-.14*yn-.08*Math.max(0,yn)**2,xn=x/(.90*width),z=.56*width*Math.sqrt(Math.max(.005,1-xn*xn-yn*yn))+.008;return[x,y,(back?-1:1)*z];}
function face(parent){
  for(const side of[-1,1]){
    ball(parent,'Dark eye outline',[side*.275,.055,.495],[.225,.198,.087],dark);
    ball(parent,'Blue iris',[side*.275,.055,.555],[.193,.164,.053],blue);
    ball(parent,'Dark pupil',[side*.268,.066,.602],[.103,.125,.023],pupil);
    ball(parent,'Eye highlight',[side*.268-.040,.118,.625],[.042,.043,.015],shine,false);
    ball(parent,'Small eye highlight',[side*.268+.050,-.020,.618],[.019,.020,.012],shine,false);
  }
  ball(parent,'White muzzle bridge',[0,-.22,.535],[.14,.21,.085],white);
  for(const side of[-1,1])ball(parent,'White muzzle',[side*.095,-.29,.55],[.165,.125,.102],white);
  ball(parent,'Little nose',[0,-.207,.659],[.065,.040,.026],dark);
  stroke(parent,'Smile',[[-.115,-.325,.647],[-.072,-.350,.657],[0,-.322,.669],[.072,-.350,.657],[.115,-.325,.647]],.012,dark);
  stroke(parent,'Nose to mouth',[[0,-.227,.672],[0,-.30,.677],[0,-.322,.669]],.012,dark);
  // The tabby M and paired cheek stripes follow the curved head surface.
  for(const side of[-1,1]){
    stroke(parent,'Forehead tabby',[headPoint(side*.34,.38),headPoint(side*.22,.29),headPoint(side*.16,.42)],.032);
    stroke(parent,'Central forehead tabby',[headPoint(side*.065,.46),headPoint(side*.075,.34),headPoint(side*.11,.24)],.031);
    stroke(parent,'Upper cheek stripe',[headPoint(side*.79,.13),headPoint(side*.66,.09),headPoint(side*.55,.015)],.032);
    stroke(parent,'Lower cheek stripe',[headPoint(side*.83,-.10),headPoint(side*.70,-.15),headPoint(side*.62,-.22)],.032);
    for(const y of[.17,-.04,-.24])stroke(parent,'Back head tabby',[headPoint(side*.72,y,true),headPoint(side*.47,y+.08,true),headPoint(side*.30,y+.13,true)],.035);
  }
}
function pads(parent){
  ball(parent,'Central pink paw pad',[0,-.109,.025],[.094,.018,.073],pink);
  for(const[x,z]of[[-.094,.115],[-.033,.149],[.033,.149],[.094,.115]])ball(parent,'Pink toe pad',[x,-.1,z],[.034,.021,.041],pink);
}
export function createBaseModel(){
  const root=new THREE.Group();root.name='base-model · editable motion rig';
  const hips=new THREE.Group();hips.name='Pelvis';hips.position.y=.57;root.add(hips);
  const chest=new THREE.Group();chest.name='Chest';chest.position.y=.98;root.add(chest);
  const head=new THREE.Group();head.name='Head';head.position.set(0,.85,.005);chest.add(head);
  // Broad rounded rump occludes paws in the approved straight back view.
  ball(hips,'Rounded rump',[0,0,-.13],[.62,.59,.50]);
  ball(hips,'Seated rump base',[0,-.30,-.28],[.64,.28,.40]);
  ball(chest,'Tapered chest',[0,-.14,0],[.48,.64,.39]);
  ball(hips,'Left haunch',[-.44,-.20,-.015],[.30,.36,.38]);ball(hips,'Right haunch',[.44,-.20,-.015],[.30,.36,.38]);
  const headVolume=new THREE.Mesh(eggHeadGeometry(),fur);headVolume.name='Squashed egg head · fuller at base';headVolume.scale.set(.90,.55,.56);head.add(headVolume);
  const headOutline=new THREE.Mesh(headVolume.geometry,outlineMat);headOutline.name='Head outline';headOutline.scale.setScalar(1.045);headOutline.renderOrder=1;headVolume.add(headOutline);
  ball(head,'Left cheek',[-.54,-.22,.08],[.34,.28,.40]);ball(head,'Right cheek',[.54,-.22,.08],[.34,.28,.40]);
  face(head);ear(head,-1);ear(head,1);for(const side of[-1,1]){whisker(head,side,-.20,.035);whisker(head,side,-.30,-.08);}
  ball(chest,'White chest bib',[0,-.15,.355],[.265,.52,.085],white);
  for(const side of[-1,1])for(const y of[-.05,-.30,-.53]){
    stroke(chest,'Side tabby stripe',[[side*.39,y+.06,.14],[side*.47,y,.02],[side*.42,y-.05,-.19]],.035);
  }
  for(const y of[-.30,-.06,.19]){
    stroke(hips,'Back tabby stripe',[[-.49,y,-.38],[0,y+.10,-.625],[.49,y,-.38]],.040);
  }
  const legs=[];
  function limb(kind,side){
    const front=kind==='fore',parent=front?chest:hips;
    const shoulder=new THREE.Group();shoulder.name=`${side<0?'Left':'Right'} ${kind}leg`;shoulder.position.set(side*(front?.34:.54),front?-.12:-.05,front?.12:.02);parent.add(shoulder);
    const upperLength=front?.38:.22,lowerLength=front?.37:.17;
    const elbow=new THREE.Group();elbow.name='Elbow / knee';elbow.position.y=-upperLength;shoulder.add(elbow);
    const paw=new THREE.Group();paw.name='Paw';paw.position.set(0,-lowerLength,.14);elbow.add(paw);
    ball(shoulder,'Upper limb',[0,-upperLength*.46,.015],[front?.155:.215,upperLength*.66,front?.18:.235]);
    ball(elbow,'Lower limb',[0,-lowerLength*.43,.07],[front?.14:.155,lowerLength*.7,.17]);
    ball(paw,'White paw',[0,0,.025],[front?.194:.164,.125,.235],white);const padGroup=new THREE.Group();padGroup.name='Paw pads';paw.add(padGroup);pads(padGroup);
    stroke(shoulder,'Limb stripe',[[-.12,-upperLength*.35,.10],[0,-upperLength*.42,.18],[.12,-upperLength*.35,.10]],.024);
    const id=`${front?'fore':'hind'}${side<0?'Left':'Right'}`;
    legs.push({id,kind,side,shoulder,elbow,paw,padGroup,restShoulder:shoulder.position.clone()});
  }
  limb('hind',-1);limb('hind',1);limb('fore',-1);limb('fore',1);
  const tailRoot=new THREE.Group();tailRoot.name='Tail curl';tailRoot.position.set(.38,-.22,-.20);hips.add(tailRoot);
  const tailPoints=[V(0,0,-.12),V(.40,-.11,-.16),V(.66,.10,-.10),V(.73,.45,-.02),V(.63,.68,.01),V(.45,.79,.04)];
  const curve=new THREE.CatmullRomCurve3(tailPoints),tailOutline=new THREE.Mesh(new THREE.TubeGeometry(curve,96,.205,24,false),new THREE.MeshBasicMaterial({color:'#482817',side:THREE.BackSide}));tailOutline.name='Tail outline';tailRoot.add(tailOutline);
  const tailGeometry=new THREE.TubeGeometry(curve,96,.18,24,false);
  const tailColors=new Float32Array(tailGeometry.getAttribute('position').count*3),uv=tailGeometry.getAttribute('uv');
  for(let i=0;i<uv.count;i++){
    const t=uv.getX(i);const band=t<.82&&[.15,.34,.54,.72].some(center=>Math.abs(t-center)<.028);
    const c=t>.82?white.color:band?stripe.color:fur.color;c.toArray(tailColors,i*3);
  }
  tailGeometry.setAttribute('color',new THREE.BufferAttribute(tailColors,3));
  const tail=new THREE.Mesh(tailGeometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));tail.name='One smooth tail with painted stripes';tailRoot.add(tail);
  ball(tailRoot,'Rounded white tail end',tailPoints.at(-1).toArray(),[.18,.18,.18],white);
  root.updateMatrixWorld(true);
  function setPose(pose={}){
    const p={...POSES.front,...pose};root.rotation.set(p.pitch*DEG,p.yaw*DEG,p.roll*DEG,'YXZ');
    const pivot=V(0,1.36,0);root.position.copy(pivot).sub(pivot.clone().applyQuaternion(root.quaternion));
    hips.rotation.y=(p.hipYaw||0)*DEG;chest.rotation.set(p.chest*DEG,(p.chestYaw||0)*DEG,0,'YXZ');head.rotation.set(p.head*DEG,(p.headYaw||0)*DEG,0,'YXZ');
    const t=p.tuck;
    const seatedRear=t<.10&&Math.cos(p.yaw*DEG)<-.65;
    for(const leg of legs){
      leg.padGroup.visible=t>.10;
      // The approved seated rear drawing hides all paws behind the rump.
      // Keep that intentional visibility in this simple pose-reference model.
      leg.paw.visible=!seatedRear&&(leg.kind==='fore'||t>.10);
      leg.shoulder.position.copy(leg.restShoulder);leg.shoulder.rotation.set(0,0,0);leg.elbow.rotation.set(0,0,0);leg.paw.rotation.set(0,0,0);
      if(leg.kind==='fore'){
        leg.shoulder.rotation.x=-1.55*t;leg.shoulder.rotation.z=-leg.side*(.05+.46*t);leg.elbow.rotation.x=1.26*t;leg.paw.rotation.x=-1.08*t;leg.paw.rotation.z=leg.side*.2*t;
        if(leg.side<0){leg.shoulder.rotation.x-=.42*t;leg.elbow.rotation.x-=.22*t;}
      }else{leg.shoulder.rotation.x=-1.55*t;leg.shoulder.rotation.z=-leg.side*.35*t;leg.elbow.rotation.x=.42*t;leg.paw.rotation.x=-.42*t;}
      const individual=p.legAngles?.[leg.id]||{};
      leg.shoulder.rotation.z+=leg.side*(individual.swing||0)*DEG;
      leg.elbow.rotation.z=(individual.bend||0)*DEG;
    }
    tailRoot.rotation.set(.15*t,-p.tail,.12*t);root.userData={version:MODEL_VERSION,baseModel:BASE_MODEL_URL,pose:p,referenceCoordinates:REFERENCE};root.updateMatrixWorld(true);
  }
  setPose();return{root,chest,hips,head,legs,tailRoot,setPose};
}
function setupScene(width,height){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setSize(width,height,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(CREAM,1);
  const scene=new THREE.Scene();scene.add(new THREE.AmbientLight('#ffffff',1.6));
  const light=new THREE.DirectionalLight('#fff4e8',2);light.position.set(-3,5,7);scene.add(light);
  const fill=new THREE.DirectionalLight('#ffffff',.7);fill.position.set(4,2,-4);scene.add(fill);
  const aspect=width/height,camera=new THREE.OrthographicCamera(-1.9*aspect,1.9*aspect,1.9,-1.9,.1,80);camera.position.set(0,1.36,8);camera.lookAt(0,1.36,0);return{renderer,scene,camera};
}
const viewport=document.querySelector('#viewport'),{renderer,scene,camera}=setupScene(800,560);viewport.append(renderer.domElement);
const rig=createBaseModel();scene.add(rig.root);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.36,0);controls.enableDamping=true;controls.enablePan=false;
const grid=new THREE.GridHelper(10,20,'#cfc1af','#e3d8ca');grid.position.y=-.14;scene.add(grid);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.95,64),new THREE.MeshBasicMaterial({color:'#c9b9a3',transparent:true,opacity:.14,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.132;scene.add(shadow);
let currentPose={...POSES.front},currentKey='front';
function syncSliders(){
  document.querySelectorAll('[data-control]').forEach(input=>{input.value=currentPose[input.dataset.control];input.nextElementSibling.textContent=String(currentPose[input.dataset.control]);});
  document.querySelectorAll('[data-leg-control]').forEach(input=>{const value=currentPose.legAngles?.[input.dataset.legControl]?.[input.dataset.joint]||0;input.value=value;input.nextElementSibling.textContent=String(value);});
}
function selectPose(key){currentKey=key;currentPose={...POSES[key]};rig.setPose(currentPose);camera.position.set(0,1.36,8);controls.target.set(0,1.36,0);controls.update();document.querySelectorAll('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pose===key)));document.querySelector('#pose-label').textContent=currentPose.label;document.querySelector('#anchor').hidden=key!=='fall3';syncSliders();}
document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>selectPose(b.dataset.pose)));
document.querySelectorAll('[data-control]').forEach(input=>input.addEventListener('input',()=>{currentPose[input.dataset.control]=Number(input.value);input.nextElementSibling.textContent=input.value;rig.setPose(currentPose);}));
document.querySelectorAll('[data-leg-control]').forEach(input=>input.addEventListener('input',()=>{
  const key=input.dataset.legControl,joint=input.dataset.joint;
  currentPose.legAngles||={};currentPose.legAngles[key]||={};currentPose.legAngles[key][joint]=Number(input.value);
  input.nextElementSibling.textContent=input.value;rig.setPose(currentPose);
}));
document.querySelector('#wireframe').addEventListener('change',e=>rig.root.traverse(obj=>{if(obj.isMesh){obj.material.wireframe=e.target.checked;obj.material.needsUpdate=true;}}));
document.querySelector('#reset').addEventListener('click',()=>selectPose(currentKey));
new ResizeObserver(()=>{const w=viewport.clientWidth,h=Math.max(390,Math.min(560,w*.68));renderer.setSize(w,h,false);const a=w/h;camera.left=-1.9*a;camera.right=1.9*a;camera.updateProjectionMatrix();}).observe(viewport);
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
const anchorCanvas=document.querySelector('#anchor-image');
const fallAtlas=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src='/art/cat-fall-c-v1/fall-atlas.png';});
anchorCanvas.width=362;anchorCanvas.height=362;anchorCanvas.getContext('2d').drawImage(fallAtlas,724,0,362,362,0,0,362,362);
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
document.querySelector('#export-pose').addEventListener('click',()=>download(new Blob([JSON.stringify(rig.root.userData,null,2)],{type:'application/json'}),'base-model-pose.json'));
document.querySelector('#export-glb').addEventListener('click',async()=>{const out=await new GLTFExporter().parseAsync(rig.root,{binary:true});download(new Blob([out],{type:'model/gltf-binary'}),'base-model-motion.glb');});
async function renderModelBoard(){
  const cw=460,ch=520,board=document.createElement('canvas');board.width=cw*3;board.height=ch*2+282;const ctx=board.getContext('2d');ctx.fillStyle=CREAM;ctx.fillRect(0,0,board.width,board.height);
  ctx.fillStyle='#3b281e';ctx.font='600 28px system-ui';ctx.fillText('base-model · editable 3D motion study',28,45);ctx.fillStyle='#7e6753';ctx.font='15px system-ui';ctx.fillText('Approved sheet above; simple solid motion model below. Shared scale and fixed camera.',28,75);
  const sh=176,sw=sourceImage.width/sourceImage.height*sh;ctx.drawImage(sourceImage,(board.width-sw)/2,92,sw,sh);
  const study=setupScene(cw,ch),model=createBaseModel();study.scene.add(model.root);const keys=['front','threeQuarter','profile','back','belly','fall3'];
  for(let i=0;i<keys.length;i++){const key=keys[i],x=i%3*cw,y=282+Math.floor(i/3)*ch;model.setPose(POSES[key]);study.renderer.render(study.scene,study.camera);ctx.drawImage(study.renderer.domElement,x,y);ctx.fillStyle='#3b281e';ctx.font='600 19px system-ui';ctx.fillText(POSES[key].label,x+24,y+34);ctx.fillStyle='#a08a74';ctx.font='12px system-ui';ctx.fillText(key==='fall3'?'Pose target: exact approved fall-v1-03':'Fixed orthographic camera · shared scale',x+24,y+55);}
  study.renderer.dispose();return new Promise(resolve=>board.toBlob(resolve,'image/png'));
}
const boardBlob=await renderModelBoard();document.querySelector('#model-board').src=URL.createObjectURL(boardBlob);
document.querySelector('#download-board').addEventListener('click',()=>download(boardBlob,'base-model-3d-review.png'));
async function renderSequenceBoard(){
  const cw=300,ch=320,header=230,board=document.createElement('canvas');board.width=cw*4;board.height=header+ch*6;const ctx=board.getContext('2d');ctx.fillStyle=CREAM;ctx.fillRect(0,0,board.width,board.height);
  ctx.fillStyle='#3b281e';ctx.font='600 26px system-ui';ctx.fillText('Movement reference · 3D pose guide only',24,38);ctx.fillStyle='#7e6753';ctx.font='14px system-ui';ctx.fillText('Draw from the approved base-model sheet above. Use this board only for movement and pose.',24,63);
  const sh=132,sw=sourceImage.width/sourceImage.height*sh;ctx.drawImage(sourceImage,(board.width-sw)/2,78,sw,sh);
  const study=setupScene(cw,ch),model=createBaseModel();study.scene.add(model.root);
  for(let i=0;i<SEQUENCE_GUIDE.length;i++){
    const frame=SEQUENCE_GUIDE[i],x=i%4*cw,y=header+Math.floor(i/4)*ch;model.setPose(frame.pose);study.renderer.render(study.scene,study.camera);ctx.drawImage(study.renderer.domElement,x,y);
    ctx.fillStyle='#3b281e';ctx.font='600 15px system-ui';ctx.fillText(`${String(frame.number).padStart(2,'0')} · ${frame.id}`,x+14,y+25);
  }
  study.renderer.dispose();return new Promise(resolve=>board.toBlob(resolve,'image/png'));
}
let sequenceBoardBlob;
async function getSequenceBoard(){sequenceBoardBlob||=await renderSequenceBoard();return sequenceBoardBlob;}
document.querySelector('#download-sequence-guide').addEventListener('click',async()=>download(await getSequenceBoard(),'base-model-movement-guide.png'));
document.querySelector('#status').textContent='Ready · full approved base-model retained';selectPose('front');
window.catMotionModel={rig,renderer,scene,camera,selectPose,poses:POSES,sequenceGuide:SEQUENCE_GUIDE,renderModelBoard,renderSequenceBoard};
if(new URLSearchParams(location.search).has('save')){try{const r=await fetch('http://127.0.0.1:5198/save?name=cat-proxy-fall-guide',{method:'POST',body:boardBlob});if(!r.ok)throw new Error(String(r.status));const sequence=await getSequenceBoard();const s=await fetch('http://127.0.0.1:5198/save?name=cat-proxy-transition-guide',{method:'POST',body:sequence});if(!s.ok)throw new Error(String(s.status));document.querySelector('#status').textContent='Ready · review boards saved';}catch(e){document.querySelector('#status').textContent=`Ready · use Download review sheets (${e.message})`;}}
