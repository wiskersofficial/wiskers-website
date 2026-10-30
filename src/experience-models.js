import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export const palette={navy:'#091540',cream:'#f3f0e9',coral:'#ef767a',sea:'#25a583',blue:'#2f97c1'};
const materialCache=new Map(),geometryCache=new Map();
export function finish(color,roughness=.42,metalness=.12){const key=`${color}/${roughness}/${metalness}`;if(!materialCache.has(key))materialCache.set(key,new T.MeshStandardMaterial({color,roughness,metalness,transparent:true}));return materialCache.get(key).clone();}
export function block(parent,w,h,d,mat,x=0,y=0,z=0,r=.05){const key=[w,h,d,r].join('/');if(!geometryCache.has(key))geometryCache.set(key,r?new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d));const m=new T.Mesh(geometryCache.get(key),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function tube(parent,r,h,mat,x=0,y=0,z=0,rTop=r){const m=new T.Mesh(new T.CylinderGeometry(rTop,r,h,40),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function torus(parent,r,thickness,mat,x,y,z,axis='y'){const m=new T.Mesh(new T.TorusGeometry(r,thickness,10,80),mat);m.position.set(x,y,z);if(axis==='y')m.rotation.x=Math.PI/2;else if(axis==='x')m.rotation.y=Math.PI/2;parent.add(m);return m;}
export function textTexture(text,{color='#091540',background=null,width=512,height=128,font='600 64px Arial',align='center'}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.clearRect(0,0,width,height);if(background){ctx.fillStyle=background;ctx.fillRect(0,0,width,height);}ctx.fillStyle=color;ctx.font=font;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,align==='center'?width/2:20,height/2);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
export function decal(parent,texture,w,h,x,y,z,rotation=null){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));m.position.set(x,y,z);if(rotation)m.rotation.set(...rotation);parent.add(m);return m;}
function glow(color,intensity=1){return new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.25,metalness:.15,transparent:true});}
function link(parent,a,b,mat,r=.025){const av=new T.Vector3(...a),bv=new T.Vector3(...b),direction=bv.clone().sub(av);const m=tube(parent,r,direction.length(),mat);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());return m;}
function carton(parent,x,y,z,{large=false,turn=0}={}){const g=new T.Group();parent.add(g);g.position.set(x,y,z);g.rotation.y=turn;const [w,h,d]=large?[1.18,.88,1.05]:[.67,.55,.62];const paper=finish(large?'#ba976f':'#d7b68a',.8,.01),tape=finish('#e9d7ae',.62,.02);block(g,w,h,d,paper,0,h/2,0,.025);block(g,.13,.009,d+.012,tape,0,h+.005,0,.002);block(g,.13,h,.009,tape,0,h/2,d/2+.005,.002);block(g,.24,.17,.012,finish('#eeeadc'),w*.18,h*.57,d/2+.012,.005);for(let i=0;i<6;i++)block(g,.007,.065,.014,finish('#536064'),w*.18-.07+i*.025,h*.57,d/2+.02,0);return g;}

