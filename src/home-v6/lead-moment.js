import { rounds, profiles, clamp, nearestProfile, summarizePoints } from './lead-moment-data.js';

const colors = ['#ef767a', '#2f97c1', '#25a583', '#f3f0e9'];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const leadMomentMarkup = `<div class="lm-experience" data-lead-moment>
  <div class="lm-header"><span>Square Lead Vibe</span><span>Four moments. Your point of view.</span></div>
  <div class="lm-main">
    <div class="lm-copy">
      <div data-lm-intro>
        <h3>Find your<br><em>lead moment.</em></h3>
        <p data-v6-warp>What would help your next client move forward? Think about the people you want to reach, then place a point for each of four moments.</p>
        <p data-v6-warp>Your choices become a starting point for an interactive experience: something to spark interest, explain an offer, guide a choice, or help someone act.</p>
        <button class="lm-primary" type="button" data-lm-start disabled>Find my lead moment <span aria-hidden="true">↗</span></button>
        <noscript><p>Enable JavaScript to play, or explore the four approaches below.</p></noscript>
      </div>
      <div data-lm-round hidden>
        <div class="lm-round-meta"><span>Moment <span data-lm-number>1</span> of 4</span><span data-lm-round-label>A first visit</span></div>
        <div class="lm-progress" role="progressbar" aria-label="Locked moments" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0"><span data-lm-progress></span></div>
        <h3 data-lm-question tabindex="-1">A new visitor lands on your site.</h3>
        <p class="lm-description" data-lm-help data-v6-warp></p>
        <p data-lm-context data-v6-warp></p>
        <p class="lm-prompt" data-lm-prompt data-v6-warp></p>
      </div>
      <div data-lm-summary hidden>
        <p class="lm-kicker">Your lead moment</p>
        <h3 data-lm-profile tabindex="-1"></h3>
        <p data-lm-description data-v6-warp></p>
        <p data-lm-pattern data-v6-warp></p>
        <div class="lm-next-idea"><h4>A Wisker idea to try</h4><p data-lm-idea data-v6-warp></p></div>
        <a class="lm-primary" href="#lead-moment-results">Explore your idea <span aria-hidden="true">↓</span></a>
        <button type="button" class="lm-quiet" data-lm-replay>Try another set of moments</button>
      </div>
    </div>
    <div class="lm-play">
      <div class="lm-map-heading"><h4>Your visitor’s moment</h4><span data-lm-map-caption>Start to place your first point.</span></div>
      <div class="lm-board" data-lm-board>
        <canvas data-lm-canvas tabindex="0" role="group" aria-label="Lead moment map. Left to right is clarity of need; bottom to top is readiness to act. During a round, use arrow keys to place or move a point and Enter to lock it." aria-describedby="lead-map-help"></canvas>
        <div class="lm-map-cross" aria-hidden="true"></div>
        <div class="lm-fallback-markers" data-lm-markers aria-hidden="true"></div>
        ${profiles.map(p => `<span class="lm-map-label lm-map-label-${p.id}" aria-hidden="true">${p.label}</span>`).join('')}
        <span class="lm-axis lm-axis-top" aria-hidden="true">Ready to move</span><span class="lm-axis lm-axis-bottom" aria-hidden="true">Still exploring</span>
      </div>
      <div class="lm-horizontal-axis" aria-hidden="true"><span>Finding the need</span><span>Clear on the need</span></div>
      <div class="lm-corner-choices" role="group" aria-label="Choose a corner">${profiles.map(p => `<button class="lm-corner" type="button" data-lm-corner="${p.id}" disabled>${p.label}</button>`).join('')}</div>
      <p class="lm-map-help" id="lead-map-help" data-lm-map-help>Place a point on the grid or choose a corner. You can adjust it before locking.</p>
      <div data-lm-inputs hidden>
        <p class="lm-position" data-lm-position aria-live="polite">Choose a point for this moment.</p>
        <details class="lm-adjust"><summary>Adjust your point with sliders</summary>
          <label for="lead-clarity">Clarity of need</label><input id="lead-clarity" data-lm-x type="range" min="0" max="100" step="1" value="50">
          <label for="lead-readiness">Readiness to act</label><input id="lead-readiness" data-lm-y type="range" min="0" max="100" step="1" value="50">
        </details>
        <div class="lm-actions"><button class="lm-quiet" type="button" data-lm-back>Start over</button><button class="lm-primary" type="button" data-lm-lock disabled>Lock this point <span aria-hidden="true">↗</span></button></div>
      </div>
      <p class="lm-locked-caption" data-lm-locked-caption hidden>Your four points stay on the map. Read the pattern below.</p>
    </div>
  </div>
  <div class="lm-results" id="lead-moment-results" data-lm-results hidden></div>
  <div class="lm-guide">
    <div class="lm-guide-heading"><h3>Four ways to<br><em>open a conversation.</em></h3><p data-v6-warp>Each corner describes a useful job an experience could do. Your point can sit between them: visitors often need more than one kind of help.</p></div>
    <div class="lm-guide-grid">${profiles.map((p, i) => `<article><span class="lm-guide-number" aria-hidden="true">0${i + 1}</span><h4>${p.label}</h4><p data-v6-warp>${p.description}</p><p class="lm-guide-idea" data-v6-warp>${p.idea}</p></article>`).join('')}</div>
  </div>
  <p class="glyph-wave__sr-only" data-lm-announcement role="status" aria-live="polite" aria-atomic="true"></p>
</div>`;

