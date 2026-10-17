import './site.css';
import './keypad.css';
import './exhibition.css';
import './ambient.css';
import './capability-art.css';
import { mountKeypad } from './keypad.js';
import { mountInstrument } from './instrument.js';
import { mountExhibition } from './exhibition.js';
import { mountAmbient } from './ambient.js';
import { mountCapabilityArt } from './capability-art.js';

const main = document.querySelector('#main-content');
if (main) {
  document.body.classList.remove('home-v3', 'home-v4');
  document.body.classList.add('home-v5', 'v5-reveal-enabled');
  main.className = 'v5-main';
  main.innerHTML = `
    <section class="v5-chapter v5-hero" id="home" aria-labelledby="v5-hero-title">
      <div class="v5-chapter-index">W / 00&nbsp;&nbsp; SIGNAL ROOM</div>
      <p class="v5-kicker">Wiskers / Interactive tools for considered decisions</p>
      <div class="v5-hero-copy">
        <h1 class="v5-display v5-breathe" id="v5-hero-title">Generic<br>content<br><span class="v5-hero-last-line">is <span class="v5-italic">everywhere.</span></span></h1>
        <p class="v5-hero-lead">The next evolution of hyper-targeted digital marketing. Hone in on your next B2B client without hours working down a list.</p>
        <div class="v5-hero-actions"><a class="v5-action" href="#v5-approach">Follow the signal <span aria-hidden="true">↓</span></a><a href="#contact">Start a conversation ↗</a></div>
      </div>
      <div class="v5-hero-art" data-keypad-mount></div>
    </section>
    <section class="v5-chapter v5-thesis" id="v5-thesis" aria-labelledby="v5-thesis-title">
      <div class="v5-chapter-index">01 / The shift</div>
      <h2 class="v5-display v5-breathe" id="v5-thesis-title">Insight takes<br><em>input.</em></h2>
      <div class="v5-thesis-copy"><p class="v5-display" style="font-size:clamp(30px,4vw,58px);line-height:.98;letter-spacing:-.06em">A PDF can tell you.<br><em class="v5-italic">A tool can show you.</em></p><p class="v5-thesis-explainer">Static content gives everyone the same answer. Interactive tools let each buyer explore their own constraints, options and next move.</p>
        <div class="v5-thesis-switch" role="group" aria-label="Compare static content with an interactive tool"><button type="button" data-thesis-mode="static" aria-pressed="true">01 / Static message</button><button type="button" data-thesis-mode="interactive" aria-pressed="false">02 / Interactive answer</button></div>
        <div class="v5-thesis-output" data-mode="static" aria-live="polite"><span class="v5-thesis-output-label">ONE MESSAGE FOR EVERYONE</span><strong>Everyone gets the same answer.</strong><span class="v5-thesis-output-foot">PDF / 01</span><fieldset class="v5-context-picker" hidden><legend>Try a buyer’s point of view</legend><button type="button" data-buyer-context="operations" aria-pressed="true">Operations</button><button type="button" data-buyer-context="finance" aria-pressed="false">Finance</button><button type="button" data-buyer-context="growth" aria-pressed="false">Growth</button></fieldset></div>
      </div>
    </section>
    <div id="v5-exhibition" class="v5-exhibition-host"></div>
    <section class="v5-approach" id="v5-approach" aria-labelledby="v5-approach-title">
      <div class="v5-approach-intro"><p class="v5-kicker">03 / How it takes shape</p><h2 class="v5-display v5-breathe" id="v5-approach-title">From question<br>to <em class="v5-italic">useful answer.</em></h2></div>
      <div class="v5-approach-rail" data-process-range>
        <div class="v5-approach-stage">
          <div class="v5-process-words" aria-hidden="true"><span>IDEA</span><span>CONCEPTION</span><span>LAUNCH</span></div>
          <div class="v5-process-story"><div class="v5-process-copy" aria-live="polite"><span class="v5-process-step">01 / IDEA · BRIEF</span><h3>Find the real question.</h3><p>We start with what your next client is already trying to work out, then make the audience, decision and constraints clear.</p></div>
          <div class="v5-process-controls" role="group" aria-label="Choose a process stage">${['Question','Design','Build','Launch'].map((label,i)=>`<button type="button" data-process-stage="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${label}</button>`).join('')}</div></div>
          <div class="v5-instrument-slot" data-instrument-mount></div>
        </div>
      </div>
      <div class="v5-approach-end"><span>QUESTION → DESIGN → BUILD → LAUNCH</span><a href="#contact">Make the first move ↗</a></div>
    </section>
    <section class="v5-chapter v5-capabilities" id="v5-capabilities" aria-labelledby="v5-capability-title">
      <div class="v5-chapter-index">04 / The business behind the tool</div>
      <div class="v5-capabilities-head"><div><p class="v5-kicker">Useful for buyers. Informative for you.</p><h2 class="v5-display v5-breathe" id="v5-capability-title">Find your next<br><em class="v5-italic">client in context.</em></h2></div><p>Give people something useful before asking for their time. Learn what they choose to explore.</p></div>
      <div class="v5-capability-grid">
        <article class="v5-capability"><div class="v5-capability-mark" aria-hidden="true">∑</div><h3>Calculate</h3><p>Let someone test a scenario using assumptions they can see and change.</p></article>
        <article class="v5-capability"><div class="v5-capability-mark" aria-hidden="true">⌖</div><h3>Diagnose</h3><p>Ask a few relevant questions and offer a focused place to start.</p></article>
        <article class="v5-capability"><div class="v5-capability-mark" aria-hidden="true">↔</div><h3>Compare</h3><p>Make the trade-offs between options easier to understand.</p></article>
        <article class="v5-capability"><div class="v5-capability-mark" aria-hidden="true">↗</div><h3>Learn</h3><p>Use real interactions to see what is clear and what needs work.</p></article>
      </div>
    </section>
    <section class="v5-chapter v5-business" id="v5-business" aria-labelledby="v5-business-title">
      <div><p class="v5-kicker">05 / A different kind of marketing</p><h2 class="v5-display v5-breathe" id="v5-business-title">Value first.<br><em class="v5-italic">Signal follows.</em></h2></div>
      <div class="v5-business-copy"><p>Turn your expertise into a useful moment for the people you want to reach.</p><div class="v5-business-tiles" aria-label="The Wiskers approach"><div class="v5-business-tile"><span>01 / IDEA</span><strong>Find the question</strong></div><div class="v5-business-tile"><span>02 / TOOL</span><strong>Shape the answer</strong></div><div class="v5-business-tile"><span>03 / LAUNCH</span><strong>Put it to work</strong></div></div></div>
      <figure class="v5-format-panel"><div class="v5-format-frames">
          <a class="v5-format-frame v5-format-frame--calculate" href="#v5-exhibition-1-calculator"><span>01 / CALCULATE</span><b>£240 × 6</b><i>SEE THE SCENARIO ↗</i></a>
          <a class="v5-format-frame v5-format-frame--diagnose" href="#v5-exhibition-1-diagnostic"><span>02 / DIAGNOSE</span><b>Where do I begin?</b><i>FIND A STARTING POINT ↗</i></a>
          <a class="v5-format-frame v5-format-frame--compare" href="#v5-exhibition-1-decision"><span>03 / COMPARE</span><b>Cost · Effort · Time</b><i>SET YOUR PRIORITIES ↗</i></a>
        </div><figcaption><span>TOOLS FOR REAL BUYER QUESTIONS</span><small>Illustrative formats · open a working example</small></figcaption></figure>
    </section>
    <section class="v5-chapter v5-contact" id="contact" aria-labelledby="v5-contact-title">
      <div class="v5-chapter-index">06 / Your turn</div><p class="v5-kicker">Have a question worth exploring?</p><h2 class="v5-display v5-breathe" id="v5-contact-title">Let’s make<br>something <em class="v5-italic">useful.</em></h2>
      <div class="v5-contact-bottom"><p>What are your buyers trying to figure out?</p><a class="v5-action" href="mailto:hello@wiskers.click">hello@wiskers.click <span aria-hidden="true">↗</span></a></div>
      <figure class="v5-camera" aria-hidden="true"><div class="v5-optic"><span class="v5-optic-mark">W / 21</span><div class="v5-optic-lens"><span>QUESTION</span><b>→</b><span>INSIGHT</span></div><i></i><i></i><i></i></div><div class="v5-contact-sheet">${[
        ['01 / CALC','AMOUNT × TIME'],['02 / CHECK','FIND A START'],['03 / WEIGH','COST · EFFORT'],
        ['04 / INPUT','£ 240'],['05 / BRANCH','GOAL → NEXT'],['06 / CHOOSE','PRIORITY 01'],
        ['07 / RESULT','ILLUSTRATIVE'],['08 / REVIEW','WHAT MATTERS?'],['09 / OUTPUT','NEXT STEP →'],
      ].map(([label, detail],i)=>`<span class="v5-contact-frame v5-contact-frame--${i%3}"><i>${label}</i><b></b><small>${detail}</small></span>`).join('')}</div><figcaption>ONE QUESTION / MANY USEFUL WAYS IN</figcaption></figure>

      <div class="v5-contact-sequence" aria-label="A question leads through interaction to insight"><span>QUESTION</span><span>INTERACTION</span><span>INSIGHT</span></div>
      <div class="v5-marquee" aria-hidden="true"><span>HELLO WISKERS&nbsp; · &nbsp;GOOD QUESTIONS MAKE BETTER TOOLS&nbsp; · &nbsp;HELLO WISKERS&nbsp; · &nbsp;</span></div>
    </section>
    <footer class="v5-footer"><span>© 2026 Wiskers</span><a href="/" aria-label="Wiskers website">wiskers.click</a><span>Interactive tools for B2B businesses</span><span class="v5-local-clock">EN / <time data-local-clock></time></span><nav aria-label="Legal"><a href="/privacy/index.html">Privacy &amp; cookies</a><a href="/terms/index.html">Website terms</a></nav></footer>
    `;

  const cleanup = [];
  const keypadRoot = main.querySelector('[data-keypad-mount]');
  const keypad = mountKeypad(keypadRoot);
  cleanup.push(() => keypad.destroy());
  const exhibitionRoot = main.querySelector('#v5-exhibition');
  const exhibition = mountExhibition(exhibitionRoot);
  if (exhibition?.destroy) cleanup.push(() => exhibition.destroy());
  mountCapabilityArt(main.querySelector('.v5-capability-grid'));
  const instrument = mountInstrument(main.querySelector('[data-instrument-mount]'));

  const processRange = main.querySelector('[data-process-range]');
  const processCopy = main.querySelector('.v5-process-copy');
  const processButtons = [...main.querySelectorAll('[data-process-stage]')];
  const processSteps = [
    ['01 / IDEA · BRIEF', 'Find the real question.', 'Start with what your next client needs to work out.'],
    ['02 / CONCEPTION · DESIGN', 'Make the answer useful.', 'Shape the experience around a real decision.'],
    ['03 / CONCEPTION · BUILD', 'Turn the idea into a tool.', 'Build and tune the working interaction.'],
    ['04 / LAUNCH', 'Put it to work.', 'Launch where buyers can find and use it.'],
  ];
  const transcript = document.createElement('ol');
  transcript.className = 'v5-process-transcript';
  transcript.setAttribute('aria-label', 'All four steps in the Wiskers process');
  processSteps.forEach(([label, title, detail]) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${label}: ${title}</strong><span>${detail}</span>`;
    transcript.append(item);
  });
  processRange.append(transcript);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let raf = 0;
  let priorStep = -1;
  let manualMobileStep = null;
  const update = () => {
    raf = 0;
    const r = processRange.getBoundingClientRect();
    const travel = Math.max(1, processRange.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, -r.top / travel));
    const scrollStep = Math.min(3, Math.floor(progress * 4));
    if (innerWidth > 900) manualMobileStep = null;
    const step = innerWidth <= 900 && manualMobileStep !== null ? manualMobileStep : scrollStep;
    const instrumentProgress = innerWidth <= 900 && manualMobileStep !== null ? manualMobileStep / 3 : progress;
    const visible = r.bottom > 0 && r.top < innerHeight;
    if (step !== priorStep) {
      const [label, title, detail] = processSteps[step];
      processCopy.querySelector('.v5-process-step').textContent = label;
      processCopy.querySelector('h3').textContent = title;
      processCopy.querySelector('p').textContent = detail;
      processButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === step)));
      processRange.dataset.stage = String(step);
      priorStep = step;
    }
    instrument.render({progress:instrumentProgress, stage: step, visible, motionEnabled: !paused && !reduceMotion.matches, ambientTime: performance.now()});
    const hero = main.querySelector('.v5-hero');
    const heroProgress = Math.max(0, Math.min(1, (innerHeight - hero.getBoundingClientRect().top) / (innerHeight + hero.offsetHeight)));
    if (!reduceMotion.matches) {
      for (const heading of main.querySelectorAll('.v5-breathe')) {
        const rect = heading.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, 1 - Math.abs((rect.top + rect.height / 2) - innerHeight * .5) / (innerHeight * .75)));
        heading.style.setProperty('--v5-breath', String(p));
        heading.style.setProperty('--v5-wdth', String(Math.round(78 + p * 46)));
        heading.style.setProperty('--v5-wght', String(Math.round(650 + p * 220)));
      }
    }
    main.style.setProperty('--v5-hero-progress', String(heroProgress));
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduceMotion.addEventListener?.('change', schedule);
  schedule();
  const selectProcessStage = (event) => {
    const step = Number(event.currentTarget.dataset.processStage);
    if (innerWidth <= 900) { manualMobileStep = step; }
    else {
      const rangeTop = processRange.getBoundingClientRect().top + scrollY;
      const travel = Math.max(1, processRange.offsetHeight - innerHeight);
      scrollTo({ top: rangeTop + travel * ((step + .5) / 4), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    const [label, title, detail] = processSteps[step];
    processCopy.querySelector('.v5-process-step').textContent = label;
    processCopy.querySelector('h3').textContent = title;
    processCopy.querySelector('p').textContent = detail;
    processButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === step)));
    processRange.dataset.stage = String(step);
    priorStep = step;
    instrument.render({progress:step/3, stage:step, visible:true, motionEnabled:!paused&&!reduceMotion.matches, ambientTime:performance.now()});
  };
  processButtons.forEach((button) => button.addEventListener('click', selectProcessStage));
  cleanup.push(() => processButtons.forEach((button) => button.removeEventListener('click', selectProcessStage)));
  cleanup.push(() => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); reduceMotion.removeEventListener?.('change', schedule); if (raf) cancelAnimationFrame(raf); instrument.destroy(); });

  const modeButtons = [...main.querySelectorAll('[data-thesis-mode]')];
  const output = main.querySelector('.v5-thesis-output');
  const thesisState = {
    static: ['ONE MESSAGE FOR EVERYONE', 'Everyone gets the same answer.', 'PDF / 01'],
    interactive: ['YOUR QUESTION / YOUR CONTEXT', 'Choose a buyer’s role to see what they need to work out.', 'INPUT → INSIGHT / LIVE'],
  };
  const setMode = (mode) => {
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.thesisMode === mode)));
    output.querySelector('.v5-thesis-output-label').textContent = thesisState[mode][0];
    output.querySelector('strong').textContent = thesisState[mode][1];
    output.querySelector('.v5-thesis-output-foot').textContent = thesisState[mode][2];
    output.dataset.mode = mode;
    output.querySelector('.v5-context-picker').hidden = mode !== 'interactive';
  };
  const onMode = (event) => setMode(event.currentTarget.dataset.thesisMode);
  modeButtons.forEach(button => button.addEventListener('click', onMode));
  cleanup.push(() => modeButtons.forEach(button => button.removeEventListener('click', onMode)));
  const contextAnswers = {
    operations: 'Map one repeated workflow and test where time gets lost.',
    finance: 'Set the assumptions, compare scenarios and see what changes.',
    growth: 'Explore which buyer question could open a more useful conversation.',
  };
  const contextButtons = [...main.querySelectorAll('[data-buyer-context]')];
  const selectContext = (event) => {
    contextButtons.forEach((button) => button.setAttribute('aria-pressed', String(button === event.currentTarget)));
    output.querySelector('strong').textContent = contextAnswers[event.currentTarget.dataset.buyerContext];
    output.querySelector('.v5-thesis-output-foot').textContent = `CONTEXT / ${event.currentTarget.dataset.buyerContext.toUpperCase()}`;
  };
  contextButtons.forEach((button) => button.addEventListener('click', selectContext));
  cleanup.push(() => contextButtons.forEach((button) => button.removeEventListener('click', selectContext)));

  const resetExample = () => {
    contextButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===0)));
    setMode('static');
    processButtons[0]?.click();
    main.querySelector('.v5-keypad__key')?.click();
    exhibition.reset?.();
  };
  const ambient = mountAmbient(main, {
    onPause: () => { paused = true; main.classList.add('v5-motion-paused'); schedule(); },
    onResume: () => { paused = false; main.classList.remove('v5-motion-paused'); schedule(); },
    onReset: resetExample,
  });
  cleanup.push(() => ambient.destroy());
  const clock = main.querySelector('[data-local-clock]');
  const updateClock = () => { clock.textContent = new Intl.DateTimeFormat(undefined, {hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date()); };
  updateClock();
  const clockTimer = setInterval(updateClock, 60_000);
  cleanup.push(() => clearInterval(clockTimer));

  const revealTargets = [...main.querySelectorAll('.v5-chapter, .v5-approach, .vx-chapter')];
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v5-strips-entered');
        revealObserver.unobserve(entry.target);
      }
    }), {rootMargin:'0px 0px -12% 0px', threshold:.02});
    revealTargets.forEach(section => revealObserver.observe(section));
    cleanup.push(() => revealObserver.disconnect());
  } else revealTargets.forEach(section => section.classList.add('v5-strips-entered'));

  document.querySelectorAll('.problem-trigger').forEach(button=>button.remove());
  const dialog = document.querySelector('#problem-panel');
  dialog?.remove();
  document.querySelector('.hv-footer')?.remove();
  document.querySelector('.v5-fallback-footer')?.remove();
  const skip = document.querySelector('.skip-link');
  if (skip) skip.href = '#main-content';

  addEventListener('pagehide', event => { if (!event.persisted) cleanup.forEach(fn=>fn()); }, {once:true});
}