export function makeRobot({detail=true}={}){
 const g=new T.Group(),shell=new T.Group(),lift=new T.Group(),sensor=new T.Group(),power=new T.Group();g.add(shell,lift,sensor,power);
 const navy=finish('#142439',.27,.5),coral=finish('#ef767a',.25,.32),ivory=finish('#e7e6dd',.31,.25),chrome=finish('#b9cbd1',.2,.85),rubber=finish('#121d27',.83,.06);
 block(g,2.38,.38,1.83,navy,0,.48,0,.16);block(g,2.29,.11,1.73,coral,0,.71,0,.04);block(g,2.16,.04,1.57,glow('#25a583',.8),0,.277,0,.045);
 // Four independent wheel assemblies, machined hubs and a visible tread.
 const wheels=[];
 for(const x of [-1.19,1.19])for(const z of [-.57,.57]){const wheel=new T.Group();g.add(wheel);wheel.position.set(x,.35,z);const tire=tube(wheel,.34,.26,rubber);tire.rotation.z=Math.PI/2;for(const dx of [-.15,.15]){const rim=tube(wheel,.224,.035,chrome,dx,0,0);rim.rotation.z=Math.PI/2;const hub=tube(wheel,.105,.04,navy,dx*1.13,0,0);hub.rotation.z=Math.PI/2;for(let n=0;n<(detail?6:0);n++){const a=n*Math.PI/3;const bolt=tube(wheel,.022,.043,ivory,dx*1.17,Math.sin(a)*.16,Math.cos(a)*.16);bolt.rotation.z=Math.PI/2;}}for(let n=0;n<(detail?14:0);n++){const a=n*Math.PI/7;const tread=block(wheel,.27,.027,.045,rubber,0,Math.sin(a)*.334,Math.cos(a)*.334,.007);tread.rotation.x=-a;}wheels.push(wheel);}
 block(power,1.2,.24,1.1,finish('#425668',.5,.55),0,.88,0,.04);for(let i=0;i<5;i++)block(power,.035,.035,.85,chrome,-.45+i*.22,1.02,0,.005);block(power,.48,.13,.52,finish('#25a583',.35,.35),.5,.88,.26,.025);
 // The scissor lift is a real assembly, rather than a solid placeholder block.
 for(const x of [-.76,.76]){link(lift,[x,.7,-.5],[x,1.38,.5],chrome,.065);link(lift,[x,.7,.5],[x,1.38,-.5],navy,.07);const pin=tube(lift,.11,.12,coral,x,1.04,0);pin.rotation.z=Math.PI/2;}
 block(lift,2.03,.14,1.52,navy,0,1.43,0,.06);block(lift,1.9,.035,1.39,finish('#4e6167',.9,.03),0,1.522,0,.025);for(let i=0;i<7;i++)block(lift,1.64,.01,.012,finish('#6c7d7d'),0,1.545,-.55+i*.18,0);
 block(shell,2.19,.51,1.64,ivory,0,1.02,0,.17);block(shell,2.05,.085,1.53,coral,0,1.286,0,.035);
 const visor=new T.MeshPhysicalMaterial({color:'#101f2b',roughness:.13,metalness:.4,clearcoat:1,clearcoatRoughness:.1,transparent:true});block(shell,1.6,.22,.045,visor,0,1.03,.83,.055);for(const x of [-.48,-.24,0,.24,.48])block(shell,.13,.028,.025,glow('#89dcc9',1.3),x,1.045,.859,.012);
 for(const x of [-1.105,1.105])for(let i=0;i<6;i++)block(shell,.012,.11,.025,navy,x,1.05,-.2+i*.095,.004);
 decal(shell,textTexture('NR—01',{font:'600 55px Arial',color:'#273e4a'}),.52,.13,.72,1.16,.85);
 sensor.position.set(0,1.38,-.49);tube(sensor,.31,.11,chrome);tube(sensor,.278,.15,navy,0,.12,0);tube(sensor,.282,.045,glow('#71d4bf',1.4),0,.205,0);tube(sensor,.28,.025,ivory,0,.25,0);for(let n=0;n<12;n++){const a=n*Math.PI/6;block(sensor,.025,.04,.028,ivory,Math.cos(a)*.281,.11,Math.sin(a)*.281,.003);}
 const cargo=new T.Group(),largeCargo=new T.Group();g.add(cargo,largeCargo);cargo.position.y=largeCargo.position.y=1.56;carton(cargo,0,0,0);carton(largeCargo,0,0,0,{large:true});
 const detection=new T.Group();g.add(detection);const sweep=new T.Mesh(new T.CircleGeometry(4.1,64,0,Math.PI*.62),new T.MeshBasicMaterial({color:'#25a583',side:T.DoubleSide,transparent:true,opacity:.1,depthWrite:false}));sweep.rotation.x=-Math.PI/2;sweep.position.set(0,.055,1);detection.add(sweep);
 for(let i=1;i<=3;i++){const arc=new T.Mesh(new T.RingGeometry(i*1.22,i*1.22+.018,80,1,.15,Math.PI*.83),new T.MeshBasicMaterial({color:'#6fe0c3',side:T.DoubleSide,transparent:true,opacity:.45,depthWrite:false}));arc.rotation.x=-Math.PI/2;arc.position.set(0,.07,1);detection.add(arc);}
 for(const [x,z] of [[-2.3,2.5],[2.7,2.9],[.35,3.9]]){block(detection,.32,.3,.32,finish('#93aaa9'),x,.15,z,.03);const beam=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(3.4,3.5,-.49),new T.Vector3(x,.32,z)]),new T.LineBasicMaterial({color:'#66d4b7',transparent:true,opacity:.55}));detection.add(beam);const point=new T.Mesh(new T.SphereGeometry(.065,12,12),glow('#8be5c7',2));point.position.set(x,.36,z);detection.add(point);}
 detection.visible=false;
 return {g,shell,lift,sensor,power,wheels,cargo,largeCargo,detection,sweep};
}

