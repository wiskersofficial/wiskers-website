import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
const TAU = Math.PI * 2;
const rand = seed => { let a=seed; return () => {a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}; };
const V = (x,y,z=0) => new THREE.Vector3(x,y,z);

function pearlMaterial(accent, variant=0) {
  return new THREE.ShaderMaterial({side:THREE.DoubleSide, uniforms:{time:{value:0},harmonic:{value:3},accent:{value:new THREE.Color(accent)},variant:{value:variant}},
    vertexShader:`uniform float time; uniform float harmonic; uniform float variant; varying vec3 vN; varying vec3 vP; varying vec2 vUv;
    vec3 c(float t,float h){float q=h*2.-1.;float r=1.65+.48*cos(q*t);return vec3(r*cos(2.*t),r*sin(2.*t),.84*sin(q*t));}
    vec3 path(float t){float h=floor(harmonic);float f=smoothstep(0.,1.,fract(harmonic));return mix(c(t,h),c(t,h+1.),f);}
    void main(){vUv=uv;vec3 p=position;vec3 norm=normal;
    if(variant<2.){float t=uv.x*6.283185;float a=uv.y*6.283185;vec3 tangent=normalize(path(t+.001)-path(t-.001));vec3 n=normalize(cross(tangent,vec3(0.,0.,1.)));vec3 b=normalize(cross(tangent,n));norm=n*cos(a)+b*sin(a);float radius=mix(.34,.13,variant)/(1.+max(harmonic-3.,0.)*.13);p=path(t)+norm*radius*(1.+.035*sin(t*24.+time*.5));}
    vN=normalize(normalMatrix*norm);vP=(modelViewMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float time;uniform vec3 accent;uniform float variant;varying vec3 vN;varying vec3 vP;varying vec2 vUv;
    void main(){vec3 n=normalize(vN);vec3 eye=normalize(-vP);float facing=abs(dot(n,eye));float fres=pow(1.-facing,2.8);float lam=max(dot(n,normalize(vec3(-.5,1.,1.5))),0.);float spec=pow(max(dot(reflect(-normalize(vec3(-1.,2.,3.)),n),eye),0.),38.);float band=.5+.5*sin(vUv.x*18.85+vUv.y*6.283+time*.1);vec3 a=mix(vec3(.08,.25,.3),accent,band*.8+.2);vec3 col=a*(.24+lam*.72);col=mix(col,vec3(.7,.62,.93),fres*.7);col+=vec3(.77,.94,1.)*spec*.8;float stripes=pow(.5+.5*sin(vUv.x*3141.59),24.);col+=stripes*.075; col+=fres*.18;gl_FragColor=vec4(col*.72,1.);}`});
}
function pointMaterial(color,size=3,opacity=.8){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{color:{value:new THREE.Color(color)},size:{value:size},opacity:{value:opacity},time:{value:0}},vertexShader:`attribute float seed;uniform float size;uniform float time;varying float vS;void main(){vS=seed;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=size*(.5+seed)*(.85+.15*sin(time+seed*80.));}`,fragmentShader:`uniform vec3 color;uniform float opacity;varying float vS;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*5.)*opacity;gl_FragColor=vec4(mix(color,vec3(1.),vS*.5),a);}`});}
function points(positions,color,size=3,opacity=.8,r=rand(42)){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('seed',new THREE.Float32BufferAttribute(Array.from({length:positions.length/3},r),1));return new THREE.Points(g,pointMaterial(color,size,opacity));}
function line(pts,color,opacity=.3){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));}

