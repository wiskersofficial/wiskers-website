import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FALL_SEQUENCE, FLIGHT_FRAME_COUNT, flightFrame, recoveryFrame, impactDisplacement, idleFrame,
  measureCatScroll, catWorldOffset,
} from '../src/cat-scene-math.js';
import {prepareAtlasScene,applyAtlasFrame} from '../src/cat-atlas-renderer.js';

// Compact layouts must keep their falling room without artificial card padding.
const layouts = [
  {name:'517px split hero',tileFootDocumentY:567.45,landingScroll:833.36,viewportHeight:763},
  {name:'390px stacked hero',tileFootDocumentY:763,landingScroll:843,viewportHeight:844},
  {name:'desktop',tileFootDocumentY:615,landingScroll:748,viewportHeight:763},
  {name:'short viewport',tileFootDocumentY:580,landingScroll:748,viewportHeight:600},
];

for (const layout of layouts) {
  test(`${layout.name}: contact stays visible while the page keeps moving`,()=>{
    const motion = measureCatScroll(layout);
    const footY = layout.tileFootDocumentY - layout.landingScroll + catWorldOffset(layout.landingScroll,motion);
    assert.ok(Math.abs(footY - layout.viewportHeight*.52) < .001);
    for (let y=0;y<layout.landingScroll;y+=7) {
      const next=Math.min(y+7,layout.landingScroll);
      const contentStep=-(next-y)+catWorldOffset(next,motion)-catWorldOffset(y,motion);
      assert.ok(contentStep<0,'content must always move upward');
      assert.ok(contentStep>-(next-y),'content must move slower than native scroll');
    }
    const before=catWorldOffset(layout.landingScroll-.001,motion);
    const at=catWorldOffset(layout.landingScroll,motion);
    assert.ok(at-before<.001,'no offset jump at contact');
    assert.equal(catWorldOffset(layout.landingScroll+100,motion),at,'no reset after contact');
    assert.equal(catWorldOffset(0,motion),0,'reverse scrolling restores original layout');
    assert.equal(catWorldOffset(-50,motion),0,'overscroll cannot create a negative spacer');
  });
}

test('unusual layouts retain positive motion and a finite footer offset',()=>{
  for (const tileFootDocumentY of [100,2000]) {
    const motion=measureCatScroll({tileFootDocumentY,landingScroll:800,viewportHeight:800});
    assert.ok(motion.contentSpeed>=.12 && motion.contentSpeed<=.65);
    assert.ok(Number.isFinite(catWorldOffset(2000,motion)));
  }
});

test('interleaved pose map keeps stable IDs and the registered transition order',()=>{
  assert.equal(FALL_SEQUENCE.length,23);
  assert.equal(new Set(FALL_SEQUENCE.map(frame=>frame.id)).size,23);
  assert.deepEqual(FALL_SEQUENCE.slice(0,6).map(frame=>frame.id),[
    'fall-1','fall-2','fall-3','fall-4','fall-5','twist-2',
  ]);
  assert.deepEqual(FALL_SEQUENCE.slice(14).map(frame=>frame.id),[
    'fall-10','land-1','land-2','fall-11','land-3','land-4','land-5','land-6','fall-12',
  ]);
  assert.equal(FLIGHT_FRAME_COUNT,14);
});

test('flight hands directly from the contact pose into the staged landing',()=>{
  assert.equal(flightFrame(0).id,'fall-2');
  assert.equal(flightFrame(1).id,'fall-9');
  assert.equal(recoveryFrame(0).id,'fall-10');
  assert.equal(recoveryFrame(1).id,'fall-12');
});

