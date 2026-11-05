import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeWarehouse} from './experience-models.js';

// Slide 3: the Northline warehouse demo, rendered into its own frame.
// It loops through a short story (small parcels, large boxes, explore, sensors)
// and a viewer can take over with the choice buttons at any time.
const clamp = T.MathUtils.clamp, mix = T.MathUtils.lerp;
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const ramp = (t, a, b) => ease((t - a) / (b - a));
const route = points => new T.CatmullRomCurve3(points.map(p => new T.Vector3(p[0], 0, p[1])));
const smallRoute = route([[-.5, 3], [-3.2, 1.8], [-3.2, .45], [-3.5, 2.1], [-5.7, 3.4]]);
const largeRoute = route([[-5.7, 3.4], [.2, 3.7], [3, .8], [3.2, 2.2], [5.9, 3.5]]);
const LOOP = 42;

const PHASES = {
  opening: 'The experience opens around the product',
  small: 'Small parcels / Pick. Carry. Sort.',
  large: 'Large boxes / A different job. A different route.',
  explore: 'Explore / Inside the robot',
  sensors: 'Sensors / See how it sees',
  hold: 'From product exploration to observable choices',
  reset: 'Another job. Another way in.',
  still: 'Small parcels / Large boxes / Product exploration',
};

function storyPose(time, manual, manualTime, reduced) {
  const t = time % LOOP;
  const phase = manual || (t < 2.7 ? 'opening' : t < 11 ? 'small' : t < 19 ? 'large' : t < 24 ? 'explore' : t < 32 ? 'sensors' : t < 36 ? 'hold' : 'reset');
  const local = manual ? manualTime : phase === 'small' ? t - 2.7 : phase === 'large' ? t - 11 : phase === 'explore' ? t - 19 : phase === 'sensors' ? t - 24 : t - 36;
  const pose = {opening: manual || reduced ? 1 : t > 40 ? 1 - ramp(t, 40, 42) : ramp(t, 0, 2), explosion: 0, x: -.5, z: 3, yaw: -.3,
    smallLoad: false, largeLoad: false, smallDelivered: false, largeDelivered: false, largeLayout: 0, sensing: false, time};
  if (reduced) return {phase: 'still', pose: {...pose, opening: 1, x: -1, z: 2.7, smallLoad: true, smallDelivered: true}};
  if (phase === 'small' || phase === 'large') {
    const big = phase === 'large', u = clamp(local / 6.5, 0, 1), curve = big ? largeRoute : smallRoute, p = curve.getPoint(ease(u));
    const dir = curve.getTangent(Math.min(.999, ease(u)));
    Object.assign(pose, {x: p.x, z: p.z, yaw: Math.atan2(dir.x, dir.z), smallLoad: !big && u > .36 && u < .96, largeLoad: big && u > .36 && u < .96,
      smallDelivered: big || u >= .96, largeDelivered: big && u >= .96, largeLayout: big ? ramp(local, 0, 2) : 0});
  } else if (phase !== 'opening') {
    const enter = phase === 'explore' ? ramp(local, 0, 2.2) : manual ? ramp(local, 0, 1.5) : 1, reset = phase === 'reset' ? ramp(t, 36, 38.6) : 0;
    Object.assign(pose, {explosion: enter * (1 - reset), x: mix(mix(5.9, -.6, enter), -.5, reset), z: mix(mix(3.5, 1.5, enter), 3, reset),
      yaw: mix(mix(1.9, -.35, enter), -.3, reset), smallDelivered: true, largeDelivered: true, largeLayout: 1, sensing: phase === 'sensors' || phase === 'hold'});
  }
  return {pose, phase};
}

const STATIC = {activate() {}, setReduced() {}, beforePrint() {}, afterPrint() {}};