function sculpture(accent,kind){
  const g=new THREE.Group();
  const mat=pearlMaterial(accent,kind==='ribbon'?1:0); const geo=new THREE.TorusKnotGeometry(1.64,kind==='ribbon'?.17:.43,420,32,kind==='ribbon'?3:2,kind==='ribbon'?5:3);
  const mesh=new THREE.Mesh(geo,mat);mesh.rotation.set(.45,-.4,-.35);g.add(mesh);
  const rings=new THREE.Group();
  for(let k=0;k<5;k++){let pts=[];for(let i=0;i<=250;i++){let t=i/250*TAU;let r=2.75+k*.08;pts.push(V(Math.cos(t)*r,Math.sin(t)*r,.1*Math.sin(t*3)));}const l=line(pts,accent,.055-k*.006);l.rotation.x=.85+k*.08;l.rotation.y=k*.2;rings.add(l);}g.add(rings);
  const r=rand(921),pos=[];for(let i=0;i<1200;i++){let a=r()*TAU,b=r()*TAU,d=2.5+r()*.9;pos.push(Math.cos(a)*Math.sin(b)*d,Math.sin(a)*Math.sin(b)*d,Math.cos(b)*d);}const p=points(pos,accent,1.4,.45,r);g.add(p);
  g.userData.update=(t,v,motion,dt)=>{mat.uniforms.time.value=t;mat.uniforms.harmonic.value+=(v-mat.uniforms.harmonic.value)*(motion?1-Math.exp(-dt*8):1);mesh.rotation.y=-.4+(motion?t*.09:0)+g.userData.scroll*.35;mesh.rotation.z=-.35+Math.sin(t*.12)*.1+g.userData.scroll*.22;mesh.scale.setScalar(1);rings.rotation.z=t*.025;p.rotation.y=-t*.025;};return g;
}
function galaxy(accent){
  const g=new THREE.Group(),r=rand(84),pos=[],colors=[];
  for(let i=0;i<19000;i++){let d=Math.pow(r(),.65)*3.3;let arm=i%4;let angle=d*1.9+arm*TAU/4+(r()-.5)*(.32+1.0/(d+.4));let spread=(r()-.5)*.20;pos.push(Math.cos(angle)*d+spread,(r()-.5)*(.11+.34/(d+.4)),Math.sin(angle)*d+spread);const c=new THREE.Color().lerpColors(new THREE.Color('#fff1cd'),new THREE.Color(accent),Math.min(d/2.1,1));colors.push(c.r,c.g,c.b);}
  const p=points(pos,accent,2.6,.72,r);p.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  p.material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:`attribute vec3 color;attribute float seed;varying vec3 c;varying float s;uniform float time;void main(){c=color;s=seed;vec3 p=position;float a=time*.015/(length(p.xz)+.7);mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));p.xz=rot*p.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.3+seed*2.3;}`,fragmentShader:`varying vec3 c;varying float s;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(c,exp(-d*d*5.)*.8);}`});
  g.add(p);g.rotation.set(.55,0,-.3);
  const glowMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*12.)*.42+exp(-r*r*100.)*.5;gl_FragColor=vec4(1.,.85,.67,a);}`});
  const core=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),glowMat);core.rotation.x=-Math.PI/2;g.add(core);
  g.userData.update=(t,v)=>{p.material.uniforms.time.value=t*(v/3);g.rotation.y=t*.025;};return g;
}
function network(accent){
  const g=new THREE.Group(),r=rand(409);const nodes=[V(0,0,0)];for(let i=0;i<82;i++){const a=r()*TAU,d=.4+Math.sqrt(r())*2.65;nodes.push(V(Math.cos(a)*d,Math.sin(a)*d,(r()-.5)*1.2));}
  const links=[],edges=[];nodes.forEach((p,i)=>{let others=nodes.map((q,j)=>({j,d:p.distanceTo(q)})).filter(x=>x.j<i).sort((a,b)=>a.d-b.d).slice(0,i%3===0?3:2);others.forEach(({j})=>{const q=nodes[j];const mid=p.clone().add(q).multiplyScalar(.5);mid.z+=.2;const curve=new THREE.QuadraticBezierCurve3(p,mid,q);const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,14,.006+(r()*.018),5,false),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.25+r()*.45}));g.add(tube);links.push(tube);edges.push([p,q]);});});
  const p=points(nodes.flatMap(p=>p.toArray()),accent,6,.95,r);g.add(p);
  const travelers=points(Array(270).fill(0),accent,3,.8,r);g.add(travelers);
  g.userData.update=(t,v)=>{g.rotation.y=Math.sin(t*.1)*.25;let arr=travelers.geometry.attributes.position.array;for(let i=0;i<90;i++){const [a,b]=edges[i%edges.length];const f=(t*.13+i*.13)%1;arr[i*3]=a.x+(b.x-a.x)*f;arr[i*3+1]=a.y+(b.y-a.y)*f;arr[i*3+2]=a.z+(b.z-a.z)*f;}travelers.geometry.attributes.position.needsUpdate=true;links.forEach((l,i)=>{l.visible=v<5||i%4!==0;});};return g;
}
function jelly(accent){
  const g=new THREE.Group(),r=rand(348),pos=[];
  const bellMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},power:{value:1}},vertexShader:`uniform float time;varying vec3 n;varying vec3 p;varying vec2 tex;void main(){tex=uv;vec3 q=position;q.xz*=1.+.045*sin(time*1.4+uv.y*5.);n=normalize(normalMatrix*normal);p=(modelViewMatrix*vec4(q,1.)).xyz;gl_Position=projectionMatrix*vec4(p,1.);}`,fragmentShader:`uniform float time;uniform float power;varying vec3 n;varying vec3 p;varying vec2 tex;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(-p))),2.);float veins=pow(.5+.5*cos(tex.x*6.28318*24.+sin(tex.y*15.)*.3),18.);float pulse=.5+.5*sin(tex.y*12.-time*2.);vec3 c=mix(vec3(.15,.85,.96),vec3(.75,.48,1.),tex.y);gl_FragColor=vec4(c,(.025+edge*.45+veins*.07+pulse*.025)*power);}`});
  const bell=new THREE.Mesh(new THREE.SphereGeometry(1.52,80,48,0,TAU,0,Math.PI*.56),bellMat);bell.scale.y=.69;bell.position.y=.65;g.add(bell);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.49,.015,8,160),new THREE.MeshBasicMaterial({color:'#b9eaff',transparent:true,opacity:.75,blending:THREE.AdditiveBlending}));rim.rotation.x=Math.PI/2;rim.position.y=.45;g.add(rim);
  for(let k=0;k<4;k++){const pts=[];for(let i=0;i<=180;i++){const a=i/180*TAU,rr=.38+.18*Math.cos(a*4);pts.push(V(Math.cos(a+k*.6)*rr,.95+Math.sin(a*4)*.08,Math.sin(a+k*.6)*rr));}g.add(line(pts,'#d2b8ff',.65));}

  for(let j=0;j<95;j++){const a=j/95*TAU;const pts=[];for(let i=0;i<=60;i++){const b=i/60*Math.PI*.56,rr=Math.sin(b)*1.52;pts.push(V(Math.cos(a)*rr,Math.cos(b)*1.05+.65,Math.sin(a)*rr));}g.add(line(pts,accent,j%4===0?.45:.13));}
  for(let j=0;j<15;j++){const b=j/14*Math.PI*.56;const pts=[];for(let i=0;i<=120;i++){const a=i/120*TAU,rr=Math.sin(b)*1.52;pts.push(V(Math.cos(a)*rr,Math.cos(b)*1.05+.65,Math.sin(a)*rr));}g.add(line(pts,accent,.18));}
  const tendrils=[];for(let j=0;j<38;j++){let a=j/38*TAU;let len=1.7+r()*1.7;let pts=[];for(let i=0;i<90;i++){let f=i/89;pts.push(V(Math.cos(a)*(.2+.8*(1-f))+Math.sin(f*11+j)*f*.3,.4-f*len,Math.sin(a)*(.2+.8*(1-f))+Math.cos(f*9+j)*f*.3));}let l=line(pts,j%3===0?'#beadff':accent,.28+r()*.3);l.userData={a,len};tendrils.push(l);g.add(l);}
  for(let i=0;i<1300;i++){let a=r()*TAU,d=r()*3.2;pos.push(Math.cos(a)*d,(r()-.5)*6,Math.sin(a)*d);}g.add(points(pos,accent,1.5,.3,r));
  g.userData.update=(t,v)=>{bellMat.uniforms.time.value=t;bellMat.uniforms.power.value=.4+v*.25;g.rotation.y=t*.07;g.position.y+=Math.sin(t*.65)*.08;g.scale.multiplyScalar(1+Math.sin(t*.8)*.012);tendrils.forEach((l,j)=>{const p=l.geometry.attributes.position;const {a,len}=l.userData;for(let i=0;i<90;i++){let f=i/89;p.setXYZ(i,Math.cos(a)*(.2+.8*(1-f))+Math.sin(f*9+j-t)*f*.3,.4-f*len,Math.sin(a)*(.2+.8*(1-f))+Math.cos(f*8+j-t)*f*.3);}p.needsUpdate=true;l.material.opacity=(.2+(j%4)*.08)*(v/3);});};return g;
}
function lens(accent){
  const g=new THREE.Group();const grid=new THREE.Group();
  for(let axis=0;axis<2;axis++)for(let j=-15;j<=15;j++){const pts=[];for(let i=-60;i<=60;i++){const x=axis?j*.22:i*.06,y=axis?i*.06:j*.22;const d=Math.sqrt(x*x+y*y);pts.push(V(x,y,-1.8/(d+.65)));}grid.add(line(pts,accent,.12+(j===0?.15:0)));}grid.rotation.x=-.57;g.add(grid);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.055,20,240),pearlMaterial(accent,2));ring.rotation.x=.3;g.add(ring);
  for(let i=0;i<6;i++){let ring2=new THREE.Mesh(new THREE.TorusGeometry(1.04+i*.045,.013,8,160),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.28-i*.035,blending:THREE.AdditiveBlending}));ring2.rotation.copy(ring.rotation);g.add(ring2);}
  const hole=new THREE.Mesh(new THREE.SphereGeometry(.91,48,48),new THREE.MeshBasicMaterial({color:'#070b10'}));hole.position.z=.01;g.add(hole);
  const r=rand(44),p=[];for(let i=0;i<1600;i++)p.push((r()-.5)*7,(r()-.5)*7,-1-r()*2);g.add(points(p,'#dfe5ff',1.5,.5,r));
  g.userData.update=(t,v)=>{ring.material.uniforms.time.value=t;grid.scale.z=v/3;ring.rotation.z=t*.1;};return g;
}
function color(accent){const g=new THREE.Group();const m=new THREE.ShaderMaterial({uniforms:{time:{value:0},mode:{value:0}},transparent:true,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;uniform float mode;void main(){vec2 p=vUv*2.-1.;float r=length(p);if(r>.96)discard;float a=atan(p.y,p.x);vec3 c=.52+.48*cos(vec3(0.,2.,4.)+a*2.+r*7.+time*.08);c=mix(c,vec3(.7),mode);float ring=smoothstep(.96,.94,r);float dot=1.-smoothstep(.013,.02,r);c=mix(c,vec3(.02),dot);gl_FragColor=vec4(c,ring);}`});g.add(new THREE.Mesh(new THREE.PlaneGeometry(5.2,5.2),m));g.userData.update=(t,v)=>{m.uniforms.time.value=t;m.uniforms.mode.value=v===9?1:0;};return g;}
function pendulum(accent){const g=new THREE.Group();const states=[[1.85,1.6,0,0],[1.8501,1.6,0,0]];let trails=[[],[]];let time=0;const rods=[],bobs=[],paths=[];for(let k=0;k<2;k++){rods.push(line([V(0,1.7),V(1,0),V(1,-1)],k?'#f1b4c6':accent,.75));g.add(rods[k]);bobs[k]=[];for(let i=0;i<2;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.075,16,16),new THREE.MeshBasicMaterial({color:k?'#f1b4c6':accent}));bobs[k].push(b);g.add(b);}paths.push(line(Array.from({length:800},()=>V(0,0)),k?'#f1b4c6':accent,.35));g.add(paths[k]);}
  function step(s,dt){const[a,b,va,vb]=s,d=a-b,den=3-Math.cos(2*d),G=3.7;const aa=(-G*3*Math.sin(a)-G*Math.sin(a-2*b)-2*Math.sin(d)*(vb*vb+va*va*Math.cos(d)))/den;const ab=(2*Math.sin(d)*(va*va*2+G*2*Math.cos(a)+vb*vb*Math.cos(d)))/den;s[2]+=aa*dt;s[3]+=ab*dt;s[0]+=s[2]*dt;s[1]+=s[3]*dt;}
  g.userData.reset=()=>{states[0]=[1.85,1.6,0,0];states[1]=[1.8501,1.6,0,0];trails=[[],[]];};
  g.userData.update=(t,v,motion,dt)=>{if(motion)for(let n=0;n<4;n++)states.forEach(s=>step(s,Math.min(dt,.035)/4));states.forEach((s,k)=>{const p1=V(Math.sin(s[0])*1.25,1.7-Math.cos(s[0])*1.25),p2=V(p1.x+Math.sin(s[1])*1.25,p1.y-Math.cos(s[1])*1.25);rods[k].geometry.setFromPoints([V(0,1.7),p1,p2]);bobs[k][0].position.copy(p1);bobs[k][1].position.copy(p2);if(motion){trails[k].push(p2.clone());if(trails[k].length>800)trails[k].shift();}const a=paths[k].geometry.attributes.position;for(let i=0;i<800;i++){const p=trails[k][Math.min(i,trails[k].length-1)]||p2;a.setXYZ(i,p.x,p.y,p.z);}a.needsUpdate=true;});};return g;}