export function makeWarehouse({secondary=false}={}){
 const root=new T.Group(),context=new T.Group(),floor=new T.Group();root.add(context);context.add(floor);
 const base=finish('#1c3649',.3,.55),top=finish('#d0d7cb',.73,.07),edge=finish('#889ca0',.3,.7);
 block(floor,17.7,.55,11.5,base,0,-.34,0,.22);block(floor,17.5,.1,11.3,edge,0,-.04,0,.08);block(floor,17.38,.07,11.18,top,0,.04,0,.045);block(floor,17.3,.025,.024,glow('#39b9a2',.8),0,-.26,5.76,.009);
 // Panel joints, bay edges and aisle markings stay subordinate to the product.
 for(const x of [-4,0,4])block(context,.017,.006,10.9,finish('#aab8b2'),x,.081,0,0);
 for(let i=-6;i<=6;i++)block(context,.14,.007,.48,finish('#c1a65f'),-1.8,.084,i*.72,.001);
 for(const [x,z] of [[-7.9,-4.8],[7.9,-4.8],[-7.9,4.7],[7.9,4.7]]){tube(context,.13,.62,finish('#c0a465'),x,.36,z);tube(context,.137,.11,finish('#1b3543'),x,.52,z);tube(context,.2,.045,edge,x,.1,z);}
 const racks=[];
 for(const [n,x,z] of [[0,-5.7,-2.1],[1,4.3,-3.3],[2,5.6,.35]]){const rack=new T.Group();rack.position.set(x,0,z);context.add(rack);racks.push(rack);const steel=finish('#304d5d',.43,.65),shelf=finish('#9eafac',.45,.55);for(const dx of [-1.83,1.83])for(const dz of [-.63,.63]){block(rack,.105,3.8,.105,steel,dx,1.9,dz,.016);block(rack,.3,.05,.26,edge,dx,.1,dz,.02);}for(let level=0;level<3;level++){const h=.48+level*1.17;block(rack,3.92,.1,1.49,shelf,0,h,0,.024);block(rack,3.91,.13,.07,finish('#d78079'),0,h,.76,.012);for(let j=0;j<3;j++)carton(rack,-1.15+j*1.12,h+.055,0,{large:(j+level+n)%3===0,turn:(j%2)*.04});}for(const dx of [-1.82,1.82]){link(rack,[dx,.52,-.65],[dx,2.83,.65],steel,.018);link(rack,[dx,.52,.65],[dx,2.83,-.65],steel,.018);}block(rack,.5,.29,.035,finish('#edf0e1'),-1.4,3.61,.77,.025);decal(rack,textTexture('0'+(n+1),{font:'700 66px Arial'}),.36,.14,-1.4,3.61,.793);}
 const sorting=[];
 for(const [x,z,col] of [[-5.7,3.4,'#25a583'],[5.9,3.5,'#ef767a']]){const dock=new T.Group();dock.position.set(x,0,z);context.add(dock);block(dock,3.1,.18,1.9,finish(col,.4,.3),0,.14,0,.1);block(dock,2.9,.08,1.65,finish('#233a46',.63,.35),0,.27,0,.04);for(let k=-3;k<=3;k++){const roller=tube(dock,.06,2.7,edge,0,.33,k*.215);roller.rotation.z=Math.PI/2;}for(const dx of [-1.43,1.43])block(dock,.075,.15,1.8,finish('#d4ded5'),dx,.35,0,.02);sorting.push(dock);}
 const small=carton(context,-3.2,.09,.45),large=carton(context,3,.09,.8,{large:true}),smallDone=carton(context,-5.7,.4,3.4),largeDone=carton(context,5.9,.4,3.5,{large:true});
 const robot=makeRobot({detail:!secondary});root.add(robot.g);
 const materials=[];context.traverse(o=>{if(o.isMesh)materials.push(o.material);});
 const shadowCasters=[];context.traverse(o=>{if(o.isMesh)shadowCasters.push(o);});
 function pose({opening=1,explosion=0,x=-.5,z=3,yaw=-.3,smallLoad=false,largeLoad=false,smallDelivered=false,largeDelivered=false,largeLayout=0,sensing=false,time=0}={}){
  floor.scale.set(1,1,1);racks.forEach((rack,i)=>{rack.scale.y=Math.max(.001,T.MathUtils.smoothstep(opening,.2+i*.08,.8+i*.05));rack.position.x=[-5.7,4.3,5.6][i]+(i===2?largeLayout*.8:0);rack.position.z=[-2.1,-3.3,.35][i]-(i===2?largeLayout*1.1:0);});
  const opacity=T.MathUtils.lerp(1,.045,explosion);materials.forEach(m=>m.opacity=opacity);shadowCasters.forEach(o=>o.castShadow=explosion<.2);
  const arrival=T.MathUtils.smoothstep(opening,.45,1),parcels=T.MathUtils.smoothstep(opening,.3,.9);[small,large,smallDone,largeDone].forEach(parcel=>parcel.scale.setScalar(Math.max(.001,parcels)));sorting.forEach(dock=>dock.scale.y=Math.max(.001,T.MathUtils.smoothstep(opening,.15,.75)));
  robot.g.position.set(x,0,z+(1-arrival)*3.5);robot.g.rotation.y=yaw;robot.g.scale.setScalar((1+explosion*.7)*Math.max(.001,arrival));robot.shell.position.y=explosion*1.08;robot.lift.position.y=explosion*.46;robot.power.position.y=explosion*.18;robot.sensor.position.set(explosion*3.4,1.38+explosion*2.12,-.49);
  robot.wheels.forEach((w,i)=>{w.position.x=(i<2?-1:1)*(1.19+explosion*.84);});robot.cargo.visible=smallLoad;robot.largeCargo.visible=largeLoad;small.visible=!smallLoad&&!smallDelivered;large.visible=!largeLoad&&!largeDelivered;smallDone.visible=smallDelivered;largeDone.visible=largeDelivered;robot.detection.visible=sensing;robot.sweep.rotation.z=time*.32;return robot;
 }
 pose(secondary?{largeLoad:true,x:1.8,z:2.4,yaw:-1,largeLayout:1}:{});
 return {root,robot,context,racks,pose};
}

