/* states: California and Texas tiles slide in from the sides; "10" counts up between them.
 * Role: middle and sides. Group: drawn in code. Outlines are simplified from public lon/lat points (assumed accurate enough; labelled "simplified"). */
Bagel.register('states', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var CA = [[-124.4, 42.0], [-120.0, 42.0], [-120.0, 39.0], [-114.6, 35.0], [-114.7, 32.7], [-117.1, 32.5], [-118.4, 34.0], [-120.6, 34.6], [-121.9, 36.6], [-122.5, 37.8], [-123.8, 39.5], [-124.4, 40.4], [-124.1, 41.5]];
  var TX = [[-106.6, 32.0], [-103.1, 32.0], [-103.0, 36.5], [-100.0, 36.5], [-100.0, 34.6], [-99.2, 34.2], [-97.2, 33.8], [-96.5, 33.8], [-94.0, 33.6], [-94.0, 31.9], [-93.5, 31.0], [-93.9, 29.7], [-94.7, 29.3], [-96.5, 28.3], [-97.4, 27.3], [-97.2, 25.9], [-99.1, 26.4], [-99.5, 27.5], [-100.7, 29.1], [-101.4, 29.8], [-102.4, 29.8], [-103.2, 29.0], [-104.5, 29.6], [-104.9, 30.6], [-106.5, 31.8]];

  function project(pts, lat0) {
    var k = Math.cos(lat0 * Math.PI / 180);
    var xs = pts.map(function (p) { return p[0] * k; }), ys = pts.map(function (p) { return -p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var s = 280 / Math.max(x1 - x0, y1 - y0);
    var w = (x1 - x0) * s, h = (y1 - y0) * s;
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + ((p[0] * k - x0) * s + 10).toFixed(1) + ' ' + ((-p[1] - y0) * s + 10).toFixed(1); }).join('') + 'Z';
    return { d: d, w: w + 20, h: h + 20 };
  }

  function tile(cls, pts, lat0, code) {
    var pr = project(pts, lat0);
    var box = el('div', { 'class': 'tile ' + cls, 'aria-hidden': 'true' }, layer);
    var svg = el('svg', { viewBox: '0 0 ' + pr.w + ' ' + pr.h }, box);
    var defs = el('defs', {}, svg);
    var pat = el('pattern', { id: 'sh-' + cls, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: '#5FB4D8', 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, pat);
    var fill = el('path', { d: pr.d, fill: 'url(#sh-' + cls + ')', 'fill-opacity': 0 }, svg);
    var line = el('path', { d: pr.d, fill: 'none', stroke: '#F4F1E8', 'stroke-width': 2.2, 'stroke-linejoin': 'miter', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, svg);
    var ghost = el('path', { d: pr.d, fill: 'none', stroke: '#5FB4D8', 'stroke-width': 1, 'stroke-opacity': 0.5, pathLength: 1, 'stroke-dasharray': '0.01 0.02', transform: 'translate(7 7)' }, svg);
    var cx = pr.w * 0.5, cy = pr.h * 0.5;
    var cross = el('g', { stroke: '#F4F1E8', 'stroke-width': 1.4, opacity: 0 }, svg);
    el('line', { x1: cx - 14, y1: cy, x2: cx + 14, y2: cy }, cross); el('line', { x1: cx, y1: cy - 14, x2: cx, y2: cy + 14 }, cross);
    var ring = el('circle', { cx: cx, cy: cy, r: 8, fill: 'none', stroke: '#5FB4D8', 'stroke-width': 1.5, opacity: 0 }, svg);
    el('text', { x: pr.w * 0.5, y: pr.h + 14, 'text-anchor': 'middle', fill: '#5FB4D8', 'font-size': 11, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.15em' }, svg).textContent = code;
    return { box: box, fill: fill, line: line, cross: cross, ring: ring, h: pr.h, w: pr.w };
  }
  var ca = tile('ca', CA, 37, 'CALIFORNIA');
  var tx = tile('tx', TX, 31, 'TEXAS');
  var count = el('div', { 'class': 'count', 'aria-hidden': 'true', text: '0' }, layer);
  var lastN = -1, hit = [false, false];

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.states[0], b = B.states[1];
    var q = U.seg(p, a - 0.02, b + 0.01);
    layer.style.visibility = (p > a - 0.03 && p < b + 0.02) ? 'visible' : 'hidden';
    var enter = U.ease.out(U.seg(q, 0, 0.3));
    var enter2 = U.ease.out(U.seg(q, 0.12, 0.42));
    var exit = U.ease.inout(U.seg(q, 0.88, 1));
    var calm = ctx.reducedMotion();
    /* tiles slide in from their own side, tilt, then leave the way they came */
    ca.box.style.opacity = enter * (1 - exit);
    ca.box.style.transform = 'translate3d(' + ((-1 + enter) * 60 - exit * 60) + 'vw,0,0) rotate(' + ((1 - enter) * -14 + exit * -10) + 'deg)';
    tx.box.style.opacity = enter2 * (1 - exit);
    tx.box.style.transform = 'translate3d(' + ((1 - enter2) * 60 + exit * 60) + 'vw,0,0) rotate(' + ((1 - enter2) * 14 + exit * 10) + 'deg)';
    ca.line.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(q, 0.05, 0.4)));
    tx.line.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(q, 0.15, 0.5)));
    ca.fill.setAttribute('fill-opacity', U.seg(q, 0.3, 0.5));
    tx.fill.setAttribute('fill-opacity', U.seg(q, 0.4, 0.6));
    ca.cross.setAttribute('opacity', U.seg(q, 0.38, 0.46)); tx.cross.setAttribute('opacity', U.seg(q, 0.48, 0.56));
    var pulse = calm ? 0 : (t * 0.9) % 1;
    [ca, tx].forEach(function (s, i) {
      var shown = i ? U.seg(q, 0.48, 0.56) : U.seg(q, 0.38, 0.46);
      s.ring.setAttribute('r', 8 + pulse * 30);
      s.ring.setAttribute('opacity', calm ? 0 : shown * (1 - pulse) * 0.8);
      if (shown > 0.9 && !hit[i]) { hit[i] = true; ctx.haptic.play('stamp'); }
      if (shown < 0.1) hit[i] = false;
    });
    /* the count */
    var cq = U.ease.out(U.seg(q, 0.45, 0.72));
    var n = Math.round(cq * 10);
    if (n !== lastN) { count.textContent = n; lastN = n; }
    count.style.opacity = U.ease.out(U.seg(q, 0.4, 0.5)) * (1 - exit);
    count.style.transform = 'translate3d(0,' + ((1 - U.ease.out(U.seg(q, 0.4, 0.55))) * 8 - exit * 6) + 'svh,0) scale(' + (0.8 + 0.2 * U.ease.back(U.seg(q, 0.4, 0.55))) + ')';
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