function doors(accent){const g=new THREE.Group();for(let j=0;j<3;j++){const pts=[];for(let i=0;i<150;i++){const a=i/150*TAU,d=2.9;pts.push(V(Math.cos(a)*d,Math.sin(a)*d,0));}const l=line(pts,accent,.035);l.rotation.y=j*.4;l.rotation.x=j*.3;g.add(l);}g.userData.update=(t)=>{g.rotation.z=t*.025;};return g;}

function solid(color,roughness=.3){return new THREE.MeshStandardMaterial({color,roughness,metalness:.08});}
function duck(){
 const g=new THREE.Group(),yellow=solid('#ffd849'),orange=solid('#ff7c3b'),black=new THREE.MeshBasicMaterial({color:'#0d1014'}),white=solid('#fff7cc');
 function bird(scale,x,y,z){const d=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),yellow);body.scale.set(1.25,.85,.86);d.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.63,40,32),yellow);head.position.set(.7,.9,0);d.add(head);
  const beak=new THREE.Mesh(new THREE.SphereGeometry(.4,32,20),orange);beak.scale.set(1.3,.31,.75);beak.position.set(1.28,.75,.08);d.add(beak);
  const wing=new THREE.Mesh(new THREE.SphereGeometry(.6,32,24),yellow);wing.scale.set(1.2,.65,.23);wing.position.set(-.2,.02,.76);wing.rotation.z=-.25;d.add(wing);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.4,.8,32),yellow);tail.rotation.z=.7;tail.position.set(-1,.4,0);d.add(tail);
  for(const z of [-.48,.48]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.115,20,16),black);eye.position.set(.95,1.04,z);d.add(eye);const shine=new THREE.Mesh(new THREE.SphereGeometry(.026,12,8),white);shine.position.set(.97,1.08,z+(z>0?.085:-.085));d.add(shine);}
  d.scale.setScalar(scale);d.position.set(x,y,z);d.rotation.y=-.38;g.add(d);return d;
 }
 const birds=[bird(1,0,0,0),bird(.36,-2,-.8,-1.5),bird(.25,1.8,-1.2,-1)];
 g.userData.update=(t,v,motion)=>{birds.forEach((d,i)=>{d.rotation.y=-.38+g.userData.scroll*.9+Math.sin(t*.4+i)*.08;d.rotation.z=Math.sin(t*.9+i)*.04+g.userData.scroll*.12;d.position.y=(i===0?0:i===1?-.8:-1.2)+Math.sin(t*.9+i)*.08;});};return g;
}
function pumpkin(){
 const g=new THREE.Group(),orange=solid('#ff8f26'),green=solid('#5f8240');
 for(let i=0;i<12;i++){const a=i/12*TAU;const lobe=new THREE.Mesh(new THREE.SphereGeometry(.73,32,24),orange);lobe.position.set(Math.cos(a)*.66,0,Math.sin(a)*.66);lobe.scale.set(.8,1.15,.8);g.add(lobe);}
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,.55,16),green);stem.position.set(.03,1.1,0);stem.rotation.z=-.2;g.add(stem);
 const leaf=new THREE.Mesh(new THREE.SphereGeometry(.25,20,12),green);leaf.scale.set(1.7,.15,.7);leaf.position.set(.4,1.12,0);leaf.rotation.z=-.2;g.add(leaf);
 const r=rand(65),p=[];for(let i=0;i<250;i++)p.push((r()-.5)*5,(r()-.5)*4,(r()-.5)*4);g.add(points(p,'#ffe7a3',2,.4,r));
 g.userData.update=(t)=>{g.rotation.y=t*.09+g.userData.scroll*1.4;g.rotation.z=Math.sin(t*.6)*.04+g.userData.scroll*.12;};return g;
}
function blocks(){
 const g=new THREE.Group(),r=rand(926),mat=solid('#d89e8a'),pieces=[];
 for(let i=0;i<24;i++){const mesh=new THREE.Mesh(new RoundedBoxGeometry(.62,.32,.68,3,.055),mat);const target=V((i%4-1.5)*.67,(Math.floor(i/4)-2.5)*.35,0);const start=V((r()-.5)*5,(r()-.5)*4,(r()-.5)*3);g.add(mesh);pieces.push({mesh,target,start,twist:r()*3});}
 g.userData.update=(t)=>{const f=THREE.MathUtils.smoothstep(.55-g.userData.scroll*.75,0,1);pieces.forEach(({mesh,target,start,twist})=>{mesh.position.lerpVectors(start,target,f);mesh.rotation.set((1-f)*twist,(1-f)*twist*.7,(1-f)*twist*.5);});g.rotation.y=-.45+g.userData.scroll*.45;g.rotation.x=.13;};return g;
}
function city(raining=false){
 const g=new THREE.Group(),r=rand(raining?197:986),mat=solid(raining?'#44645a':'#303d63',.5),windows=[];
 for(let i=0;i<24;i++){const x=(i%6-2.5)*.66,z=(Math.floor(i/6)-1.5)*.63,h=.35+r()*1.7;const b=new THREE.Mesh(new RoundedBoxGeometry(.47,h,.48,2,.035),mat);b.position.set(x,-1.3+h/2,z);g.add(b);if(raining){const roof=new THREE.Mesh(new THREE.BoxGeometry(.48,.06,.49),solid('#97bf75'));roof.position.set(x,-1.27+h,z);g.add(roof);}for(let j=0;j<Math.floor(h*5);j++)windows.push(x+.24,-1.2+j*.18,z+.25);}
 g.add(points(windows,raining?'#bfe9ad':'#b9cdff',2.6,.75,r));
 if(raining){const positions=[];for(let i=0;i<650;i++)positions.push((r()-.5)*5,(r()-.5)*5,(r()-.5)*3);const drops=points(positions,'#a6eaff',2.6,.55,r);g.add(drops);g.userData.update=(t)=>{const a=drops.geometry.attributes.position;for(let i=0;i<positions.length/3;i++){const y=((positions[i*3+1]-t*.6-g.userData.scroll*4+15)%5)-2.5;a.setY(i,y);}a.needsUpdate=true;g.rotation.y=-.45+g.userData.scroll*.2;g.rotation.x=.14;};}
 else{for(let j=0;j<7;j++){const pts=[];for(let i=0;i<=80;i++){const f=i/80;pts.push(V(-2+f*4,.6+Math.sin(f*Math.PI)*(1.1+j*.1),-.8+j*.25));}g.add(line(pts,'#a5bdff',.15));}g.userData.update=(t)=>{g.rotation.y=-.55+g.userData.scroll*.8;g.rotation.x=.13;};}
 return g;
}

