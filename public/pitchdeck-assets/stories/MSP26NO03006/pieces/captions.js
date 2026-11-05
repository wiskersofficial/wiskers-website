/* captions: the title and every caption come from the shared text layer. Title style 'words' (open space behind it);
 * captions reveal sentence by sentence, the newest in the accent colour. Plus the clock, the source line and the illustration label. */
Bagel.register('captions', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el, T = Bagel.text;
  T.theme = { base: '#EAF2FF', accent: '#FF7A3D' };
  var parts = [];
  parts.push(T.title(layer, ctx, {
    style: 'words', a: 0.005, b: 0.112, kicker: 'Space · 4 Nov 2026', group: 'title', inLen: 0.06,
    words: ['NASA’s', 'Swift', 'Observatory', 'to', { t: 're-enter', em: 1 }, 'the', 'atmosphere', 'after', '22', 'years']
  }));
  [
    { a: 0.135, b: 0.265, kicker: 'Built for two years', head: 'Still working after twenty-two', lines: ['Swift launched in 2004 with a planned two-year prime mission.', 'It weighs about 3,200 lb.'] },
    { a: 0.285, b: 0.42, kicker: 'What it watched', head: 'The biggest explosions in the universe', lines: ['Swift caught gamma-ray bursts first.', 'Then active galaxies, X-ray flares, supernovae, comets and asteroids.'], accent: '#7FB4FF' },
    { a: 0.445, b: 0.545, kicker: 'The rescue', head: 'A craft was sent to lift it', lines: ['Katalyst Space\u2019s LINK launched in July to lift it.', 'It began spinning out of control, and the attempt was abandoned in mid-August.'] },
    { a: 0.565, b: 0.665, kicker: 'No engine of its own', head: 'Drag is pulling it down', lines: ['Swift can’t boost itself.', 'A swollen atmosphere is dragging it lower.'], accent: '#7FB4FF' },
    { a: 0.685, b: 0.795, kicker: 'The burn', head: 'Most of it should burn up', lines: ['Some pieces should survive.', 'Any that do should land between 20.6° south and 20.6° north.'] },
    { a: 0.945, b: 1.03, zone: 'bottom', head: 'Designed for two years. It stayed for twenty-two.', lines: ['Sources: NASA Science (2 Nov 2026), Reuters (3 Nov), CNN (4 Nov).'], accent: '#7FB4FF' }
  ].forEach(function (c, i) { c.group = 'c' + i; parts.push(T.caption(layer, ctx, c)); });

  var clock = el('div', { 'class': 'clock', 'data-gate': 'text', 'data-gate-id': 'clock', html: '<b>Re-entry expected 4 Nov.</b> Estimates differ: about 3:30 a.m. ±11 h (NASA, 2 Nov); about 7:42 a.m. ±2 h (US Space Force, via CNN).' }, layer);
  var lab = el('div', { 'class': 'labels' }, layer);
  el('div', { 'class': 'src', 'data-gate': 'text', 'data-gate-id': 'sources', text: 'NASA Science · Reuters · CNN, 2–4 Nov 2026' }, lab);
  var ill = el('div', { 'class': 'ill', 'data-gate': 'text', 'data-gate-id': 'illustration', html: '<b>Illustration</b>Stylised craft, not to scale. Only reported facts are stated.' }, lab);

  var unsub = ctx.timeline.subscribe(function (p) {
    clock.style.opacity = U.seg(p, 0.035, 0.055) * (1 - U.seg(p, 0.105, 0.125));
    ill.style.opacity = U.seg(p, 0.125, 0.145) * (1 - U.seg(p, 0.985, 1));
  });
  return { destroy: function () { unsub(); parts.forEach(function (x) { x.destroy(); }); layer.innerHTML = ''; } };
});
