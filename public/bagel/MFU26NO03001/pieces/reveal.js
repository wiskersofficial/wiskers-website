/* reveal: the one interaction. A left-right swipe window: a generic AI-style building (left) against an accurate cutaway (right).
 * Role: climax. Group: vector illustration, drawn in code. Labelled as illustration; no figures shown.
 * Also carries the exit: on leaving, the accurate building wins the whole frame and dimension lines draw around it. */
Bagel.register('reveal', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var PAPER = '#F4F1E8', CYAN = '#5FB4D8';

  var win = el('div', { 'class': 'win' }, layer);
  var acc = el('svg', { 'class': 'b', viewBox: '0 0 300 440', preserveAspectRatio: 'xMidYMid meet' }, win);
  var genWrap = el('div', { 'class': 'gen' }, win);
  var gen = el('svg', { 'class': 'b', viewBox: '0 0 300 440', preserveAspectRatio: 'xMidYMid meet' }, genWrap);
  genWrap.style.background = 'rgba(15,42,74,.0)';
  var sideL = el('div', { 'class': 'side l', text: 'Typical image AI' }, win);
  var sideR = el('div', { 'class': 'side r', text: 'Grounded in physics' }, win);

  var FLOORS = 5, TOP = 60, FH = 68, GROUND = TOP + FLOORS * FH;      /* 400 */
  var COLS = [58, 118, 178, 238];

  function hatchDef(svg, id) {
    var d = el('defs', {}, svg);
    var p = el('pattern', { id: id, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: CYAN, 'stroke-width': 1, 'stroke-opacity': 0.6 }, p);
  }

  /* ---------- the accurate building: every load path closes ---------- */
  hatchDef(acc, 'hA');
  var A = el('g', { fill: 'none', stroke: PAPER, 'stroke-width': 1.4, 'stroke-linejoin': 'miter' }, acc);
  el('path', { d: 'M20 ' + GROUND + 'H280', 'stroke-width': 2 }, A);
  el('path', { d: 'M50 ' + TOP + 'H258V' + GROUND + 'H50Z' }, A);
  el('path', { d: 'M44 ' + (TOP - 8) + 'H264V' + TOP + 'H44Z', fill: 'url(#hA)' }, A);    /* roof slab */
  for (var f = 0; f < FLOORS; f++) {
    var y = TOP + f * FH;
    if (f > 0) el('rect', { x: 50, y: y - 4, width: 208, height: 8, fill: 'url(#hA)' }, A);   /* floor slab */
    /* beams under the slab, between columns (I-beam elevation) */
    for (var c = 0; c < COLS.length - 1; c++) {
      el('rect', { x: COLS[c] + 4, y: y + 4 + (f ? 0 : -8) + (f ? 0 : 8), width: COLS[c + 1] - COLS[c] - 8, height: 6, 'stroke-width': 1 }, A);
    }
    /* duct, with cross */
    var dx = COLS[1] + 10, dw = COLS[2] - COLS[1] - 20;
    el('path', { d: 'M' + dx + ' ' + (y + 16) + 'h' + dw + 'v12h' + (-dw) + 'z M' + dx + ' ' + (y + 16) + 'l' + dw + ' 12 M' + (dx + dw) + ' ' + (y + 16) + 'l' + (-dw) + ' 12', stroke: CYAN, 'stroke-width': 1 }, A);
    /* windows */
    for (c = 0; c < COLS.length - 1; c += 2) {
      el('rect', { x: COLS[c] + 12, y: y + 34, width: 28, height: 22, 'stroke-opacity': 0.9 }, A);
      el('path', { d: 'M' + (COLS[c] + 26) + ' ' + (y + 34) + 'v22', 'stroke-opacity': 0.5 }, A);
    }
  }
  COLS.forEach(function (x) {                                   /* columns run the full height, continuous to the ground */
    el('rect', { x: x - 4, y: TOP, width: 8, height: GROUND - TOP, fill: 'rgba(244,241,232,.1)', 'stroke-width': 1.6 }, A);
    el('rect', { x: x - 9, y: GROUND - 4, width: 18, height: 8, fill: 'url(#hA)' }, A);        /* footing */
  });
  el('path', { d: 'M148 ' + (TOP) + 'V' + GROUND, stroke: CYAN, 'stroke-dasharray': '3 3', 'stroke-width': 1.2 }, A);   /* pipe riser */
  /* stair run in the left bay: closed and landed */
  var st = '';
  for (f = 0; f < FLOORS; f++) { for (var s2 = 0; s2 < 6; s2++) st += 'M' + (66 + s2 * 6) + ' ' + (TOP + (f + 1) * FH - 6 - s2 * 5) + 'h6v-5'; }
  el('path', { d: st, 'stroke-width': 1, 'stroke-opacity': 0.7 }, A);
  /* dimension line */
  el('path', { d: 'M282 ' + TOP + 'V' + GROUND + 'M277 ' + TOP + 'h10M277 ' + GROUND + 'h10', stroke: CYAN, 'stroke-width': 1 }, A);

  /* ---------- the generic building: looks right at a glance, fails on a second look ---------- */
  var R = U.rng(404);
  function jig(n) { return (R() - 0.5) * n; }
  function wob(x1, y1, x2, y2, amt) {                           /* a line that drifts, like an image model's line */
    var mx = (x1 + x2) / 2 + jig(amt), my = (y1 + y2) / 2 + jig(amt);
    return 'M' + (x1 + jig(1.5)).toFixed(1) + ' ' + (y1 + jig(1.5)).toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + (x2 + jig(2)).toFixed(1) + ' ' + (y2 + jig(2)).toFixed(1);
  }
  var G = el('g', { fill: 'none', stroke: PAPER, 'stroke-width': 1.3, 'stroke-opacity': 0.68, 'stroke-linecap': 'round' }, gen);
  var gd = '';
  gd += wob(20, GROUND, 280, GROUND + 3, 3);
  gd += wob(50, TOP, 258, TOP + 4, 4) + wob(258, TOP + 4, 262, GROUND, 6) + wob(262, GROUND, 48, GROUND - 3, 3) + wob(48, GROUND - 3, 50, TOP, 5);
  for (f = 1; f < FLOORS; f++) {                                /* slabs that do not meet the walls, wandering */
    var yy = TOP + f * FH + jig(10);
    gd += wob(50 + (f % 2 ? 0 : 14), yy, 258 - (f % 3 ? 6 : 20), yy + jig(6), 5);
  }
  /* columns: some stop short, some do not exist, one hangs from nothing */
  var col = [[58, TOP, GROUND - 120], [118, TOP + 40, GROUND], [178, TOP + 2, GROUND - 70], [238, TOP, GROUND - 4]];
  col.forEach(function (c) { gd += wob(c[0] - 4, c[1], c[0] - 4, c[2], 3) + wob(c[0] + 4, c[1], c[0] + 4 + jig(3), c[2], 3); });
  el('path', { d: gd }, G);
  /* windows that are different sizes and melt */
  var win2 = '';
  for (f = 0; f < FLOORS; f++) for (c = 0; c < 3; c++) {
    var wx = 62 + c * 66 + jig(10), wy = TOP + f * FH + 30 + jig(8), ww = 22 + jig(14), wh = 20 + jig(10);
    win2 += wob(wx, wy, wx + ww, wy + jig(4), 3) + wob(wx + ww, wy, wx + ww + jig(4), wy + wh, 4) + wob(wx + ww, wy + wh, wx, wy + wh + jig(5), 6) + wob(wx, wy + wh, wx + jig(3), wy, 3);
  }
  el('path', { d: win2, 'stroke-opacity': 0.55 }, G);
  /* a beam that ends in mid-air; a duct to nowhere; stairs that stop; a pipe through a window */
  el('path', { d: 'M62 ' + (TOP + FH * 2 + 6) + 'h74v6h-74z M136 ' + (TOP + FH * 2 + 6) + 'l14 -9', 'stroke-opacity': 0.8 }, G);
  el('path', { d: 'M150 ' + (TOP + FH + 16) + 'h40v12h-30 M190 ' + (TOP + FH + 28) + 'l-8 36' }, G);
  var sg = '';
  for (var s3 = 0; s3 < 5; s3++) sg += 'M' + (66 + s3 * 6) + ' ' + (TOP + FH * 3 - 6 - s3 * 5) + 'h6v-5';
  sg += 'M96 ' + (TOP + FH * 3 - 30) + 'l10 -26';
  el('path', { d: sg, 'stroke-opacity': 0.7 }, G);
  el('path', { d: 'M238 ' + (TOP + FH * 3.4) + 'v34 M231 ' + (TOP + FH * 3.4) + 'h14', stroke: CYAN, 'stroke-opacity': 0.0 }, G);

  /* error markers, shown on the generic side as the divider passes them */
  var marks = [
    { x: 0.30, y: 0.40, t: 'Beam ends in mid-air' },
    { x: 0.62, y: 0.58, t: 'Duct goes nowhere' },
    { x: 0.30, y: 0.68, t: 'Stairs stop' },
    { x: 0.22, y: 0.86, t: 'Column stops short' }
  ].map(function (m) {
    var d = el('div', { 'class': 'mk', text: m.t }, win);
    d.style.left = (m.x * 100) + '%'; d.style.top = (m.y * 100) + '%';
    return { d: d, x: m.x, on: false };
  });

  /* closing dimension lines (drawn on exit) */
  var exitSvg = el('svg', { 'class': 'b', viewBox: '0 0 300 440', preserveAspectRatio: 'xMidYMid meet', style: 'pointer-events:none' }, win);
  var ex = el('g', { fill: 'none', stroke: CYAN, 'stroke-width': 1.4 }, exitSvg);
  var e1 = el('path', { d: 'M20 30H280M20 24v12M280 24v12M30 27l-10 3l10 3M270 27l10 3l-10 3', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, ex);
  var e2 = el('path', { d: 'M296 ' + TOP + 'V' + GROUND + 'M290 ' + TOP + 'h12M290 ' + GROUND + 'h12', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, ex);

  var div = el('div', { 'class': 'div' }, win);
  var grip = el('div', { 'class': 'grip', html: '&#9666;&#9656;' }, div);
  var hint = el('div', { 'class': 'hint', text: 'Drag to compare' }, win);

  var X = 1, X0 = 0.5, userOn = false, lastTick = 0, wasIn = false, dragging = false;
  function setX(x) {
    X = U.clamp(x);
    div.style.left = (X * 100) + '%';
    genWrap.style.clipPath = 'inset(0 ' + ((1 - X) * 100) + '% 0 0)';
    marks.forEach(function (m) {
      var on = X > m.x + 0.04;
      if (on !== m.on) { m.on = on; m.d.style.opacity = on ? 1 : 0; ctx.haptic.play('tick'); }
    });
    var tk = Math.round(X * 10);
    if (tk !== lastTick) { lastTick = tk; if (dragging) ctx.haptic.play('tick'); }
  }
  var unbind = ctx.gesture.drag(win, {
    start: function (x) { dragging = true; userOn = true; setX(x); },
    move: function (x) { setX(x); },
    end: function () { dragging = false; }
  });
  setX(1);

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.reveal[0], b = B.reveal[1];
    var q = U.seg(p, a - 0.02, b + 0.07);
    var vis = p > a - 0.03 && p < B.close[1] + 0.01;
    layer.style.visibility = vis ? 'visible' : 'hidden';
    win.style.pointerEvents = (p > a + 0.02 && p < b + 0.02) ? 'auto' : 'none';
    var inQ = U.seg(p, a - 0.02, a + 0.03);
    var out = U.seg(p, b + 0.02, B.close[0] + 0.03);
    var closing = U.seg(p, B.close[0], B.close[1] - 0.01);
    win.style.opacity = U.ease.out(inQ);
    sideL.style.opacity = sideR.style.opacity = 1 - U.seg(p, B.close[0] - 0.01, B.close[0] + 0.02);
    div.style.opacity = 1 - U.seg(p, B.close[0] + 0.01, B.close[0] + 0.04);
    win.style.transform = 'translate3d(0,' + ((1 - U.ease.out(inQ)) * 18 + out * -6) + 'svh,0) scale(' + (1 + 0.1 * U.ease.inout(closing)) + ')';
    if (p < a - 0.01) { userOn = false; if (wasIn) { wasIn = false; } }
    if (p >= a) wasIn = true;
    /* one setX per frame. The scroll drives the first sweep (100% -> 55% -> 20% -> 50%), so it works with no touch at all;
       a drag takes over until the reader leaves the beat. On close, the accurate half takes the whole frame. */
    if (!dragging) {
      var x;
      if (closing > 0) x = U.lerp(userOn ? X0 : 0.5, 0, U.ease.inout(closing));
      else if (userOn) x = X;
      else {
        var s = U.seg(p, a + 0.02, b - 0.01);
        if (ctx.reducedMotion()) x = 0.5;
        else if (s < 0.4) x = U.lerp(1, 0.55, U.ease.inout(s / 0.4));
        else if (s < 0.75) x = U.lerp(0.55, 0.18, U.ease.inout((s - 0.4) / 0.35));
        else x = U.lerp(0.18, 0.5, U.ease.inout((s - 0.75) / 0.25));
        if (p >= b) x = 0.5;
      }
      if (Math.abs(x - X) > 1e-4) setX(x);
      if (closing === 0) X0 = X;
    }
    e1.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(closing, 0.25, 0.8)));
    e2.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(closing, 0.4, 0.9)));
    var hOn = p > a + 0.06 && p < b - 0.02 && !userOn;
    hint.style.opacity = hOn ? 0.9 : 0;
    var bob = ctx.reducedMotion() ? 0 : Math.sin(t * 3) * 4;
    grip.style.transform = 'translate3d(' + bob + 'px,0,0)';
  });
  return { destroy: function () { unsub(); unbind(); layer.innerHTML = ''; } };
});