let enginePromise;
function loadEngine() {
  if (window.createCubeFloor) return Promise.resolve();
  if (!enginePromise) enginePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/assets/lead-moment/cube-floor.js'; script.async = true;
    script.onload = resolve; script.onerror = () => reject(new Error('Wave grid unavailable'));
    document.head.append(script);
  });
  return enginePromise;
}

export function mountLeadMoment(root) {
  const host = root.querySelector('[data-lead-moment]');
  if (!host) return { setPaused() {}, destroy() {} };
  const find = name => host.querySelector(`[data-lm-${name}]`);
  const board = find('board'), canvas = find('canvas'), markers = find('markers');
  const cleanups = [];
  let view = 'intro', round = 0, draft = null, points = [], renderer = null, loading = false, disposed = false, paused = false, pointerStart = null;
  const listen = (target, event, fn, options) => { target.addEventListener(event, fn, options); cleanups.push(() => target.removeEventListener(event, fn, options)); };
  const announce = text => { find('announcement').textContent = text; };
  const text = (name, value) => { find(name).textContent = value; };
  const focus = name => find(name).focus({ preventScroll: true });
  const roundNames = ['A first visit', 'A useful next step', 'Your ideal enquiry', 'Your first Wisker'];
  function drawMarkers() {
    // Keep coincident answers readable without moving their actual coordinates.
    const visiblePoints = [];
    for (const point of points) {
      const same = visiblePoints.find(p => Math.hypot(p.x - point.x, p.y - point.y) < .025);
      if (same) { same.label += `·${point.label}`; same.color = '#f3f0e9'; }
      else visiblePoints.push({ ...point });
    }
    markers.replaceChildren();
    for (const p of [...visiblePoints, ...(draft ? [{ ...draft, label: '•', provisional: true, color: colors[round] }] : [])]) {
      const dot = document.createElement('span'); dot.className = p.provisional ? 'lm-marker is-provisional' : 'lm-marker';
      dot.style.left = `${p.x * 100}%`; dot.style.top = `${(1 - p.y) * 100}%`; dot.style.background = p.color; dot.textContent = p.label;
      markers.append(dot);
    }
    renderer?.setPositions(visiblePoints);
    renderer?.setDraftColor(colors[round]);
    renderer?.setProvisional(draft, { emit: false });
  }
  async function initRenderer() {
    if (renderer || loading || disposed) return;
    loading = true;
    try {
      await loadEngine();
      if (disposed) return;
      renderer = window.createCubeFloor(canvas, { baseColor: '#29365a', highlightColor: '#f3f0e9', maxDpr: 1.3, interactive: false });
      // Our pointer-up handler ignores scroll gestures and shares one normalized
      // coordinate system with the keyboard and sliders.
      renderer.setInteractive(false); renderer.setPaused(paused); renderer.setMode(view);
      host.classList.add('lm-has-webgl'); markers.hidden = true; drawMarkers();
    } catch { host.classList.add('lm-flat-grid'); }
  }
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); initRenderer(); }
  }, { rootMargin: '350px' }) : null;
  if (observer) observer.observe(board); else initRenderer();
  function updateViews() {
    find('intro').hidden = view !== 'intro'; find('round').hidden = view !== 'round'; find('summary').hidden = view !== 'result';
    find('map-help').hidden = view === 'result';
    find('inputs').hidden = view !== 'round'; find('results').hidden = view !== 'result'; find('locked-caption').hidden = view !== 'result';
    host.dataset.leadView = view;
    host.querySelectorAll('[data-lm-corner]').forEach(button => { button.disabled = view !== 'round'; });
    renderer?.setMode(view);
    if (view === 'round') {
      text('number', round + 1); text('round-label', roundNames[round]); text('question', rounds[round].title);
      text('help', rounds[round].help); text('context', rounds[round].context); text('prompt', rounds[round].prompt);
      text('map-caption', `Place point ${round + 1} of 4.`);
      text('back', round ? 'Back one moment' : 'Start over');
      find('lock').textContent = round === 3 ? 'See my lead moment ↗' : 'Lock this point ↗';
      find('lock').disabled = !draft;
      const progress = host.querySelector('[role="progressbar"]'); progress.setAttribute('aria-valuenow', String(points.length));
      find('progress').style.width = `${points.length / 4 * 100}%`;
      find('x').value = Math.round((draft?.x ?? .5) * 100); find('y').value = Math.round((draft?.y ?? .5) * 100);
      text('position', draft ? positionDescription(draft) : 'Choose a point for this moment.');
    } else text('map-caption', view === 'result' ? 'Your four moments, together.' : 'Start to place your first point.');
    drawMarkers();
  }
  function positionDescription(p) {
    const clarity = p.x < .35 ? 'finding the need' : p.x > .65 ? 'clear on the need' : 'some clarity about the need';
    const readiness = p.y < .35 ? 'still exploring' : p.y > .65 ? 'ready to move' : 'considering a next step';
    return `${clarity.charAt(0).toUpperCase() + clarity.slice(1)}; ${readiness}.`;
  }
  function place(p) {
    if (view !== 'round') return;
    draft = { x: clamp(p.x), y: clamp(p.y) };
    find('lock').disabled = false;
    find('x').value = Math.round(draft.x * 100); find('y').value = Math.round(draft.y * 100);
    text('position', positionDescription(draft)); drawMarkers();
  }
  function start() {
    view = 'round'; round = 0; draft = null; points = [];
    renderer?.clearPositions(); updateViews(); initRenderer(); focus('question');
    announce('Moment 1 of 4. Place a point, then lock it to continue.');
  }
  function reset() {
    view = 'intro'; round = 0; draft = null; points = [];
    renderer?.clearPositions(); updateViews(); find('results').replaceChildren(); focus('start');
    announce('Your points have been cleared. Ready to begin again.');
  }
  function result() {
    const summary = summarizePoints(points), p = summary.profile;
    text('profile', summary.mixed ? 'A mix of lead moments' : p.title);
    text('description', summary.mixed ? 'Your choices sit between several kinds of help. That can be a useful sign to focus your first experience on one clear moment, then give people a route to explore further.' : p.description);
    text('pattern', summary.spread > .45 ? 'Your points cover different parts of the map. The help someone needs can change from a first visit to a first conversation.' : 'Your points gather in a similar part of the map. That gives you a consistent place to begin.');
    text('idea', p.idea);
    const resultMarkup = `<div class="lm-result-top"><div><p class="lm-kicker">Make it useful</p><h3>An idea to<br><em>build on.</em></h3></div><p data-v6-warp>Based on the four points you placed, ${summary.mixed ? 'one route worth exploring is' : 'your choices lean towards'} “${escape(p.label)}”. Explore how that could work, then bring your own offer into the picture.</p></div>
      <div class="lm-result-grid"><article><h4>What this could look like</h4><p data-v6-warp>${escape(p.example)}</p><ol class="lm-journey">${p.steps.map(step => `<li><p data-v6-warp>${escape(step)}</p></li>`).join('')}</ol></article>
      <article><h4>A question for your team</h4><p class="lm-team-question" data-v6-warp>${escape(p.question)}</p><h4>What the experience could reveal</h4><p data-v6-warp>${escape(p.signal)}</p><p data-v6-warp>Those deliberate choices can give your team context for the next conversation.</p><a class="v6-text-link" href="mailto:hello@wiskers.click?subject=My%20lead%20moment">Talk through this idea <span aria-hidden="true">↗</span></a></article></div>
      <div class="lm-answer-review"><h4>Your four moments</h4><ol>${points.map((point, i) => `<li><span class="lm-answer-number" style="--lm-point-color:${point.color}">${i + 1}</span><div><h5>${escape(rounds[i].title)}</h5><p data-v6-warp>${escape(positionDescription(point))} Closest to “${escape(nearestProfile(point).label)}”.</p></div></li>`).join('')}</ol></div>
      <details class="lm-team-readout"><summary>Peek behind the choices <span aria-hidden="true">+</span></summary><p data-v6-warp>This is what your answers add to the conversation: the moments you placed, the kind of help closest to each point, and where your priorities come together.</p><ul>${summary.counts.filter(item => item.count).map(item => `<li><span>${escape(item.label)}</span><strong>${item.count} of 4 points</strong></li>`).join('')}</ul><p data-v6-warp>The result reflects these choices. A useful next question is how they connect to your real offer and the people you want to reach.</p></details>`;
    find('results').innerHTML = resultMarkup;
    view = 'result'; updateViews(); focus('profile'); announce(`All four moments locked. ${summary.mixed ? 'Your result brings together several lead moments.' : p.title + '.'} Your idea and four-point review are ready below.`);
  }
  function lock() {
    if (view !== 'round' || !draft) return;
    points.push({ ...draft, id: String(round + 1), label: String(round + 1), color: colors[round] }); draft = null;
    if (round === 3) result();
    else { round++; updateViews(); focus('question'); announce(`Moment ${round + 1} of 4. ${rounds[round].title}`); }
  }
  listen(find('start'), 'click', start);
  find('start').disabled = false;
  listen(find('replay'), 'click', reset);
  listen(find('lock'), 'click', lock);
  listen(find('back'), 'click', () => {
    if (!round) return reset();
    round--; draft = points.pop(); updateViews(); focus('question'); announce(`Back to moment ${round + 1}. Your previous point is ready to adjust.`);
  });
  host.querySelectorAll('[data-lm-corner]').forEach(button => listen(button, 'click', () => {
    const p = profiles.find(profile => profile.id === button.dataset.lmCorner);
    place({ x: p.x ? .78 : .22, y: p.y ? .78 : .22 });
  }));
  listen(find('x'), 'input', event => place({ x: Number(event.target.value) / 100, y: draft?.y ?? .5 }));
  listen(find('y'), 'input', event => place({ x: draft?.x ?? .5, y: Number(event.target.value) / 100 }));
  listen(canvas, 'pointerdown', event => { if (event.button === 0) pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { passive: true });
  listen(canvas, 'pointerup', event => {
    if (view !== 'round' || !pointerStart || event.pointerId !== pointerStart.id) return;
    const startPoint = pointerStart; pointerStart = null;
    if (Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) > 10) return;
    const rect = canvas.getBoundingClientRect();
    place({ x: (event.clientX - rect.left) / rect.width, y: 1 - (event.clientY - rect.top) / rect.height });
  }, { passive: true });
  listen(canvas, 'pointercancel', () => { pointerStart = null; }, { passive: true });
  listen(canvas, 'pointerleave', () => { pointerStart = null; }, { passive: true });
  listen(canvas, 'keydown', event => {
    if (view !== 'round') return;
    const deltas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (deltas[event.key]) { event.preventDefault(); const [x, y] = deltas[event.key], step = event.shiftKey ? .08 : .035; place({ x: (draft?.x ?? .5) + x * step, y: (draft?.y ?? .5) + y * step }); }
    else if ((event.key === 'Enter' || event.key === ' ') && draft) { event.preventDefault(); lock(); }
  });
  updateViews();
  return { setPaused(value) { paused = Boolean(value); renderer?.setPaused(paused); }, destroy() { disposed = true; observer?.disconnect(); cleanups.forEach(cleanup => cleanup()); renderer?.destroy(); renderer = null; } };
}