export function makeEngine(){
 const root=new T.Group(),chassis=new T.Group(),layers=[],rails=[];root.add(chassis);
 const dark=finish('#172d45',.27,.65),alloy=finish('#92acb8',.27,.8),bone=finish('#d9e2d9',.33,.4),glass=new T.MeshPhysicalMaterial({color:'#7fb8bb',roughness:.15,metalness:.1,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false,clearcoat:1});
 block(chassis,6.5,.42,4.5,dark,0,.15,0,.24);block(chassis,6.34,.1,4.35,alloy,0,.42,0,.08);block(chassis,5.9,.08,3.9,finish('#233d51'),0,.51,0,.08);
 for(const x of [-2.9,2.9])for(const z of [-1.9,1.9]){tube(chassis,.22,.2,dark,x,-.1,z);tube(chassis,.11,6.7,alloy,x,3.75,z);tube(chassis,.14,.1,bone,x,.57,z);tube(chassis,.14,.1,bone,x,6.9,z);}
 const colours=['#c4d8cd','#ef767a','#2f97c1','#25a583'];
 for(let n=0;n<4;n++){const g=new T.Group();g.position.y=1.2+n*1.48;root.add(g);layers.push(g);block(g,5.55,.2,3.6,finish('#294657',.33,.6),0,0,0,.16);block(g,5.34,.07,3.39,finish(colours[n],.35,.42),0,.14,0,.11);block(g,5.25,.018,.025,glow(colours[n],1),0,.19,1.72,.007);for(const x of [-2.6,2.6])for(const z of [-1.6,1.6]){tube(g,.085,.08,alloy,x,.23,z);}if(n===0){for(const x of [-1.45,1.45]){block(g,.12,.7,1.4,alloy,x,.55,0,.02);for(const y of [.3,.62,.95])block(g,1.2,.055,1.2,finish('#b0b9ac'),x,y,0,.015);}}if(n===1){const bot=makeRobot({detail:false});bot.g.scale.setScalar(.73);bot.g.position.y=.2;g.add(bot.g);bot.cargo.visible=bot.largeCargo.visible=false;}if(n===2){for(const x of [-1.25,1.25]){block(g,2.05,.06,1.05,bone,x,.38,0,.1);decal(g,textTexture(x<0?'Small parcels':'Large boxes',{font:'600 47px Arial'}),1.7,.43,x,.42,0,[-Math.PI/2,0,0]);}}if(n===3){const ring=torus(g,.8,.045,glow('#a1e4cb',1.5),0,.38,0);const dot=tube(g,.24,.055,bone,0,.4,0);rails.push(ring,dot);}}
 // A clear outer shroud and a glowing vertical signal spine make this a single device.
 block(chassis,6.2,6.8,.035,glass,0,3.7,-2.05,.015);block(chassis,.035,6.8,3.9,glass,-3.05,3.7,0,.015);
 tube(chassis,.13,6.9,glow('#62cab8',1.2),0,3.8,-1.77);for(let y=.9;y<7;y+=.46)torus(chassis,.22,.02,alloy,0,y,-1.77);
 // Open optical crown: the four cartridges feed a visible synthesis chamber.
 for(const z of [-1.95,1.95])block(chassis,6.3,.12,.16,alloy,0,7.07,z,.05);
 for(const x of [-3.04,3.04])block(chassis,.16,.12,3.8,alloy,x,7.07,0,.05);
 const crown=new T.Group();crown.position.set(0,7.1,0);chassis.add(crown);
 torus(crown,1.65,.095,alloy,0,.02,0);torus(crown,1.43,.035,glow('#65d6bd',1.4),0,.025,0);
 for(let n=0;n<16;n++){const a=n*Math.PI/8;const vane=block(crown,.11,.13,.36,dark,Math.cos(a)*1.63,.04,Math.sin(a)*1.63,.025);vane.rotation.y=-a;}
 const lens=new T.Mesh(new T.SphereGeometry(.46,32,20),new T.MeshPhysicalMaterial({color:'#8fe7ca',metalness:.2,roughness:.13,clearcoat:1,transparent:true,opacity:.65}));lens.position.y=.12;crown.add(lens);
 const orbit=torus(crown,.84,.028,glow('#ef767a',1.1),0,.12,0,'z');orbit.rotation.z=.45;
 for(const x of [-2.9,2.9]){block(chassis,.18,6.1,.45,dark,x,3.7,-1.85,.04);for(let n=0;n<9;n++)block(chassis,.24,.035,.3,alloy,x,1+n*.66,-1.61,.007);}
 // Rounded feet, layered heat sink and distinct front ports anchor the device.
 for(let n=0;n<7;n++)block(chassis,5.8,.035,.13,alloy,0,.12+n*.055,2.28,.005);
 for(const x of [-2.7,2.7])block(chassis,.7,.26,3.5,dark,x,-.18,0,.1);

 const logoTexture=new T.TextureLoader().load('/pitchdeck-assets/wiskers-v2-wordmark-light.svg');logoTexture.colorSpace=T.SRGBColorSpace;block(chassis,3.7,.91,.12,dark,0,.27,2.38,.08);decal(chassis,logoTexture,3.05,.738,0,.27,2.448);
 const sockets=[];for(const z of [-1,0,1]){const socket=tube(chassis,.12,.08,alloy,3.29,.22,z);socket.rotation.z=Math.PI/2;sockets.push(socket);}
 function reveal(t,time=0){root.visible=t>.001;const frame=T.MathUtils.smoothstep(t,0,.22);chassis.scale.y=Math.max(.02,frame);layers.forEach((layer,i)=>{const u=T.MathUtils.smoothstep(t,.12+i*.16,.38+i*.16);layer.visible=u>.001;layer.position.y=T.MathUtils.lerp(.65,1.2+i*1.48,u);layer.position.x=(1-u)*(-7.5-i*.9);layer.rotation.y=(1-u)*-.65;layer.scale.setScalar(.65+u*.35);});}
 reveal(1);return {root,layers,reveal};
}

export function makeConnection(parent,points,color){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,48,.025,6,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.38}));parent.add(mesh);const dot=new T.Mesh(new T.SphereGeometry(.1,12,12),glow(color,1.5));parent.add(dot);return {mesh,dot,curve};}
