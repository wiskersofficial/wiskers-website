/* odds: "1 in 2,100", shown the honest way. The old field of 2,100 dots with one lit read as "one person in every 2,100 is hit", which is wrong:
 * it is the chance that anyone is harmed at all. The new visual is one bar of all possible outcomes with a hair-thin sliver, and a lens that
 * zooms the sliver so you can see how thin it is. The lead-in sentence comes BEFORE the number, in readable type (Josh, 4 Nov 2026). Group: drawn in code. */
Bagel.register('odds', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el, T = Bagel.text;
  var a = B.odds[0], b = B.odds[1];
  var cap = T.caption(layer, ctx, { a: a, b: b, zone: 'top', kicker: 'The risk', head: 'The chance that anyone is harmed', lines: ['Estimate from the US Space Force, quoted by NASA.'], accent: '#7FB4FF', group: 'odds-cap' });
  var big = el('div', { 'class': 'big', 'data-gate': 'text', 'data-gate-id': 'odds number', html: '1 in <em>2,100</em>' }, layer);
  var viz = el('div', { 'class': 'viz', 'aria-hidden': 'true' }, layer);
  var svg = el('svg', { viewBox: '0 0 340 190', 'data-gate': 'art', 'data-gate-group': 'viz' }, viz);
  var defs = el('defs', {}, svg);
  var cp = el('clipPath', { id: 'lensclip' }, defs); el('circle', { cx: 170, cy: 138, r: 46 }, cp);
  var bar = el('rect', { x: 0, y: 16, width: 0, height: 16, fill: '#EAF2FF', 'fill-opacity': 0.25 }, svg);
  var SX = 207;                                                        /* where the sliver sits: arbitrary, it stands for one outcome */
  var cone = el('path', { d: 'M' + SX + ' 32L' + (SX + 1.6) + ' 32L215 96L125 96Z', fill: '#FF7A3D', 'fill-opacity': 0 }, svg);
  var sliver = el('rect', { x: SX, y: 12, width: 1.6, height: 24, fill: '#FF7A3D' }, svg);
  var lens = el('g', { opacity: 0 }, svg);
  el('circle', { cx: 170, cy: 138, r: 46, fill: '#0b1226', stroke: '#EAF2FF', 'stroke-opacity': 0.7, 'stroke-width': 1.5 }, lens);
  var ticks = el('g', { 'clip-path': 'url(#lensclip)' }, lens);
  for (var i = 0; i < 21; i++) el('rect', { x: 170 + (i - 10) * 8 - (i === 10 ? 2.5 : 0.8), y: i === 10 ? 112 : 120, width: i === 10 ? 5 : 1.6, height: i === 10 ? 52 : 36, fill: i === 10 ? '#FF7A3D' : '#EAF2FF', 'fill-opacity': i === 10 ? 1 : 0.4 }, ticks);
  var note = el('div', { 'class': 't', 'data-gate': 'text', 'data-gate-group': 'viz', 'data-gate-id': 'odds note', text: 'One outcome in 2,100. Zoomed in.' }, viz);
  var fired = false;
  var unsub = ctx.timeline.subscribe(function (p) {
    var on = p > a - 0.02 && p < b + 0.03;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) { fired = false; return; }
    var inn = U.ease.out(U.seg(p, a + 0.01, a + 0.03)), out = U.ease.inout(U.seg(p, b - 0.012, b + 0.005));
    big.style.opacity = inn * (1 - out); big.style.transform = 'translate3d(0,' + ((1 - inn) * 4 - out * 3) + 'svh,0) scale(' + (0.92 + 0.08 * U.ease.back(U.seg(p, a + 0.01, a + 0.04))) + ')';
    viz.style.opacity = U.ease.out(U.seg(p, a + 0.02, a + 0.04)) * (1 - out);
    bar.setAttribute('width', 340 * U.ease.out(U.seg(p, a + 0.02, a + 0.04)));
    var lq = U.ease.back(U.seg(p, a + 0.04, a + 0.062));
    cone.setAttribute('fill-opacity', 0.22 * U.seg(p, a + 0.04, a + 0.055));
    lens.setAttribute('opacity', U.seg(p, a + 0.04, a + 0.05));
    lens.setAttribute('transform', 'translate(170 138) scale(' + (0.4 + 0.6 * lq) + ') translate(-170 -138)');
    note.style.opacity = U.seg(p, a + 0.055, a + 0.068);
    if (p > a + 0.058 && !fired) { fired = true; ctx.haptic.play('thud'); }
    if (p < a + 0.03) fired = false;
  });
  return { destroy: function () { unsub(); cap.destroy(); layer.innerHTML = ''; } };
});
