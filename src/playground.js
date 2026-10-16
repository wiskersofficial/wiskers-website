const panel = document.querySelector('#problem-panel');

// A real button keeps this control keyboard accessible; the cat can activate
// the same stable [data-cat-toggle] hook on impact.
document.querySelectorAll('[data-cat-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-cat-toggle-card]');
    if (!card) return;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    card.dataset.active = String(active);
  });
});

document.querySelector('.problem-trigger')?.addEventListener('click', () => {
  panel?.showModal();
  if (panel) panel.scrollTop = 0;
  document.body.classList.add('panel-open');
});

panel?.querySelectorAll('.problem-close, .problem-done').forEach(button => {
  button.addEventListener('click', () => panel.close());
});
panel?.addEventListener('close', () => document.body.classList.remove('panel-open'));

const answers = {
  compare: [
    'Compare around the job, not the feature list.',
    'Write down the decision you need to make, the constraints that matter, and what success would look like. Then use those criteria to compare each option.',
  ],
  justify: [
    'Build the case around the cost of standing still.',
    'Start with the problem your team already recognises. Agree on the outcome, map the costs and trade-offs, and make the next step small enough to test.',
  ],
  plan: [
    'Find the smallest question worth answering.',
    'Pick one audience and one decision. Build a useful first version, put it in front of real buyers, and let what they do guide the next iteration.',
  ],
};

document.querySelector('#buyer-question')?.addEventListener('change', event => {
  const answer = answers[event.target.value];
  if (!answer) return;
  const result = document.querySelector('#buyer-result');
  const heading = result?.querySelector('h3');
  const detail = result?.querySelector('p:last-child');
  if (heading) heading.textContent = answer[0];
  if (detail) detail.textContent = answer[1];
});

// Every strand endpoint and ball centre use the same scene coordinates.
// No path-length approximation: attachment stays exact through scroll/resize.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const drifting = [...document.querySelectorAll('[data-drift]')];
const scene = document.querySelector('.yarn-scene');
const balls = [...document.querySelectorAll('[data-yarn]')];
const paths = [...document.querySelectorAll('.yarn-strand')];
const anchors = [...document.querySelectorAll('.yarn-anchor')];
const options = [...document.querySelectorAll('.yarn-option')];
const shelf = document.querySelector('.yarn-shelf');
const clamp = value => Math.max(0, Math.min(1, value));
let queued = false;
let layout;
function setRoutes() {
  if (!scene) return;
  const narrow = scene.clientWidth < 600;
  const ballHalfHeight = balls[0].offsetHeight / 2 / scene.clientHeight * 1100;
  const shelfY = narrow ? 245 : 132;
  const startY = shelfY - ballHalfHeight + 2;
  layout = {
    width: scene.clientWidth, height: scene.clientHeight,
    x: narrow ? [110,430,770] : [180,500,850],
    starts: narrow ? [250,550,850] : [520,720,920],
    startY, shelfY,
    ends: [390,650,930],
  };
  shelf.style.top = `${shelfY/11}%`;
  shelf.style.left = narrow ? '3%' : '12%';
  shelf.style.width = narrow ? '92%' : '86%';
  anchors.forEach((anchor,i) => {
    anchor.setAttribute('cx',layout.starts[i]);
    anchor.setAttribute('cy',layout.shelfY);
  });
  options.forEach((label,i) => {
    label.style.left = `${layout.x[i]/10}%`;
    label.style.top = `${(layout.ends[i]+ballHalfHeight+24)/11}%`;
  });
}
function updateMotion() {
  queued = false;
  const reduced = motionPreference.matches;
  const centre = innerHeight / 2;
  drifting.forEach(el => {
    if (reduced) {el.style.removeProperty('transform');return;}
    const position = scrollY + centre - el.offsetTop - el.offsetHeight/2;
    el.style.transform = `translateY(${Math.max(-24,Math.min(24,position*Number(el.dataset.drift)))}px)`;
  });
  if (!scene) return;
  if (!layout || layout.width !== scene.clientWidth || layout.height !== scene.clientHeight) setRoutes();
  const bounds = scene.getBoundingClientRect();
  const travel = Math.max(600,bounds.height-innerHeight*.22);
  const progress = clamp((innerHeight*.66-bounds.top)/travel);
  const sceneDocumentTop = bounds.top + scrollY;
  balls.forEach((ball,i) => {
    const stagger = i*.19;
    // The cat scene reads this live document-space milestone to time contact
    // with the exact scroll point where this ball begins to move. Recompute
    // after layout/resize; no fixed page offsets or one-shot events.
    ball.dataset.catContactProgress = String(stagger);
    ball.dataset.catContactScroll = String(Math.round(
      sceneDocumentTop-innerHeight*.66+travel*stagger,
    ));
    const t = reduced ? 1 : clamp((progress-stagger)/(.46+i*.06));
    // Each ball gets a clear cause-and-effect beat: roll along the shelf,
    // tip over its front edge, then unspool vertically. The drop starts only
    // after the tip finishes, so the phases cannot visually leapfrog.
    const roll = clamp(t/.34);
    const tip = clamp((t-.34)/.14);
    const descent = clamp((t-.48)/.52);
    const tipEase = tip*tip*(3-2*tip);
    const rollEase = roll*roll*(3-2*roll);
    const x = layout.starts[i]+(layout.x[i]-layout.starts[i])*rollEase;
    // One continuous descent curve spans tipping and falling, avoiding a
    // velocity reset when the ball clears the front edge.
    const fallEase = descent*descent*(3-2*descent);
    const y = layout.startY+(layout.ends[i]-layout.startY)*fallEase;
    // A single x/y drives both the SVG endpoint and sprite wrapper. The
    // short horizontal section stays on the lip as the vertical yarn unspools.
    paths[i].setAttribute('d',`M ${layout.starts[i]} ${layout.shelfY} H ${x} V ${y}`);
    ball.style.left = `${x/10}%`;
    ball.style.top = `${y/11}%`;
    const radius = ball.offsetWidth/2;
    const rollAngle = (x-layout.starts[i])/1000*layout.width/radius*180/Math.PI;
    ball.style.setProperty('--roll',`${reduced ? 0 : rollAngle-tipEase*12}deg`);
    const forward = tipEase*(1-clamp(descent/.3));
    ball.style.setProperty('--depth-scale',String(reduced ? 1 : 1+forward*.07));
    ball.style.setProperty('--tip',`${reduced ? 0 : -forward*20}deg`);

  });
}
function requestMotion() {if(!queued){queued=true;requestAnimationFrame(updateMotion);}}
addEventListener('scroll',requestMotion,{passive:true});
addEventListener('resize',()=>{setRoutes();requestMotion();});
motionPreference.addEventListener('change',requestMotion);
setRoutes();
updateMotion();
