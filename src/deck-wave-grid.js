import * as THREE from 'three';

// Wiskers adaptation of the MIT 3D Wave Grid pattern: coloured, physical cube waves.
export function mountDeckWaveGrid(host) {
  const canvas=host.querySelector('canvas');
  let renderer;
  try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});}
  catch {host.classList.add('is-fallback');return {play(){},pause(){},setReduced(){},setProgress(){},destroy(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0x091540,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#091540',.012);
  const camera=new THREE.PerspectiveCamera(34,1,.1,160);camera.position.set(22,23,29);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight('#b6d9ed',2.2));
  const key=new THREE.DirectionalLight('#eff9ff',4);key.position.set(-8,25,12);scene.add(key);
  const rim=new THREE.DirectionalLight('#2f97c1',4);rim.position.set(20,7,-12);scene.add(rim);
  const geometry=new THREE.BoxGeometry(.65,1,.65);
  const material=new THREE.MeshStandardMaterial({roughness:.3,metalness:.25});
  const N=44,count=N*N,mesh=new THREE.InstancedMesh(geometry,material,count);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);
  const helper=new THREE.Object3D(),base=new THREE.Color('#1c355c'),cream=new THREE.Color('#36617b');
  const palette=['#ef767a','#2f97c1','#25a583','#ead8ae','#adabdf'].map(c=>new THREE.Color(c));
  const positions=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)positions.push([(i-(N-1)/2)*.79,(j-(N-1)/2)*.79]);
  let pulses=[],running=false,reduced=false,frame=0,last=0,nextPulse=0,lastColour=-1,start=performance.now(),gather=0;
  function pulse(x=(Math.random()-.5)*20,z=(Math.random()-.5)*20){let colour;do{colour=Math.floor(Math.random()*palette.length)}while(colour===lastColour);lastColour=colour;pulses.push({x,z,colour:palette[colour],start:performance.now()/1000});if(pulses.length>7)pulses.shift();}
  function draw(now){const t=now/1000;const reveal=Math.min(1,(now-start)/1800);const blend=new THREE.Color();
    positions.forEach(([x,z],index)=>{let height=0,weight=0;blend.copy(base);const edge=Math.max(0,1-Math.pow(Math.max(Math.abs(x),Math.abs(z))/18,7));
      for(const p of pulses){const age=t-p.start,dist=Math.hypot(x-p.x,z-p.z);if(age<0||age>7)continue;const front=dist-age*5.2;const amp=Math.exp(-front*front/6)*Math.exp(-age*.32);height+=amp*3.2;const colourStrength=Math.max(0,amp*.96);if(colourStrength>weight){weight=colourStrength;blend.copy(base).lerp(p.colour,Math.min(1,colourStrength*1.4));}}
      if(reduced){height=Math.exp(-Math.hypot(x-2,z+1)*.11)*(Math.sin(Math.hypot(x-2,z+1)*.7)+1)*.7;blend.copy(base).lerp(palette[0],height*.45);}
      const h=(.45+height)*(.3+.7*edge);const g=gather*gather*(3-2*gather);helper.position.set(x*(1-g*.78),(h/2-1)*(1-g),z*(1-g*.78));helper.scale.set(1-g*.63,(h*Math.max(.05,reveal))*(1-g)+g*.24,1-g*.63);helper.updateMatrix();mesh.setMatrixAt(index,helper.matrix);blend.lerp(cream,(1-weight)*Math.max(0,(z+18)/50)*.22);mesh.setColorAt(index,blend);
    });mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;renderer.render(scene,camera);
  }
  function tick(now){frame=0;if(!running||reduced)return;if(now-last>32){if(now>nextPulse){pulse();nextPulse=now+1450+Math.random()*500;}pulses=pulses.filter(p=>now/1000-p.start<7);draw(now);last=now;}frame=requestAnimationFrame(tick);}
  function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.set(22,23,29);if(r.width<550)camera.position.multiplyScalar(1.1);camera.updateProjectionMatrix();draw(performance.now());}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),pointer=new THREE.Vector2(),point=new THREE.Vector3();
  function onClick(event){host.classList.add('has-interacted');if(reduced)return;const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-((event.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pointer,camera);if(ray.ray.intersectPlane(plane,point))pulse(point.x,point.z);}
  host.addEventListener('pointerdown',onClick);
  host.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();host.classList.add('has-interacted');pulse(0,0);}});
  resize();
  return {setProgress(value){gather=value;if(running)draw(performance.now());},play(){if(running)return;running=true;if(!reduced){pulse();if(!frame)frame=requestAnimationFrame(tick);}else draw(performance.now());},pause(){running=false;cancelAnimationFrame(frame);frame=0;},setReduced(value){reduced=value;cancelAnimationFrame(frame);frame=0;if(running&&!reduced)frame=requestAnimationFrame(tick);else draw(performance.now());},destroy(){running=false;cancelAnimationFrame(frame);resizeObserver.disconnect();host.removeEventListener('pointerdown',onClick);geometry.dispose();material.dispose();renderer.dispose();}};
}
