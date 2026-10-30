// A short, purposeful link from a choice to its observed event; no animated copy.
export function mountSignalLinks(solution, engine) {
  const ns = 'http://www.w3.org/2000/svg';
  const trace = document.createElementNS(ns, 'svg');
  trace.classList.add('studio-signal-trace');
  trace.setAttribute('aria-hidden', 'true');
  solution.append(trace);
  const carriers = document.createElement('div');
  carriers.className = 'studio-signal-carriers';
  carriers.setAttribute('aria-hidden', 'true');
  document.body.append(carriers);
  const colours = ['#ef767a', '#7fb7ce'];
  const keys = ['large', 'sensors'];
  const rows = keys.map((key, i) => {
    const source = solution.querySelector(`[data-activity="${key}"]`);
    const target = engine.querySelectorAll('.engine-signal-panel li')[i];
    const dot = document.createElement('i');
    dot.style.setProperty('--signal-colour', colours[i]);
    dot.hidden = true;
    carriers.append(dot);
    source.style.setProperty('--signal-colour', colours[i]);
    target.style.setProperty('--signal-colour', colours[i]);
    return {key, source, target, dot, observed: false};
  });
  let reduced = false, animations = [], anchors = [], width = 1, distance = 1;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => n * n * (3 - 2 * n);
  const mix = (a, b, t) => a + (b - a) * t;

  function measure() {
    width = innerWidth;
    distance = engine.offsetTop - solution.offsetTop;
    anchors = rows.map(({source, target}) => {
      const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
      return {a: {x: a.left + 3, y: a.top + scrollY - solution.offsetTop + a.height / 2},
        b: {x: b.left + 2, y: b.top + scrollY - engine.offsetTop + b.height / 2}};
    });
  }

  function record(key) {
    const row = rows.find(row => row.key === key);
    if (!row) return;
    row.observed = true;
    if (reduced || solution.getBoundingClientRect().top < -30) return;
    animations.forEach(animation => animation.cancel());
    trace.replaceChildren();
    const button = solution.querySelector(`[data-demo="${key}"]`);
    const a = button.getBoundingClientRect(), b = row.source.getBoundingClientRect();
    const r = solution.getBoundingClientRect();
    const start = {x: a.left + a.width * .5 - r.left, y: a.top - r.top};
    const end = {x: b.left - r.left + 3, y: b.top - r.top + b.height / 2};
    trace.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${start.x},${start.y} C${start.x},${start.y - 60} ${end.x - 50},${end.y} ${end.x},${end.y}`);
    path.setAttribute('stroke', colours[keys.indexOf(key)]);
    path.setAttribute('pathLength', '1');
    trace.append(path);
    animations = [path.animate([
      {strokeDashoffset: 1, opacity: 0},
      {opacity: .7, offset: .12},
      {strokeDashoffset: 0, opacity: .7, offset: .65},
      {strokeDashoffset: 0, opacity: 0}
    ], {duration: 1200, fill: 'forwards'})];
  }

  function update(progress) {
    rows.forEach((row, i) => {
      const t = clamp((progress - .12 - i * .045) / .72);
      row.dot.hidden = reduced || !row.observed || t <= 0 || t >= 1;
      if (row.dot.hidden || !anchors[i]) return;
      const {a, b} = anchors[i], p = ease(t);
      const x = mix(a.x, b.x, p) - Math.sin(p * Math.PI) * width * .11;
      const y = mix(a.y - progress * distance, b.y + (1 - progress) * distance, p);
      row.dot.style.transform = `translate(${x}px,${y}px)`;
      row.dot.style.opacity = Math.min(t * 9, (1 - t) * 9, 1);
    });
  }

  function engineTime(seconds, start, forced = false) {
    const top = engine.getBoundingClientRect().top;
    rows.forEach((row, i) => {
      const t = clamp((seconds - 7.05 - i * .45) / .95);
      row.target.classList.toggle('is-delivered', forced || t >= 1);
      row.dot.hidden = reduced || forced || t <= 0 || t >= 1;
      if (row.dot.hidden || !anchors[i]) return;
      const p = ease(t), end = anchors[i].b;
      row.dot.style.transform = `translate(${mix(start.x, end.x, p)}px,${mix(start.y, end.y + top, p) - Math.sin(p * Math.PI) * 30}px)`;
      row.dot.style.opacity = Math.min(t * 8, (1 - t) * 8, 1);
    });
  }

  measure();
  return {measure, record, update, engineTime,
    reset() {rows.forEach(row => {row.observed = false; row.dot.hidden = true;}); trace.replaceChildren();},
    setReduced(value) {reduced = value; animations.forEach(animation => animation.cancel()); trace.replaceChildren(); if (value) rows.forEach(row => row.dot.hidden = true);},
    destroy() {animations.forEach(animation => animation.cancel()); trace.remove(); carriers.remove();}
  };
}