export function mountWarehouseDemo(section) {
  const frame = section.querySelector('.demo-frame'), stage = frame.querySelector('.demo-stage'), canvas = frame.querySelector('.demo-canvas');
  const print = frame.querySelector('.demo-print'), labels = frame.querySelector('.demo-labels'), phaseLabel = frame.querySelector('.demo-phase');
  const buttons = [...section.querySelectorAll('[data-demo]')], resume = section.querySelector('.demo-resume'), playback = section.querySelector('.demo-playback');
  const events = [...section.querySelectorAll('[data-activity]')];

  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'}); }
  catch {
    frame.classList.add('is-static'); buttons.forEach(b => b.disabled = true); playback.hidden = true;
    events.forEach(li => li.classList.add('is-recorded')); phaseLabel.textContent = PHASES.still; return STATIC;
  }
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.setClearColor(0x091540, 0);

  const scene = new T.Scene(), camera = new T.OrthographicCamera(-12, 12, 8, -8, .1, 170);
  const pmrem = new T.PMREMGenerator(renderer), room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .06).texture; scene.environmentIntensity = .65; room.dispose(); pmrem.dispose();
  scene.add(new T.HemisphereLight('#dcefee', '#0a182d', .85));
  const key = new T.DirectionalLight('#fff1d9', 3.5); key.position.set(-9, 19, 13); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -22, right: 22, top: 22, bottom: -22}); key.shadow.radius = 3; key.shadow.normalBias = .045; key.shadow.bias = -.00015; scene.add(key);
  const rim = new T.DirectionalLight('#91dbe1', 2.1); rim.position.set(16, 9, -12); scene.add(rim);
  const fill = new T.DirectionalLight('#d9b5c1', .5); fill.position.set(6, 5, 18); scene.add(fill);
  const world = makeWarehouse(); scene.add(world.root);
  const shadow = new T.Mesh(new T.PlaneGeometry(140, 140), new T.ShadowMaterial({opacity: .23}));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.64; shadow.receiveShadow = true; scene.add(shadow);

  let width = 1, height = 1, active = false, reduced = false, raf = 0, last = 0, clock = 0;
  let manual = null, manualClock = 0, manualUntil = 0, manualStart = null, currentPose = null, phase = '';
  const recorded = new Set();
  const parts = {sensor: [world.robot.sensor, [0, .5, 0]], lift: [world.robot.lift, [-1.1, 1.65, 0]], wheel: [world.robot.g, [2.1, .55, .65]]};

  function measure() {
    const r = stage.getBoundingClientRect(); width = Math.max(2, r.width); height = Math.max(2, r.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, width < 600 ? 1.4 : 1.8)); renderer.setSize(width, height, false); draw();
  }
  function record(next) {
    if (next === 'opening') recorded.clear();
    if (['small', 'large', 'sensors'].includes(next)) recorded.add(next);
    events.forEach(li => li.classList.toggle('is-recorded', reduced || recorded.has(li.dataset.activity)));
  }
  function setPhase(next) {
    if (next === phase) return; phase = next; record(next);
    phaseLabel.textContent = PHASES[next] || PHASES.still;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.demo === manual)));
  }
  function place(name, el) {
    const [object, offset] = parts[name], v = object.localToWorld(new T.Vector3(...offset)).project(camera);
    const x = clamp((v.x + 1) / 2 * width, 60, width - 60), y = clamp((1 - v.y) / 2 * height, 24, height - 12);
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }
  function draw() {
    const story = storyPose(Math.max(0, clock - .4), manual, manualClock, reduced && !manual); const pose = {...story.pose};
    if (manualStart && manual) { const e = ramp(manualClock, 0, .85); for (const k of ['x', 'z', 'yaw', 'explosion']) pose[k] = mix(manualStart[k], pose[k], e); }
    currentPose = pose; world.pose(pose); world.root.scale.setScalar(mix(.12, 1, pose.opening));
    const aspect = width / height, cut = pose.explosion; let span = aspect < 1.1 ? 12 : 8.1; span = mix(span, span * .8, cut);
    camera.left = -span * aspect; camera.right = span * aspect; camera.top = span; camera.bottom = -span;
    camera.position.set(19 - cut * 6, 18 - cut * 5, 25 - cut * 5); camera.lookAt(0, .25 + cut * 1.4, cut * 1.5); camera.updateProjectionMatrix();
    renderer.render(scene, camera); setPhase(story.phase);
    const show = cut > .75 && !reduced && width > 480; labels.classList.toggle('is-on', show);
    if (show) for (const el of labels.children) place(el.dataset.part, el);
  }
  function tick(now) {
    raf = 0; if (!active || reduced) return;
    const dt = last ? Math.min((now - last) / 1000, .06) : 0; last = now; clock += dt; if (manual) manualClock += dt;
    if (manual && now > manualUntil) stopManual();
    draw(); raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && active && !reduced) { last = 0; raf = requestAnimationFrame(tick); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function stopManual() { manual = null; manualStart = null; clock = 0; phase = ''; resume.hidden = true; playback.hidden = false; draw(); }

  buttons.forEach(button => button.addEventListener('click', () => {
    manualStart = currentPose ? {...currentPose} : null; manual = button.dataset.demo; manualClock = 0; manualUntil = performance.now() + 18000;
    if (reduced) manualClock = 3; // no animation: jump straight to the chosen view
    phase = ''; resume.hidden = false; playback.hidden = true; draw(); start();
  }));
  resume.addEventListener('click', stopManual);
  new ResizeObserver(measure).observe(stage); document.fonts?.ready.then(measure); measure();

  // A clean still of the scene, used by the slide 4 campaign tile and the print fallback.
  function still(w = 960, h = 560) {
    const saved = {width, height, manual, reduced}; manual = null; reduced = true; width = w; height = h;
    renderer.setPixelRatio(1.5); renderer.setSize(w, h, false); draw();
    const png = canvas.toDataURL('image/png');
    manual = saved.manual; reduced = saved.reduced; phase = ''; measure();
    return png;
  }
  const png = still();
  document.querySelectorAll('[data-demo-still]').forEach(img => { img.src = png; });
  print.src = png;

  return {
    activate(on) { active = on; on ? start() : stop(); },
    setReduced(value) { reduced = value; stop(); draw(); start(); },
    beforePrint() {
      stop(); const saved = {manual, reduced}; manual = null; reduced = true; draw();
      print.src = canvas.toDataURL('image/png'); frame.classList.add('is-printing');
      manual = saved.manual; reduced = saved.reduced; events.forEach(li => li.classList.add('is-recorded'));
      phaseLabel.textContent = PHASES.still; phase = 'still';
    },
    afterPrint() { draw(); start(); },
  };
}
