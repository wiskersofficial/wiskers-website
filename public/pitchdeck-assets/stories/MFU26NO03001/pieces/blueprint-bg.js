/* blueprint-bg: drafting sheet that draws itself, then drifts. Role: background. Group: drawn in code. */
Bagel.register('blueprint-bg', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var svg = el('svg', { viewBox: '0 0 400 800', preserveAspectRatio: 'xMidYMid slice' }, layer);

  /* grid: minor and major lines, over-tall so it can drift */
  var grid = el('g', {}, svg);
  var i;
  for (i = -200; i <= 1200; i += 20) {
    var major = i % 100 === 0;
    el('line', { x1: 0, x2: 400, y1: i, y2: i, stroke: '#5FB4D8', 'stroke-opacity': major ? 0.2 : 0.07, 'stroke-width': major ? 0.8 : 0.5 }, grid);
  }
  for (i = 0; i <= 400; i += 20) {
    var maj = i % 100 === 0;
    el('line', { x1: i, x2: i, y1: -200, y2: 1200, stroke: '#5FB4D8', 'stroke-opacity': maj ? 0.2 : 0.07, 'stroke-width': maj ? 0.8 : 0.5 }, grid);
  }

  /* plan fragments. Every path uses pathLength=1 so draw-on is one number */
  var plans = el('g', { fill: 'none', stroke: '#5FB4D8', 'stroke-width': 1.1, 'stroke-linecap': 'butt', 'stroke-linejoin': 'miter' }, svg);
  var paths = [];
  function P(d, dim, parent) {
    var p = el('path', { d: d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, 'stroke-opacity': dim || 0.7 }, parent || plans);
    paths.push(p); return p;
  }
  function room(g, x, y, w, h) { return P('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'z', 0.75, g); }
  function door(g, x, y, r, dir) { return P('M' + x + ' ' + y + 'h' + r + 'a' + r + ' ' + r + ' 0 0 ' + dir + ' ' + (-r) + ' ' + r, 0.55, g); }
  function dim(g, x1, y, x2) { return P('M' + x1 + ' ' + y + 'H' + x2 + 'M' + x1 + ' ' + (y - 5) + 'v10M' + x2 + ' ' + (y - 5) + 'v10M' + (x1 + 4) + ' ' + (y - 3) + 'L' + x1 + ' ' + y + 'L' + (x1 + 4) + ' ' + (y + 3) + 'M' + (x2 - 4) + ' ' + (y - 3) + 'L' + x2 + ' ' + y + 'L' + (x2 - 4) + ' ' + (y + 3), 0.5, g); }
  function tag(g, x, y, s, anchor) { return el('text', { x: x, y: y, fill: '#5FB4D8', 'fill-opacity': 0.7, 'font-size': 7.5, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.12em', 'text-anchor': anchor || 'start', stroke: 'none' }, g).appendChild(document.createTextNode(s)); }

  /* plan A: apartment floor plan, upper left */
  var A = el('g', { 'data-float': 1 }, plans);
  room(A, 36, 70, 230, 150); room(A, 36, 70, 80, 70); room(A, 116, 70, 70, 70); room(A, 186, 70, 80, 150);
  room(A, 36, 140, 80, 80); room(A, 116, 140, 70, 80);
  door(A, 60, 140, 20, 1); door(A, 140, 140, 18, 0); door(A, 214, 220, 22, 1);
  dim(A, 36, 246, 266); tag(A, 36, 262, 'PLAN L2 / A-201');

  /* plan B: structural grid with columns and beams, mid right */
  var Bg = el('g', { 'data-float': 1 }, plans);
  for (i = 0; i < 4; i++) for (var j = 0; j < 3; j++) P('M' + (150 + i * 62) + ' ' + (330 + j * 60) + 'h8v8h-8z', 0.8, Bg);
  for (j = 0; j < 3; j++) P('M158 ' + (334 + j * 60) + 'H' + (150 + 3 * 62), 0.45, Bg);
  for (i = 0; i < 4; i++) P('M' + (154 + i * 62) + ' 334V' + (334 + 2 * 60), 0.45, Bg);
  P('M150 330L336 510M336 330L150 510', 0.2, Bg);
  dim(Bg, 150, 548, 336); tag(Bg, 336, 564, 'GRID 1-4 / S-102', 'end');

  /* plan C: section cut, lower left */
  var C = el('g', { 'data-float': 1 }, plans);
  room(C, 40, 620, 150, 120); P('M40 660h150M40 700h150', 0.5, C);
  P('M70 620v120M110 620v120M150 620v120', 0.35, C);
  P('M40 620l-12 -14h174l-12 14', 0.5, C);
  tag(C, 40, 762, 'SECTION B-B');

  /* plan D: elevation fragment, far right and lower */
  var D = el('g', { 'data-float': 1 }, plans);
  room(D, 250, 640, 110, 150); P('M250 690h110M250 740h110', 0.5, D);
  for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) room(D, 262 + i * 32, 650 + j * 50, 18, 26);
  tag(D, 360, 812, 'ELEV. EAST', 'end');

  /* more fragments further down, so the drift always has something to show */
  var E = el('g', { 'data-float': 1 }, plans);
  room(E, 40, 900, 200, 100); room(E, 40, 900, 100, 50); room(E, 140, 950, 100, 50); door(E, 70, 950, 18, 1);
  dim(E, 40, 1030, 240); tag(E, 40, 1046, 'PLAN L3 / A-202');
  var F = el('g', { 'data-float': 1 }, plans);
  for (i = 0; i < 5; i++) P('M' + (270 + i * 22) + ' 900v110', 0.4, F);
  P('M260 900h120M260 1010h120M260 950h120', 0.5, F);
  tag(F, 380, 1030, 'REBAR SCHEDULE', 'end');

  /* corner brackets that frame the sheet */
  var corners = el('g', { fill: 'none', stroke: '#5FB4D8', 'stroke-width': 1.5, 'stroke-opacity': 0.9 }, svg);
  P('M14 40V14h26', 1, corners); P('M386 40V14h-26', 1, corners); P('M14 760v26h26', 1, corners); P('M386 760v26h-26', 1, corners);

  var shown = [];
  var stagger = paths.length;
  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.title[0], b = B.title[1];
    var draw = U.seg(p, a, b + 0.05);
    for (var k = 0; k < paths.length; k++) {
      var d = U.ease.out(U.clamp(draw * 1.8 - (k / stagger) * 0.8));
      var v = 1 - d;
      if (shown[k] !== v) { paths[k].setAttribute('stroke-dashoffset', v); shown[k] = v; }
    }
    /* drift: slow vertical parallax with the scroll, plus an idle float */
    var calm = ctx.reducedMotion();
    grid.setAttribute('transform', 'translate(0 ' + (-p * 180) + ')');
    var gs = plans.children;
    var ty = -p * 360;
    plans.setAttribute('transform', 'translate(0 ' + ty + ')');
    if (!calm) {
      var n = 0;
      for (var q = 0; q < gs.length; q++) {
        if (gs[q].getAttribute && gs[q].getAttribute('data-float')) {
          n++;
          gs[q].setAttribute('transform', 'translate(' + (Math.sin(t * 0.35 + n * 1.7) * 3).toFixed(2) + ' ' + (Math.cos(t * 0.28 + n) * 3).toFixed(2) + ')');
        }
      }
    }
    /* dim the sheet a touch when something big sits on top of it */
    layer.style.opacity = 1 - 0.64 * U.seg(p, B.walls[0] - 0.03, B.walls[0] + 0.02);
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
