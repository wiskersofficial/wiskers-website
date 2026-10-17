let instanceCount = 0;

const chapters = [
  { id: 'calculator', title: 'Make the assumptions visible.', kicker: '01 / SCENARIO CALCULATOR', intro: 'Change the inputs. See the result.', mark: '01' },
  { id: 'diagnostic', title: 'Find a useful place to begin.', kicker: '02 / GUIDED DIAGNOSTIC', intro: 'Answer a few questions to find a starting point.', mark: '02' },
  { id: 'decision', title: 'Choose what deserves weight.', kicker: '03 / DECISION TOOL', intro: 'Set priorities. Shape the comparison.', mark: '03' },
];

export function mountExhibition(root) {
  if (!root || typeof root.append !== 'function') throw new TypeError('mountExhibition requires a DOM mount element.');
  const uid = `v5-exhibition-${++instanceCount}`;
  const section = document.createElement('section');
  section.className = 'v5-exhibition';
  section.setAttribute('aria-label', 'Three illustrative ways to explore a question');
  section.innerHTML = `
    <header class="vx-opening">
      <div class="vx-opening__copy"><p class="vx-kicker"><span></span> WISKERS / EXAMPLES</p><h2>Clarity takes a shape.</h2><p>Calculate. Find a starting point. Compare what matters.</p><p class="vx-note">Illustrative examples · results follow your inputs</p></div>
      <svg class="vx-opening__drawing" viewBox="0 0 600 390" role="img" aria-labelledby="${uid}-art-title ${uid}-art-desc"><title id="${uid}-art-title">Three interactive examples in perspective</title><desc id="${uid}-art-desc">A calculator card shows inputs flowing to a total, a branching card traces questions toward a starting point, and a balance card weighs comparison criteria. The three panels drift independently as you move past.</desc><g class="vx-art-flow"><path class="vx-preview-link" d="M176 154c30-16 30-20 57-22m129 10c28 5 39 10 54 27"/><circle class="vx-preview-node" cx="215" cy="143" r="5"/><circle class="vx-preview-node" cx="389" cy="150" r="5"/>
        <g class="vx-art-band vx-art-band--one vx-preview-card vx-preview-card--calc"><path class="vx-card-shadow" d="M44 100 179 76l18 11v155l-18-10-135 25z"/><path class="vx-card-depth" d="m179 76 18 11v155l-18-10z"/><path class="vx-card-face" d="M44 100 179 76v156L44 257z"/><path class="vx-card-edge" d="m44 100 18 11 135-24m-153 170 18-10 135-15"/><text class="vx-card-label" x="61" y="132">01 / CALCULATE</text><path class="vx-card-rule" d="m62 151 88-16m-88 37 42-8m-42 27 56-10"/><path class="vx-card-field" d="m62 169 56-10v20l-56 10zm0 32 56-9v20l-56 9z"/><path class="vx-card-result" d="m133 179 31-6v43l-31 6z"/><path class="vx-card-rule" d="m139 192 19-4m-19 12 14-3"/><circle class="vx-card-dot" cx="156" cy="111" r="5"/></g>
        <g class="vx-art-band vx-art-band--two vx-preview-card vx-preview-card--diagnostic"><path class="vx-card-shadow" d="m235 43 126 16 17-9v166l-17 9-126-15z"/><path class="vx-card-depth" d="m361 59 17-9v166l-17 9z"/><path class="vx-card-face" d="m235 43 126 16v166l-126-15z"/><path class="vx-card-edge" d="m235 43 17 10 126 15m-143 142 17-8 126 15"/><text class="vx-card-label" x="255" y="79">02 / FIND A WAY IN</text><path class="vx-branch-line" d="m258 106 24 18m-24 0h24m-24 20 24-18m0 0 27-17m-27 17 27 16m-27-16 27 0"/><circle class="vx-branch-dot" cx="258" cy="106" r="4"/><circle class="vx-branch-dot" cx="258" cy="124" r="4"/><circle class="vx-branch-dot" cx="258" cy="144" r="4"/><path class="vx-branch-end" d="m309 101 28 5v37l-28-4z"/><path class="vx-card-rule" d="m259 171 74 9m-74 12 56 7"/></g>
        <g class="vx-art-band vx-art-band--three vx-preview-card vx-preview-card--decision"><path class="vx-card-shadow" d="m412 103 138 15 17-11v144l-17 12-138-15z"/><path class="vx-card-depth" d="m550 118 17-11v144l-17 12z"/><path class="vx-card-face" d="m412 103 138 15v144l-138-15z"/><path class="vx-card-edge" d="m412 103 17 10 138 15m-155 104 17-8 138 15"/><text class="vx-card-label" x="432" y="139">03 / WEIGH OPTIONS</text><path class="vx-scale" d="m481 159 26 7 26-2m-26-21v53m-48-43-13 30h31zm96 10-13 30h31zm-66 49 26-2 26 3"/><circle class="vx-scale-pivot" cx="507" cy="144" r="5"/><path class="vx-card-rule" d="m437 219 99 11"/></g>
        <g class="vx-art-thread"><path d="M197 164c12-7 18-12 27-18m156 7c12 1 22 5 31 13" stroke-dasharray="4 7"/><circle cx="224" cy="145" r="4"/><circle cx="405" cy="167" r="4"/></g></g></svg>
    </header>
    <nav class="vx-index" aria-label="Exhibition chapters"><span class="vx-index__label">JUMP TO</span>${chapters.map((c, i) => `<a href="#${uid}-${c.id}" data-chapter="${i}"><span>0${i + 1}</span>${c.id === 'calculator' ? 'Inputs' : c.id === 'diagnostic' ? 'Start' : 'Compare'}</a>`).join('')}<span class="vx-index__counter" aria-live="polite"><b data-current>01</b><span> / </span><span>03</span></span></nav>
    <article class="vx-chapter" id="${uid}-calculator" data-chapter-section="0" aria-labelledby="${uid}-calculator-title">
      <div class="vx-chapter__intro"><p class="vx-kicker">${chapters[0].kicker}</p><h3 id="${uid}-calculator-title">See the numbers.</h3><p>${chapters[0].intro}</p><p class="vx-assumption">Monthly amount × duration</p></div>
      <div class="vx-calculator" aria-labelledby="${uid}-calculator-title"><div class="vx-calculator__diagram"><div class="vx-scene-caption"><span>01 / THE SCENARIO ENGINE</span><span>INPUT → ARITHMETIC → OUTPUT</span></div><svg viewBox="0 0 900 260" role="img" aria-labelledby="${uid}-calc-art-title"><title id="${uid}-calc-art-title">Amount and duration flow through a simple calculation</title><path class="vx-calc-path" d="M38 130h145m0 0 78-84m-78 84 78 84m0-168h122m-122 84h122m-122 84h122m0-168 85 84-85 84m85-84h198"/><rect x="183" y="99" width="78" height="62"/><rect x="383" y="90" width="86" height="80"/><rect x="650" y="66" width="202" height="128"/><path d="M687 102h126m-126 30h92m-92 30h112"/><circle cx="183" cy="130" r="9"/><circle cx="469" cy="130" r="9"/><text x="222" y="137">£</text><text x="405" y="137">×</text></svg><div class="vx-diagram-caption"><span>AMOUNT</span><span>DURATION</span><span>TOTAL</span></div></div><form class="vx-form" data-calculator><label>Hypothetical monthly amount <span class="vx-input-wrap"><span>£</span><input name="amount" type="number" min="0" max="100000" step="10" value="240" inputmode="decimal"></span></label><label>Number of months <span class="vx-input-wrap"><input name="months" type="number" min="1" max="60" step="1" value="6" inputmode="numeric"><span>months</span></span></label><div class="vx-result" aria-live="polite" aria-atomic="true"><span>Illustrative total</span><strong data-total>£1,440</strong><small>Monthly amount × months</small></div><button class="vx-secondary-action" type="reset">Restore example values</button></form></div>
    </article>
    <article class="vx-chapter" id="${uid}-diagnostic" data-chapter-section="1" aria-labelledby="${uid}-diagnostic-title">
      <div class="vx-chapter__intro"><p class="vx-kicker">${chapters[1].kicker}</p><h3 id="${uid}-diagnostic-title">${chapters[1].title}</h3><p>${chapters[1].intro}</p></div>
      <div class="vx-diagnostic" aria-labelledby="${uid}-diagnostic-title"><div class="vx-diagnostic__questions"><div class="vx-scene-caption"><span>02 / THE QUESTION BRANCH</span><span>ORIENT → CHOOSE → BEGIN</span></div><svg class="vx-branch-art" viewBox="0 0 1200 210" role="img" aria-labelledby="${uid}-diag-art-title"><title id="${uid}-diag-art-title">Three possible lines of inquiry converge on a starting point</title><path d="M20 46h230c160 0 148 55 340 55h350M20 105h620m-620 59h230c160 0 148-55 340-55"/><circle cx="250" cy="46" r="12"/><circle cx="250" cy="105" r="12"/><circle cx="250" cy="164" r="12"/><path class="vx-branch-terminal" d="M860 83h130l40 22-40 22H860z"/><circle cx="1052" cy="105" r="19"/></svg><div class="vx-diagnostic__choices"><fieldset><legend>What feels least clear right now?</legend><label><input type="radio" name="${uid}-unclear" value="goal" checked><span>What I’m trying to achieve</span></label><label><input type="radio" name="${uid}-unclear" value="options"><span>Which options I have</span></label><label><input type="radio" name="${uid}-unclear" value="evidence"><span>What information to trust</span></label></fieldset><fieldset><legend>What would help you move?</legend><label><input type="radio" name="${uid}-move" value="talk" checked><span>A conversation with someone</span></label><label><input type="radio" name="${uid}-move" value="compare"><span>A side-by-side comparison</span></label><label><input type="radio" name="${uid}-move" value="small"><span>One small action</span></label></fieldset></div><button class="vx-action" type="button" data-diagnose>Show a starting point <span aria-hidden="true">↗</span></button></div><div class="vx-diagnostic__answer" aria-live="polite" aria-atomic="true"><span class="vx-answer-label">YOUR STARTING POINT</span><h4 data-diagnostic-title>Write down the outcome you want.</h4><p data-diagnostic-copy>Describe what “better” would look like in one sentence, then take it into a conversation with someone who knows the context.</p><span class="vx-answer-mark" aria-hidden="true">01</span></div></div>
    </article>
    <article class="vx-chapter" id="${uid}-decision" data-chapter-section="2" aria-labelledby="${uid}-decision-title">
      <div class="vx-chapter__intro"><p class="vx-kicker">${chapters[2].kicker}</p><h3 id="${uid}-decision-title">${chapters[2].title}</h3><p>${chapters[2].intro}</p></div>
      <div class="vx-decision" aria-labelledby="${uid}-decision-title"><div class="vx-decision__controls"><div class="vx-scene-caption"><span>03 / THE WEIGHING TABLE</span><span>SELECT UP TO THREE FACTORS</span></div><svg class="vx-balance-art" viewBox="0 0 1200 250" role="img" aria-labelledby="${uid}-decision-art-title"><title id="${uid}-decision-art-title">A broad balance scale with two open pans for comparing options</title><path d="M600 24v168m-366-126h732M234 66 88 190h292zm732 0L820 190h292zM488 218h224"/><circle cx="600" cy="66" r="17"/><path d="M544 218h112"/><circle cx="234" cy="66" r="10"/><circle cx="966" cy="66" r="10"/></svg><fieldset><legend>Choose up to three priorities</legend><div class="vx-priority-row"><label><input type="checkbox" value="cost" checked><span>Cost</span></label><label><input type="checkbox" value="effort" checked><span>Effort</span></label><label><input type="checkbox" value="flexibility"><span>Flexibility</span></label><label><input type="checkbox" value="time"><span>Time</span></label><label><input type="checkbox" value="support"><span>Support</span></label></div></fieldset><p class="vx-hint">Select or clear priorities to shape the comparison.</p><button class="vx-secondary-action" type="button" data-focus-board>Review criteria <span aria-hidden="true">↗</span></button></div><div class="vx-decision__board" aria-live="polite" aria-atomic="true" tabindex="-1" data-board><div class="vx-board-head"><span>CRITERIA TO DISCUSS</span><span data-criteria-count>02 SELECTED</span></div><ol data-criteria-list><li><span>01</span><b>Cost</b><i>What would I need to commit?</i></li><li><span>02</span><b>Effort</b><i>What would it take to maintain?</i></li></ol><p class="vx-board-foot">Add an option below each criterion and note what you still need to learn.</p></div></div>
    </article>
    <footer class="vx-outro"><span>END / EXHIBITION 01—03</span><p>Useful decisions start with visible assumptions and questions you can answer.</p><button type="button" data-reset-all>Reset all examples ↑</button></footer>`;

  const indexLinks = [...section.querySelectorAll('.vx-index a')];
  const current = section.querySelector('[data-current]');
  const sections = [...section.querySelectorAll('[data-chapter-section]')];
  const indexHandlers = [];
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setChapter(Number(visible.target.dataset.chapterSection));
  }, { rootMargin: '-24% 0px -56% 0px', threshold: [0, .15, .4] }) : null;
  function setChapter(index) {
    current.textContent = `0${index + 1}`;
    indexLinks.forEach((link, i) => { if (i === index) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  sections.forEach((item) => observer?.observe(item));
  indexLinks.forEach((link) => {
    const handler = () => setChapter(Number(link.dataset.chapter));
    indexHandlers.push(handler);
    link.addEventListener('click', handler);
  });

  const calc = section.querySelector('[data-calculator]');
  const total = section.querySelector('[data-total]');
  const format = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const updateTotal = () => { const amount = Math.max(0, Number(calc.elements.amount.value) || 0); const months = Math.max(1, Number(calc.elements.months.value) || 1); total.textContent = format.format(amount * months); };
  calc.addEventListener('input', updateTotal);
  const onCalcReset = () => requestAnimationFrame(updateTotal);
  calc.addEventListener('reset', onCalcReset);

  const diagnosis = {
    'goal-talk': ['Name the outcome you want.', 'Write one sentence about what “better” looks like, then use it to guide a conversation with someone who knows the context.'],
    'goal-compare': ['List two possible outcomes.', 'Describe what each outcome would change. A simple side-by-side list can reveal what you need to clarify next.'],
    'goal-small': ['Choose one observable sign of progress.', 'Write down a small change you could notice this week, then decide how you will check whether it happened.'],
    'options-talk': ['Bring two options to a conversation.', 'For each option, write what you know and what is still a guess. Ask someone familiar with the context to challenge the gaps.'],
    'options-compare': ['Compare the options on one shared criterion.', 'Choose a factor that matters to you, describe how each option handles it, and flag where you need more information.'],
    'options-small': ['Find one low effort way to learn about an option.', 'Identify a small question you can answer without committing to a choice, then record what the answer changes.'],
    'evidence-talk': ['Trace one important claim to its source.', 'Write down the claim, where it came from, and what you would ask a knowledgeable person to help verify.'],
    'evidence-compare': ['Check the same claim across two sources.', 'Note where the sources agree, where they differ, and which detail would matter for your decision.'],
    'evidence-small': ['Write one question the evidence should answer.', 'Keep it narrow enough to investigate. Record what would count as a useful answer before you search.'],
  };
  const diagnose = section.querySelector('[data-diagnose]');
  const answerTitle = section.querySelector('[data-diagnostic-title]');
  const answerCopy = section.querySelector('[data-diagnostic-copy]');
  const radioInputs = [...section.querySelectorAll(`input[name="${uid}-unclear"], input[name="${uid}-move"]`)];
  const updateDiagnosis = () => {
    const key = `${section.querySelector(`input[name="${uid}-unclear"]:checked`).value}-${section.querySelector(`input[name="${uid}-move"]:checked`).value}`;
    const [title, copy] = diagnosis[key]; answerTitle.textContent = title; answerCopy.textContent = copy;
  };
  diagnose.addEventListener('click', updateDiagnosis);
  radioInputs.forEach((input) => input.addEventListener('change', updateDiagnosis));

  const checks = [...section.querySelectorAll('.vx-decision input[type="checkbox"]')];
  const prompts = { cost: 'What would I need to commit?', effort: 'What would it take to maintain?', flexibility: 'How easily could I change course?', time: 'When would I notice a difference?', support: 'Who could help if I get stuck?' };
  const list = section.querySelector('[data-criteria-list]');
  const count = section.querySelector('[data-criteria-count]');
  const board = section.querySelector('[data-board]');
  const updateCriteria = (changed) => {
    const chosen = checks.filter((box) => box.checked);
    if (chosen.length > 3) { if (changed) changed.checked = false; return; }
    list.innerHTML = chosen.map((box, i) => `<li><span>0${i + 1}</span><b>${box.parentElement.querySelector('span').textContent}</b><i>${prompts[box.value]}</i></li>`).join('') || '<li class="vx-empty">Choose a priority to begin.</li>';
    count.textContent = `${String(chosen.length).padStart(2, '0')} SELECTED`;
  };
  const checkHandlers = checks.map((box) => () => updateCriteria(box));
  checks.forEach((box, i) => box.addEventListener('change', checkHandlers[i]));
  const focusBoard = section.querySelector('[data-focus-board]');
  const onFocusBoard = () => { updateCriteria(); board.focus(); };
  focusBoard.addEventListener('click', onFocusBoard);
  const reset = () => {
    calc.reset();
    radioInputs.forEach((input) => { input.checked = input.defaultChecked; });
    checks.forEach((input) => { input.checked = input.defaultChecked; });
    updateTotal();
    updateDiagnosis();
    updateCriteria();
    setChapter(0);
    sections[0].scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  const resetAll = section.querySelector('[data-reset-all]');
  resetAll.addEventListener('click', reset);

  const artwork = section.querySelector('.vx-opening__drawing');
  let artworkVisible = false;
  let scrollFrame = 0;
  let motionObserver;
  const updateArtworkScroll = () => {
    scrollFrame = 0;
    const rect = artwork.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (window.innerHeight * .68 - rect.top) / (window.innerHeight + rect.height)));
    artwork.style.setProperty('--vx-scroll', progress.toFixed(3));
  };
  const onArtworkScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateArtworkScroll);
  };
  motionObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
    artworkVisible = entry.isIntersecting;
    artwork.classList.toggle('is-in-view', artworkVisible);
    if (artworkVisible) updateArtworkScroll();
    else artwork.style.setProperty('--vx-scroll', '0');
  }, { threshold: .1 }) : null;
  motionObserver?.observe(artwork);
  if (!motionObserver) { artworkVisible = true; artwork.classList.add('is-in-view'); }
  window.addEventListener('scroll', onArtworkScroll, { passive: true });
  window.addEventListener('resize', onArtworkScroll, { passive: true });
  updateArtworkScroll();

  root.append(section);
  return { reset, destroy() { observer?.disconnect(); motionObserver?.disconnect(); if (scrollFrame) cancelAnimationFrame(scrollFrame); window.removeEventListener('scroll', onArtworkScroll); window.removeEventListener('resize', onArtworkScroll); indexLinks.forEach((link, i) => link.removeEventListener('click', indexHandlers[i])); calc.removeEventListener('input', updateTotal); calc.removeEventListener('reset', onCalcReset); diagnose.removeEventListener('click', updateDiagnosis); radioInputs.forEach((input) => input.removeEventListener('change', updateDiagnosis)); checks.forEach((box, i) => box.removeEventListener('change', checkHandlers[i])); focusBoard.removeEventListener('click', onFocusBoard); resetAll.removeEventListener('click', reset); section.remove(); } };
}
