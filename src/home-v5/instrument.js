import './instrument.css';

const stages = [
  { id: 'question', label: 'BUYER QUESTION', title: 'What would make this decision easier?', detail: 'Start with the question someone is already trying to answer.' },
  { id: 'prototype', label: 'PROTOTYPE', title: 'Try the idea with real context.', detail: 'Shape a small, testable first version around their situation.' },
  { id: 'tool', label: 'WORKING TOOL', title: 'Turn the test into something useful.', detail: 'Give the team a practical way to explore the choice.' },
  { id: 'answer', label: 'USEFUL ANSWER', title: 'A clearer next step.', detail: 'Bring the inputs together into an answer they can act on.' },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const stageIndex = (value) => {
  if (typeof value === 'number') return clamp(Math.round(value), 0, stages.length - 1);
  const aliases = { 'buyer-question': 0, question: 0, prototype: 1, 'working-tool': 2, tool: 2, answer: 3, 'useful-answer': 3 };
  return aliases[String(value || 'buyer-question').toLowerCase()] ?? 0;
};

export function mountInstrument(root) {
  if (!root) throw new Error('mountInstrument requires a root element');
  root.innerHTML = `
    <section class="hv5-instrument" aria-label="From buyer question to useful answer">
      <div class="hv5-instrument__shadow" aria-hidden="true"></div>
      <div class="hv5-instrument__case">
        <div class="hv5-instrument__case-top"><span>WISKERS / DECISION ENGINE</span><span class="hv5-instrument__serial">FIELD UNIT · 01</span></div>
        <div class="hv5-instrument__bezel">
          <div class="hv5-instrument__screen">
            <div class="hv5-instrument__screen-top"><span class="hv5-instrument__led"></span><span>INPUT → WORKING TOOL → ANSWER</span><span class="hv5-instrument__screen-code">W / 01</span></div>
            <div class="hv5-instrument__display">
              <div class="hv5-instrument__visual" aria-hidden="true">
                <div class="hv5-instrument__visual-scene hv5-instrument__scene-question">
                  <span class="hv5-instrument__scene-label">IN THEIR WORDS</span><div class="hv5-instrument__prompt">How do I know<br>which option fits?</div><span class="hv5-instrument__cursor"></span>
                </div>
                <div class="hv5-instrument__visual-scene hv5-instrument__scene-prototype">
                  <div class="hv5-instrument__paper"><span class="hv5-instrument__scene-label">FIRST PASS / 01</span><i class="hv5-instrument__wire hv5-instrument__wire-title"></i><i class="hv5-instrument__wire"></i><div class="hv5-instrument__wire-grid"><b></b><b></b><b></b></div><i class="hv5-instrument__wire hv5-instrument__wire-short"></i><i class="hv5-instrument__wire"></i><span class="hv5-instrument__markup">test this</span></div>
                </div>
                <div class="hv5-instrument__visual-scene hv5-instrument__scene-tool">
                  <div class="hv5-instrument__tool-ui"><span class="hv5-instrument__scene-label">CHOICE BUILDER</span><b>What matters most?</b><span class="hv5-instrument__choice">○ &nbsp; Keep it simple</span><span class="hv5-instrument__choice is-selected">● &nbsp; Room to grow</span><span class="hv5-instrument__tool-action">COMPARE OPTIONS <i>↗</i></span></div>
                </div>
                <div class="hv5-instrument__visual-scene hv5-instrument__scene-answer">
                  <div class="hv5-instrument__answer-card"><span class="hv5-instrument__scene-label">YOUR NEXT STEP</span><strong>Test the smallest option that can teach you something.</strong><i>→</i></div>
                </div>
              </div>
              <div class="hv5-instrument__copy"><p class="hv5-instrument__eyebrow">01 / BUYER QUESTION</p><h2>What would make this decision easier?</h2><p class="hv5-instrument__detail">Start with the question someone is already trying to answer.</p></div>
            </div>
            <div class="hv5-instrument__meter" aria-label="Process progress"><span class="hv5-instrument__meter-fill"></span></div>
            <div class="hv5-instrument__screen-foot"><span>FOLLOW THE QUESTION</span><span class="hv5-instrument__stage-count">01 — 04</span></div>
          </div>
        </div>
        <div class="hv5-instrument__controls">
          <div class="hv5-instrument__dial" aria-hidden="true"><i></i><b>FOCUS</b></div>
          <div class="hv5-instrument__steps" aria-hidden="true">${stages.map((s, i) => `<span class="hv5-instrument__step ${i === 0 ? 'is-current' : ''}"><i>${String(i + 1).padStart(2, '0')}</i><b>${s.label}</b></span>`).join('')}</div>
          <div class="hv5-instrument__button" aria-hidden="true"><i></i><b>MAKE</b></div>
        </div>
      <div class="hv5-instrument__tape" aria-hidden="true"><span>W / 01 — FIELD NOTES</span><i></i><i></i><b>USEFUL SIGNAL</b></div>
      <div class="hv5-instrument__case-bottom"><span>BUILT AROUND A REAL QUESTION</span><span>WISKERS / FIELD UNIT</span></div>
      </div>
      <div class="hv5-instrument__feet" aria-hidden="true"><i></i><i></i></div>
    </section>`;

  const display = root.querySelector('.hv5-instrument__display');
  const visual = root.querySelector('.hv5-instrument__visual');
  const title = root.querySelector('h2');
  const eyebrow = root.querySelector('.hv5-instrument__eyebrow');
  const detail = root.querySelector('.hv5-instrument__detail');
  const fill = root.querySelector('.hv5-instrument__meter-fill');
  const count = root.querySelector('.hv5-instrument__stage-count');
  const stepEls = [...root.querySelectorAll('.hv5-instrument__step')];
  const frame = root.querySelector('.hv5-instrument');
  let destroyed = false;
  let lastIndex = -1;

  function render({ progress, stage, substep, visible = true, motionEnabled = true, ambientTime = 0 } = {}) {
    if (destroyed) return;
    const index = stageIndex(stage ?? (progress == null ? 0 : progress <= 1 ? Math.round(progress * 3) : progress));
    const item = stages[index];
    const pct = typeof progress === 'number' ? clamp(progress, 0, 1) : index / 3;
    frame.dataset.stage = item.id;
    frame.dataset.visible = String(visible);
    frame.dataset.motion = String(motionEnabled);
    visual.dataset.stage = item.id;
    frame.style.setProperty('--hv5-ambient', `${(Number(ambientTime) || 0) % 1000}ms`);
    if (lastIndex !== index) {
      eyebrow.textContent = `${String(index + 1).padStart(2, '0')} / ${item.label}`;
      title.textContent = item.title;
      detail.textContent = item.detail;
      count.textContent = `${String(index + 1).padStart(2, '0')} — 04`;
      lastIndex = index;
    }
    fill.style.transform = `scaleX(${pct})`;
    stepEls.forEach((el, i) => {
      el.classList.toggle('is-current', i === index);
      el.classList.toggle('is-done', i < index);
    });
    display.dataset.substep = substep || '';
  }

  render({ stage: 'buyer-question' });
  return { render, destroy() { destroyed = true; root.replaceChildren(); } };
}
