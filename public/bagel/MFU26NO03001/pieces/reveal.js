/* reveal: the one interaction. A left-right swipe window comparing a typical image-AI building (left) with a grounded, physically sound one (right).
 *
 * Josh, 4 Nov 2026: the left and right views were not different enough, the words conflicted, and it was labelled "on the shitty version rather than
 * nothing on the good version". Causes and fixes:
 *   1. The left layer was transparent, so the accurate drawing showed THROUGH it: both buildings overlaid on the left half. Both sides are now opaque.
 *   2. The two were drawn in the same weight and colour. Now: the bad building is faint, double-drawn, wobbling, unfilled and unlabelled; the good one is
 *      solid, filled, lit, with an amber load path that runs unbroken from roof to footing.
 *   3. Labels now go on the GOOD side only (what is right and why). The bad side carries no callouts, only a quiet "Typical image AI" tag.
 *   4. The window sits below the copy zone and every label is registered with the overlap gate.
 * Illustration, labelled. No figures. Also carries the exit: the good building takes the whole frame and dimension lines draw round it. Group: drawn in code. */
Bagel.register('reveal', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var PAPER = '#F4F1E8', CYAN = '#5FB4D8', AMBER = '#F2A33A';
  var VW = 300, VH = 340;
  var TOP = 44, FH = 52, FLOORS = 5, GROUND = TOP + FLOORS * FH;          /* 304 */
  var COLS = [68, 138, 208], BX0 = 60, BX1 = 216;

  var win = el('div', { 'class': 'win', 'data-gate': 'art', 'data-gate-group': 'reveal', 'data-gate-id': 'compare window' }, layer);
  var acc = el('svg', { 'class': 'b', viewBox: '0 0 ' + VW + ' ' + VH, preserveAspectRatio: 'xMidYMid meet' }, win);
  var chipLayer = el('div', { style: 'position:absolute;inset:0' }, win);
  var genWrap = el('div', { 'class': 'gen' }, win);
  var gen = el('svg', { 'class': 'b', viewBox: '0 0 ' + VW + ' ' + VH, preserveAspectRatio: 'xMidYMid meet' }, genWrap);
  var pillL = el('div', { 'class': 'pill l', 'data-gate': 'text', 'data-gate-group': 'reveal', text: 'Typical image AI' }, genWrap);
  var pillR = el('div', { 'class': 'pill r', 'data-gate': 'text', 'data-gate-group': 'reveal', text: 'Grounded in physics ✓' }, chipLayer);

  /* ---------- the good building: solid, filled, one unbroken load path ---------- */
  var defs = el('defs', {}, acc);
  var hp = el('pattern', { id: 'hA', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: CYAN, 'stroke-width': 1, 'stroke-opacity': 0.7 }, hp);
  var A = el('g', { 'stroke-linejoin': 'miter' }, acc);
  el('rect', { x: 20, y: GROUND, width: 260, height: 10, fill: 'url(#hA)', stroke: PAPER, 'stroke-width': 1.2 }, A);
  el('path', { d: 'M20 ' + GROUND + 'H280', stroke: PAPER, 'stroke-width': 2 }, A);
  for (var f = 0; f < FLOORS; f++) {
    var y = TOP + f * FH;
    for (var c = 0; c < COLS.length - 1; c++) {
      var x0 = COLS[c] + 4, x1 = COLS[c + 1] - 4, mid = (x0 + x1) / 2;
      el('rect', { x: x0 + 8, y: y + 20, width: x1 - x0 - 16, height: 24, fill: CYAN, 'fill-opacity': 0.2, stroke: PAPER, 'stroke-width': 1 }, A);
      el('path', { d: 'M' + mid + ' ' + (y + 20) + 'v24', stroke: PAPER, 'stroke-opacity': 0.55, 'stroke-width': 0.8 }, A);
      el('rect', { x: x0, y: y + 8, width: x1 - x0, height: 4, fill: PAPER, 'fill-opacity': 0.85 }, A);                        /* beam */
      el('path', { d: 'M' + x0 + ' ' + (y + 15) + 'H' + x1, stroke: CYAN, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }, A);   /* duct */
    }
    if (f > 0) el('rect', { x: BX0 - 4, y: y - 3, width: BX1 - BX0 + 8, height: 7, fill: CYAN, 'fill-opacity': 0.55, stroke: PAPER, 'stroke-width': 1 }, A);
  }
  el('rect', { x: BX0 - 6, y: TOP - 9, width: BX1 - BX0 + 12, height: 10, fill: CYAN, 'fill-opacity': 0.65, stroke: PAPER, 'stroke-width': 1.2 }, A);   /* roof slab */
  COLS.forEach(function (x) {
    el('rect', { x: x - 4, y: TOP, width: 8, height: GROUND - TOP, fill: PAPER, 'fill-opacity': 0.92, stroke: PAPER, 'stroke-width': 1 }, A);
    el('rect', { x: x - 12, y: GROUND - 6, width: 24, height: 7, fill: CYAN, 'fill-opacity': 0.7, stroke: PAPER, 'stroke-width': 1.2 }, A);          /* footing */
  });
  el('path', { d: 'M103 ' + TOP + 'V' + GROUND, stroke: CYAN, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, A);                                   /* pipe riser */
  /* the load path: amber, unbroken, glowing, with marching arrows; runs down the right-hand column */
  var LX = COLS[2];
  el('path', { d: 'M' + LX + ' ' + (TOP - 16) + 'V' + (GROUND - 2), stroke: AMBER, 'stroke-width': 10, 'stroke-opacity': 0.22, 'stroke-linecap': 'round', fill: 'none' }, A);
  var march = el('path', { d: 'M' + LX + ' ' + (TOP - 16) + 'V' + (GROUND - 2), stroke: AMBER, 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none', 'stroke-dasharray': '10 7' }, A);
  var tipArrow = el('path', { d: 'M' + (LX - 6) + ' ' + (GROUND - 10) + 'L' + LX + ' ' + (GROUND - 2) + 'L' + (LX + 6) + ' ' + (GROUND - 10), stroke: AMBER, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, A);
  /* dimension lines for the exit */
  var ex = el('g', { fill: 'none', stroke: CYAN, 'stroke-width': 1.4 }, acc);
  var e1 = el('path', { d: 'M' + (BX0 - 4) + ' 22H' + (BX1 + 4) + 'M' + (BX0 - 4) + ' 17v10M' + (BX1 + 4) + ' 17v10M' + (BX0 + 6) + ' 19l-8 3l8 3M' + (BX1 - 6) + ' 19l8 3l-8 3', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, ex);
  var e2 = el('path', { d: 'M236 ' + TOP + 'V' + GROUND + 'M231 ' + TOP + 'h10M231 ' + GROUND + 'h10', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, ex);

  /* ---------- the bad building: three jittering variants, faint, unfilled, wrong ---------- */
  var variants = [];
  for (var vi = 0; vi < 3; vi++) {
    var R = U.rng(404 + vi * 31);
    var jg = el('g', { fill: 'none', stroke: PAPER, 'stroke-linecap': 'round' }, gen);
    function jig(n) { return (R() - 0.5) * n; }
    function wob(x1, y1, x2, y2, amt, op) {
      var mx = (x1 + x2) / 2 + jig(amt), my = (y1 + y2) / 2 + jig(amt);
      return el('path', { d: 'M' + (x1 + jig(2)).toFixed(1) + ' ' + (y1 + jig(2)).toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + (x2 + jig(2.5)).toFixed(1) + ' ' + (y2 + jig(2.5)).toFixed(1), 'stroke-width': 1.1, 'stroke-opacity': op || 0.45 }, jg);
    }
    var tilt = jig(8);
    wob(BX0, TOP, BX1, TOP + tilt, 5); wob(BX0 + 3, TOP + 3, BX1 + 4, TOP + tilt + 5, 6, 0.25);                       /* roof, doubled */
    wob(BX1, TOP + tilt, BX1 + jig(10), GROUND, 8); wob(BX0, TOP, BX0 + jig(10), GROUND - 4, 8);                      /* walls, leaning */
    wob(BX0 - 14, GROUND, BX1 + 20, GROUND + jig(5), 4);                                                              /* ground */
    for (var s = 1; s < FLOORS; s++) { var sy = TOP + s * FH + jig(16); wob(BX0 + (s % 2 ? 6 : -6), sy, BX1 - (s % 3 ? 14 : -10), sy + jig(10), 7); }   /* slabs: float, tilt, miss the walls */
    COLS.forEach(function (x, i) {                                                                                    /* columns: gaps, stop short, hang */
      var a = TOP + 8 + jig(20) + (i === 1 ? 40 : 0), b = GROUND - (i === 0 ? 70 : i === 2 ? 20 : 0) + jig(10);
      wob(x - 3, a, x - 3 + jig(6), b, 4); wob(x + 3, a + 6, x + 3 + jig(6), b - 4, 4, 0.3);
    });
    for (f = 0; f < FLOORS; f++) for (c = 0; c < 2; c++) {                                                            /* windows: melt, droop, differ */
      if (R() < 0.18) continue;
      var wx = BX0 + 10 + c * 70 + jig(14), wy = TOP + f * FH + 16 + jig(10), ww = 26 + jig(18), wh = 22 + jig(12);
      el('path', { d: 'M' + wx + ' ' + wy + 'H' + (wx + ww) + 'Q' + (wx + ww + jig(8)) + ' ' + (wy + wh * 0.6) + ' ' + (wx + ww - 3) + ' ' + (wy + wh + 6 * R()) + 'Q' + (wx + ww / 2) + ' ' + (wy + wh + 10 * R()) + ' ' + (wx + 2) + ' ' + (wy + wh) + 'Q' + (wx - 5) + ' ' + (wy + wh / 2) + ' ' + wx + ' ' + wy, 'stroke-width': 1, 'stroke-opacity': 0.4 }, jg);
    }
    wob(BX0 + 8, TOP + 2 * FH + 8, BX0 + 62, TOP + 2 * FH + 8, 3, 0.55); wob(BX0 + 62, TOP + 2 * FH + 8, BX0 + 74, TOP + 2 * FH - 2, 4, 0.55);       /* a beam that ends in the air */
    var st = ''; for (var k = 0; k < 5; k++) st += 'M' + (BX0 + 20 + k * 7) + ' ' + (TOP + 3 * FH - 6 - k * 6) + 'h7v-6'; el('path', { d: st, 'stroke-opacity': 0.4, 'stroke-width': 1 }, jg);   /* stairs to nowhere */
    jg.setAttribute('opacity', vi === 0 ? 1 : 0);
    variants.push(jg);
  }

  /* ---------- labels on the GOOD side only ---------- */
  var chips = [
    { t: 'Load path', y: 66, amber: true }, { t: 'Steel frame', y: 128 }, { t: 'Ducts', y: 198 }, { t: 'Footing', y: GROUND - 6 }
  ].map(function (c) {
    var d = el('div', { 'class': 'chip' + (c.amber ? ' amber' : ''), 'data-gate': 'text', 'data-gate-group': 'reveal', 'data-gate-id': 'chip ' + c.t, text: c.t }, chipLayer);
    return { d: d, y: c.y, on: false, thr: 1 };
  });
  var hint = el('div', { 'class': 'hint', 'data-gate': 'text', 'data-gate-group': 'reveal', text: 'Drag to compare' }, win);
  var div = el('div', { 'class': 'div' }, win);
  var grip = el('div', { 'class': 'grip', html: '&#9666;&#9656;' }, div);

  function layout() {                                                  /* map svg units to window pixels for the chips */
    var w = win.clientWidth, h = win.clientHeight, sc = Math.min(w / VW, h / VH), ox = (w - VW * sc) / 2, oy = (h - VH * sc) / 2;
    chips.forEach(function (c) { c.d.style.right = '8px'; c.d.style.top = (oy + c.y * sc - 9) + 'px'; c.thr = 1 - (c.d.offsetWidth + 8) / w; });
  }
  layout(); window.addEventListener('resize', layout);

  var X = 1, X0 = 0.5, userOn = false, lastTick = 0, dragging = false;
  function setX(x) {
    X = U.clamp(x);
    div.style.left = (X * 100) + '%';
    genWrap.style.clipPath = 'inset(0 ' + ((1 - X) * 100) + '% 0 0)';
    chips.forEach(function (c) {
      var show = U.clamp((c.thr - 0.03 - X) / 0.06);
      c.d.style.opacity = show; c.d.style.transform = 'translate3d(' + ((1 - show) * 10) + 'px,0,0)';
      var on = show > 0.6; if (on !== c.on) { c.on = on; if (on) ctx.haptic.play('tick'); }
    });
    pillR.style.opacity = U.clamp((1 - 0.36 - X) / 0.06);
    var tk = Math.round(X * 10); if (tk !== lastTick) { lastTick = tk; if (dragging) ctx.haptic.play('tick'); }
  }
  var unbind = ctx.gesture.drag(win, { start: function (x) { dragging = true; userOn = true; setX(x); }, move: function (x) { setX(x); }, end: function () { dragging = false; } });
  setX(1);

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.reveal[0], b = B.reveal[1];
    var vis = p > a - 0.03 && p < B.close[1] + 0.01;
    layer.style.visibility = vis ? 'visible' : 'hidden';
    win.style.pointerEvents = (p > a + 0.02 && p < b + 0.02) ? 'auto' : 'none';
    var inQ = U.ease.out(U.seg(p, a + 0.002, a + 0.032));
    var closing = U.seg(p, B.close[0], B.close[1] - 0.01);
    win.style.opacity = inQ;
    win.style.transform = 'translate3d(0,' + ((1 - inQ) * 5) + 'svh,0) scale(' + (1 + 0.04 * U.ease.inout(closing)) + ')';
    if (p < a - 0.01) userOn = false;
    var calm = ctx.reducedMotion();
    /* the bad building shivers between three drawings; the good one's load path marches down */
    var vIdx = calm ? 0 : Math.floor(t * 6) % 3;
    for (var i = 0; i < 3; i++) variants[i].setAttribute('opacity', i === vIdx ? 1 : 0);
    march.setAttribute('stroke-dashoffset', calm ? 0 : -(t * 22) % 34);
    if (!dragging) {                                                   /* one setX per frame; the scroll drives the first sweep, so it works with no touch */
      var x;
      if (closing > 0) x = U.lerp(userOn ? X0 : 0.5, 0, U.ease.inout(closing));
      else if (userOn) x = X;
      else {
        var s = U.seg(p, a + 0.02, b - 0.01);
        if (calm) x = 0.5;
        else if (s < 0.4) x = U.lerp(1, 0.55, U.ease.inout(s / 0.4));
        else if (s < 0.75) x = U.lerp(0.55, 0.12, U.ease.inout((s - 0.4) / 0.35));
        else x = U.lerp(0.12, 0.45, U.ease.inout((s - 0.75) / 0.25));
        if (p >= b) x = 0.45;
      }
      if (Math.abs(x - X) > 1e-4) setX(x);
      if (closing === 0) X0 = X;
    }
    e1.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(closing, 0.25, 0.8)));
    e2.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(closing, 0.4, 0.9)));
    pillL.style.opacity = 1 - U.seg(closing, 0, 0.3);
    div.style.opacity = 1 - U.seg(p, B.close[0] + 0.01, B.close[0] + 0.04);
    hint.style.opacity = (p > a + 0.05 && p < b - 0.02 && !userOn) ? 0.9 : 0;
    grip.style.transform = 'translate3d(' + (calm ? 0 : Math.sin(t * 3) * 4) + 'px,0,0)';
  });
  return { destroy: function () { unsub(); unbind(); window.removeEventListener('resize', layout); layer.innerHTML = ''; } };
});
