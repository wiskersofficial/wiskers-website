/* trail: the exit. This used to be a vertical light beam with no origin, which read as a random bar (Josh, 4 Nov 2026: "I'm not really understanding what
 * the light beam at the end is for"). It is the glowing streak a re-entering object leaves across the sky. It now has a clear origin and meaning:
 * it arcs in from the top left, ends at the point where the craft burned, breaks into embers and fades, with a plain label saying so.
 * Role: exit. Group: drawn in code (one path in three stacked widths, plus drifting embers). Illustrative. */
Bagel.register('trail', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var W0 = 400, H0 = 800;
  var svg = el('svg', { viewBox: '0 0 400 800', preserveAspectRatio: 'xMidYMid slice', style: 'position:absolute;inset:0;width:100%;height:100%', 'aria-hidden': 'true' }, layer);
  var D = 'M-10 60C90 170 190 300 200 460';                       /* ends where the craft sat (centre, about 57% down) */
  var wide = el('path', { d: D, fill: 'none', stroke: '#FF7A3D', 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-opacity': 0.22, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, svg);
  var mid = el('path', { d: D, fill: 'none', stroke: '#FFB27A', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.6, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, svg);
  var core = el('path', { d: D, fill: 'none', stroke: '#FFF1DC', 'stroke-width': 2.2, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, svg);
  var halo = el('circle', { cx: 200, cy: 460, r: 16, fill: '#FF7A3D', opacity: 0 }, svg);
  var head = el('circle', { cx: 200, cy: 460, r: 5, fill: '#FFF1DC', opacity: 0 }, svg);
  var R = U.rng(77), embers = [];
  for (var i = 0; i < 22; i++) { var t = R(); embers.push({ n: el('circle', { r: 1 + R() * 1.8, fill: '#FFB27A', opacity: 0 }, svg), t: t, dx: (R() - 0.5) * 30, dy: 10 + R() * 40 }); }
  var tag = el('div', { 'class': 'tag', 'data-gate': 'text', 'data-gate-id': 'trail label', text: 'Where it burned (illustrative)' }, layer);
  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.trail[0] - 0.02, b = B.trail[1];
    var on = p > a && p <= b + 0.01;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    var born = U.ease.inout(U.seg(p, a, a + 0.06)), fade = U.ease.inout(U.seg(p, B.trail[0] + 0.045, b));
    var off = 1 - born;
    [wide, mid, core].forEach(function (n, k) { n.setAttribute('stroke-dashoffset', off); n.setAttribute('opacity', 1 - fade * (k === 2 ? 0.55 : 0.95)); });
    wide.setAttribute('stroke-width', 18 * (1 - 0.7 * fade)); mid.setAttribute('stroke-width', 7 * (1 - 0.6 * fade));
    head.setAttribute('opacity', U.seg(born, 0.9, 1) * (1 - fade)); halo.setAttribute('opacity', 0.55 * U.seg(born, 0.9, 1) * (1 - fade)); halo.setAttribute('r', 16 + 4 * Math.sin(t * 6));
    embers.forEach(function (e) {
      var k = U.seg(born, e.t * 0.6, e.t * 0.6 + 0.4) * (1 - fade);
      /* positions along the cubic */
      var u = e.t, x = (1 - u) * (1 - u) * (1 - u) * -10 + 3 * (1 - u) * (1 - u) * u * 90 + 3 * (1 - u) * u * u * 190 + u * u * u * 200;
      var y = (1 - u) * (1 - u) * (1 - u) * 60 + 3 * (1 - u) * (1 - u) * u * 170 + 3 * (1 - u) * u * u * 300 + u * u * u * 460;
      e.n.setAttribute('cx', x + e.dx * fade); e.n.setAttribute('cy', y + e.dy * fade * 2); e.n.setAttribute('opacity', k * 0.9);
    });
    tag.style.opacity = U.seg(p, a + 0.05, a + 0.08) * (1 - fade);
    tag.style.left = '50%'; tag.style.top = '62svh'; tag.style.transform = 'translateX(-50%)';
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
