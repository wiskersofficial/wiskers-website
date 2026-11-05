/* backers: a drawing title block that fills in, row by row, with a stamp. Role: supporting (who is behind it).
 * Group: drawn in code, text only (no logos or photos, so no rights to check). */
Bagel.register('backers', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var tb = el('div', { 'class': 'tb' }, layer);
  var frame = el('svg', { 'class': 'frame', viewBox: '0 0 100 100', preserveAspectRatio: 'none' }, tb);
  var f1 = el('rect', { x: 0.6, y: 0.6, width: 98.8, height: 98.8, fill: 'none', stroke: '#5FB4D8', 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, frame);
  var f2 = el('rect', { x: 2.4, y: 1.8, width: 95.2, height: 96.4, fill: 'none', stroke: '#5FB4D8', 'stroke-opacity': 0.45, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, frame);
  var head = el('div', { 'class': 'head', 'data-gate': 'text', 'data-gate-group': 'tb', text: 'The round' }, tb);
  var rows = [
    ['Round', 'Seed, $17M', ''],
    ['Led by', 'Andreessen Horowitz', 'partner Kimberly Tan'],
    ['Also in', 'SV Angel, XYZ, Zigg Capital', ''],
    ['Founders', 'Andy Elder, Arjun Mathur', 'both ex-Palantir']
  ].map(function (r) {
    var d = el('div', { 'class': 'row' }, tb);
    el('div', { 'class': 'k', 'data-gate': 'text', 'data-gate-group': 'tb', text: r[0] }, d);
    var v = el('div', { 'class': 'v', 'data-gate': 'text', 'data-gate-group': 'tb', text: r[1] }, d);
    if (r[2]) el('small', { text: r[2] }, v);
    return { d: d, fired: false };
  });

  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.backers[0], b = B.backers[1];
    var q = U.seg(p, a - 0.02, b + 0.01);
    layer.style.visibility = (p > a - 0.03 && p < b + 0.02) ? 'visible' : 'hidden';
    var exit = U.ease.inout(U.seg(q, 0.78, 0.9));
    var enter = U.ease.out(U.seg(q, 0, 0.2));
    tb.style.opacity = (1 - exit);
    tb.style.transform = 'translate3d(0,' + (exit * -14) + 'svh,0) scale(' + (1 - exit * 0.1) + ')';
    f1.setAttribute('stroke-dashoffset', 1 - enter);
    f2.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(q, 0.08, 0.3)));
    head.style.opacity = U.seg(q, 0.12, 0.2);
    rows.forEach(function (r, i) {
      var t = U.ease.back(U.seg(q, 0.22 + i * 0.14, 0.34 + i * 0.14));
      var o = U.seg(q, 0.22 + i * 0.14, 0.28 + i * 0.14);
      r.d.style.opacity = o;
      r.d.style.transform = 'scale(' + (1.18 - 0.18 * t) + ') rotate(' + ((1 - t) * (i % 2 ? 1.5 : -1.5)) + 'deg)';
      if (o > 0.8 && !r.fired) { r.fired = true; ctx.haptic.play('stamp'); }
      if (o < 0.1) r.fired = false;
    });
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