test('short forward-gaze idle cycles without sticking on its last pose',()=>{
  assert.equal(idleFrame(0),0);
  assert.equal(idleFrame(31,3,96),0);
  assert.equal(idleFrame(32,3,96),1);
  assert.equal(idleFrame(64,3,96),2);
  assert.equal(idleFrame(95,3,96),2);
  assert.equal(idleFrame(96,3,96),0);
  assert.equal(impactDisplacement(0),0);
  assert.equal(impactDisplacement(.14),10);
  assert.equal(impactDisplacement(.42),-2);
  assert.equal(impactDisplacement(1),0);
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}

test('atlas scene stays gated until every decode and persistent image layer is ready',async()=>{
  const names=['idle','fall','transition'];
  const decodes=Object.fromEntries(names.map(name=>[name,deferred()]));
  const layers=Object.fromEntries(names.map(name=>[name,deferred()]));
  const created=[];
  let revealed=false;
  const ready=prepareAtlasScene(names.map(name=>[name,`/${name}.json`]),
    name=>decodes[name].promise,
    async name=>{created.push(name);await layers[name].promise;})
    .then(atlases=>{revealed=true;return atlases;});

  decodes.idle.resolve({url:'/idle.png'});
  decodes.fall.resolve({url:'/fall.png'});
  await Promise.resolve();
  assert.equal(revealed,false,'waiting on the final atlas decode must keep the cat hidden');
  assert.deepEqual(created,[],'image layers are not created from a partially decoded set');

  decodes.transition.resolve({url:'/transition.png'});
  await new Promise(setImmediate);
  assert.deepEqual(new Set(created),new Set(names));
  layers.idle.resolve();
  layers.fall.resolve();
  await new Promise(setImmediate);
  assert.equal(revealed,false,'waiting on the final persistent SVG image must keep the cat hidden');
  layers.transition.resolve();
  const atlases=await ready;
  assert.equal(revealed,true);
  assert.deepEqual(Object.keys(atlases),names);
});

function makeLayer(name,url,events) {
  const attrs={};
  const classes=new Set();
  const layer={
    attrs,
    image:{href:url},
    setAttribute(key,value){attrs[key]=String(value);events.push(`${name}:${key}`);},
    classList:{
      toggle(token,enabled){events.push(`${name}:active:${enabled}`);if(enabled)classes.add(token);else classes.delete(token);},
      contains(token){return classes.has(token);},
    },
  };
  return layer;
}

function makeAtlas(name,url,events) {
  const layer=makeLayer(name,url,events);
  const clipAttrs={};
  return {
    cellRects:[[0,0,10,11],[20,30,12,13]],
    viewBoxes:[[0,1,128,128],[20,31,128,128]],
    layer,
    clip:{setAttribute(key,value){clipAttrs[key]=String(value);events.push(`${name}:clip:${key}`);},attrs:clipAttrs},
  };
}

test('rapid atlas reversals keep each source fixed and atomically switch its crop',()=>{
  const events=[];
  const atlases={
    idle:makeAtlas('idle','/idle.png',events),
    fall:makeAtlas('fall','/fall.png',events),
    transition:makeAtlas('transition','/transition.png',events),
  };
  const cat={dataset:{}};
  const state={currentPoseId:''};
  const changes=[
    ['idle',0,'idle-1'],['fall',1,'fall-2'],['transition',1,'twist-2'],
    ['fall',0,'fall-1'],['transition',1,'land-2'],['idle',1,'idle-2'],
  ];

  for (const [name,pose,id] of changes) {
    events.length=0;
    assert.equal(applyAtlasFrame(atlases,name,pose,id,cat,state),true);
    const target=atlases[name];
    assert.equal(target.layer.attrs.viewBox,target.viewBoxes[pose].join(' '));
    assert.deepEqual(target.clip.attrs,Object.fromEntries(
      ['x','y','width','height'].map((key,index)=>[key,String(target.cellRects[pose][index])]),
    ));
    assert.deepEqual(Object.entries(atlases).filter(([,atlas])=>atlas.layer.classList.contains('is-active')).map(([key])=>key),[name]);
    assert.equal(cat.dataset.pose,id);
    assert.equal(cat.dataset.atlas,name);
    for (const atlas of Object.values(atlases)) assert.equal(atlas.layer.image.href,
      atlas===atlases.idle?'/idle.png':atlas===atlases.fall?'/fall.png':'/transition.png');
    const switchIndex=events.findIndex(event=>event.endsWith(':active:true'));
    assert.ok(events.indexOf(`${name}:viewBox`) < switchIndex,'viewBox must be ready before the active layer changes');
    assert.ok(events.indexOf(`${name}:clip:height`) < switchIndex,'cell crop must be ready before the active layer changes');
  }
});