export class World {
  constructor(canvas,{reduced=false}={}){
    this.canvas=canvas;this.reduced=reduced;this.entries=[];this.t=0;this.drag={x:0,y:0};this.pointer={x:0,y:0};this.last=0;this.onFrame=()=>{};
    try{this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){document.body.classList.add('no-webgl');return;}
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));this.renderer.setClearColor(0,0);this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-8,8,5,-5,-50,50);this.camera.position.z=20;this.scene.add(new THREE.HemisphereLight('#dce9ff','#2b1831',2.4));const key=new THREE.DirectionalLight('#fff4d9',3.4);key.position.set(-3,5,7);this.scene.add(key);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.25,.55,.72);this.composer.addPass(this.bloom);this.frameAverage=16.7;
    this.resize();canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;document.body.classList.add('no-webgl');});canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;document.body.classList.remove('no-webgl');});
    this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);
  }
  makeObject(e){const accent=e.el.dataset.accent;return ({knot:()=>sculpture(accent,'knot'),ribbon:()=>sculpture(accent,'ribbon'),galaxy:()=>galaxy(accent),network:()=>network(accent),jelly:()=>jelly(accent),lens:()=>lens(accent),color:()=>color(accent),pendulum:()=>pendulum(accent),doors:()=>doors(accent),duck:()=>duck(),pumpkin:()=>pumpkin(),blocks:()=>blocks(),rain:()=>city(true),city:()=>city(false)})[e.type]();}
  setEntries(elements){if(!this.renderer)return;const old=new Map(this.entries.map(e=>[e.el.dataset.instance,e]));this.entries=elements.map(el=>{const existing=old.get(el.dataset.instance);if(existing){old.delete(el.dataset.instance);existing.el=el;return existing;}return{el,object:null,value:3,type:el.dataset.kind};});old.forEach(e=>{if(!e.object)return;this.scene.remove(e.object);e.object.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});});this.measure();}
  measure(){this.entries.forEach(e=>{const box=e.el.querySelector('.art-anchor').getBoundingClientRect();e.x=box.left+box.width/2;e.y=box.top+window.scrollY+box.height/2;e.scale=Math.min(box.width/690,box.height/760)*({duck:1.6,pumpkin:1.7,blocks:1.4,rain:1.15,city:1.25}[e.type]||1);});}
  setValue(instance,v){const e=this.entries.find(e=>e.el.dataset.instance===instance);if(e)e.value=v;}
  reset(instance){this.entries.find(e=>e.el.dataset.instance===instance)?.object?.userData.reset?.();}
  resize(){if(!this.renderer)return;this.w=innerWidth;this.h=innerHeight;this.renderer.setSize(this.w,this.h);this.composer?.setSize(this.w,this.h);Object.assign(this.camera,{left:-this.w/200,right:this.w/200,top:this.h/200,bottom:-this.h/200});this.camera.updateProjectionMatrix();this.measure();}
  tick(now){requestAnimationFrame(this.tick);if(document.hidden||this.lost||!this.renderer){this.last=now;return;}const dt=Math.min((now-this.last)/1000||.016,.05);this.last=now;if(!this.reduced)this.t+=dt;const sy=window.scrollY;let visible=0;this.entries.forEach(e=>{const py=e.y-sy;const inView=py>-this.h*.6&&py<this.h*1.6;if(!inView){if(e.object){e.object.visible=false;if(Math.abs(py)>this.h*4){this.scene.remove(e.object);e.object.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});e.object=null;}}return;}if(!e.object){e.object=this.makeObject(e);this.scene.add(e.object);}e.object.visible=true;visible++;e.object.position.set((e.x-this.w/2)/100+(this.reduced?0:this.drag.x*.002+this.pointer.x*.08),(this.h/2-py)/100+(this.reduced?0:this.drag.y*.001),0);e.object.scale.setScalar(e.scale);e.object.userData.scroll=this.reduced?0:(py-this.h/2)/this.h;e.object.userData.update?.(this.reduced?0:this.t,e.value,!this.reduced,dt);if(!this.reduced)e.object.position.y+=(py-this.h/2)*.0007;});this.composer.render();this.frameAverage=this.frameAverage*.97+dt*1000*.03;if(import.meta.env.DEV){this.canvas.dataset.frameMs=this.frameAverage.toFixed(1);this.canvas.dataset.drawCalls=String(this.renderer.info.render.calls);}this.onFrame(now,sy);}
}
