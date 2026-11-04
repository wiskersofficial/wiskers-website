/* walls: drywall strips fly off a wall to show what is inside it (studs, pipe, duct, beam).
 * Role: middle of the scroll, explains "it knows what is inside walls". Group: drawn in code (SVG). */
Bagel.register('walls', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var wrap = el('div', { 'class': 'wrap', 'aria-hidden': 'true' }, layer);
  var svg = el('svg', { viewBox: '0 0 300 440' }, wrap);
  var defs = el('defs', {}, svg);
  var hatch = el('pattern', { id: 'hatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: '#5FB4D8', 'stroke-width': 1, 'stroke-opacity': 0.55 }, hatch);

  var LINE = '#5FB4D8', PAPER = '#F4F1E8';
  var inside = el('g', {}, svg);

  /* slabs (floor and ceiling) */
  var slabs = el('g', { fill: 'url(#hatch)', stroke: PAPER, 'stroke-width': 1.5 }, inside);
  el('rect', { x: 20, y: 398, width: 260, height: 18 }, slabs);
  el('rect', { x: 20, y: 24, width: 260, height: 14 }, slabs);

  /* studs */
  var studs = [];
  for (var i = 0; i < 7; i++) {
    studs.push(el('rect', { x: 46 + i * 34, y: 38, width: 8, height: 360, fill: 'rgba(244,241,232,.06)', stroke: PAPER, 'stroke-width': 1.3, 'stroke-opacity': 0.9 }, inside));
  }
  /* noggin (horizontal blocking) */
  var blocking = el('g', { stroke: PAPER, 'stroke-width': 1.1, 'stroke-opacity': 0.6, fill: 'none' }, inside);
  for (i = 0; i < 6; i++) el('rect', { x: 54 + i * 34, y: 230, width: 26, height: 7 }, blocking);

  /* beam across the top: steel I-section in elevation */
  var beam = el('g', { fill: 'none', stroke: PAPER, 'stroke-width': 2 }, inside);
  el('rect', { x: 30, y: 44, width: 240, height: 6 }, beam);
  el('rect', { x: 30, y: 74, width: 240, height: 6 }, beam);
  el('line', { x1: 30, y1: 50, x2: 270, y2: 74 , 'stroke-width': 0.8, 'stroke-opacity': 0.0 }, beam);
  var web = el('rect', { x: 30, y: 50, width: 240, height: 24, fill: 'url(#hatch)', stroke: PAPER, 'stroke-width': 1.2 }, beam);

  /* duct: rectangle with diagonal cross */
  var duct = el('g', { fill: 'none', stroke: LINE, 'stroke-width': 1.8 }, inside);
  var dp = el('path', { d: 'M30 112H270V158H30Z', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, duct);
  var dx = el('path', { d: 'M30 112L270 158M30 158L270 112', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, 'stroke-width': 0.9, 'stroke-opacity': 0.7 }, duct);

  /* pipe: double line riser with dashed centre, one elbow to the side */
  var pipe = el('g', { fill: 'none', stroke: LINE, 'stroke-width': 2 }, inside);
  var pp1 = el('path', { d: 'M92 160V300H196V398', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, pipe);
  var pp2 = el('path', { d: 'M100 160V308H204V398', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, pipe);
  var pc = el('path', { d: 'M96 160V304H200V398', 'stroke-dasharray': '3 4', 'stroke-width': 0.9, 'stroke-opacity': 0.8, opacity: 0 }, pipe);

  /* labels with leader lines */
  var labels = [];
  function label(text, x, y, tx, ty, anchor) {
    var g = el('g', { opacity: 0 }, inside);
    el('line', { x1: x, y1: y, x2: tx, y2: ty, stroke: LINE, 'stroke-width': 1 }, g);
    el('circle', { cx: x, cy: y, r: 2.6, fill: LINE }, g);
    el('text', { x: tx + (anchor === 'end' ? -4 : 4), y: ty + 3, fill: PAPER, 'font-size': 10, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.1em', 'text-anchor': anchor || 'start' }, g).textContent = text;
    labels.push(g); return g;
  }
  label('STEEL BEAM', 240, 62, 292, 20, 'end');
  label('DUCT', 220, 135, 292, 106, 'end');
  label('STUDS', 252, 300, 292, 262, 'end');
  label('PIPE', 150, 304, 18, 360, 'start');

  /* drywall strips on the front: they fly off in turn */
  var strips = [];
  var STRIPS = 5, sh = 380 / STRIPS;
  var front = el('g', {}, svg);
  for (i = 0; i < STRIPS; i++) {
    var gs = el('g', { 'data-dir': i % 2 ? 1 : -1 }, front);
    el('rect', { x: 26, y: 24 + i * sh, width: 248, height: sh - 1, fill: '#E9E5D8', stroke: '#0F2A4A', 'stroke-width': 1.2 }, gs);
    el('line', { x1: 26, y1: 24 + i * sh + 10, x2: 274, y2: 24 + i * sh + 10, stroke: '#0F2A4A', 'stroke-opacity': 0.12 }, gs);
    strips.push({ g: gs, y: 24 + i * sh + sh / 2, fired: false });
  }
  /* the strips carry a dim "drywall" label so the start reads as a plain wall */
  el('text', { x: 150, y: 224, fill: '#0F2A4A', 'fill-opacity': 0.55, 'font-size': 11, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.2em', 'text-anchor': 'middle' }, front).textContent = 'WALL';
  var wallWord = front.lastChild;

  /* scanner line */
  var scan = el('rect', { x: 10, y: 0, width: 280, height: 2, fill: LINE, opacity: 0 }, svg);

  var beamLit = false;
  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.walls[0], b = B.walls[1];
    var q = U.seg(p, a - 0.02, b + 0.01);
    layer.style.visibility = (p > a - 0.03 && p < b + 0.02) ? 'visible' : 'hidden';
    var enter = U.ease.out(U.seg(q, 0, 0.16));
    var exit = U.ease.inout(U.seg(q, 0.9, 1));
    var op = enter * (1 - exit);
    wrap.style.opacity = op;
    wrap.style.transform = 'translate3d(0,' + ((1 - enter) * 24 - exit * 30) + 'svh,0) rotateY(' + ((1 - enter) * -28 + exit * 20) + 'deg) rotateX(' + ((1 - enter) * 10) + 'deg)';

    /* peel */
    var peelQ = U.seg(q, 0.18, 0.55);
    for (var k = 0; k < strips.length; k++) {
      var s = strips[k];
      var t = U.ease.inout(U.seg(peelQ * 1.6 - k * 0.15, 0, 0.6));
      var dir = +s.g.getAttribute('data-dir');
      s.g.setAttribute('transform', 'translate(' + (dir * 340 * t) + ' ' + (-30 * t) + ') rotate(' + (dir * 18 * t) + ' 150 ' + s.y + ')');
      s.g.setAttribute('opacity', 1 - U.seg(t, 0.7, 1));
      var fired = t > 0.02;
      if (fired && !s.fired) ctx.haptic.play('tick');
      s.fired = fired;
    }
    wallWord.setAttribute('opacity', 1 - U.seg(peelQ, 0, 0.08));

    /* scanner sweeps down while the wall opens */
    var sq = U.seg(q, 0.16, 0.6);
    scan.setAttribute('y', 20 + sq * 390);
    scan.setAttribute('opacity', sq > 0 && sq < 1 ? 0.9 * Math.sin(sq * Math.PI) : 0);

    /* services draw on */
    var dq = U.seg(q, 0.5, 0.68);
    dp.setAttribute('stroke-dashoffset', 1 - U.ease.out(dq));
    dx.setAttribute('stroke-dashoffset', 1 - U.ease.out(U.seg(q, 0.52, 0.7)));
    var pq = U.ease.out(U.seg(q, 0.55, 0.75));
    pp1.setAttribute('stroke-dashoffset', 1 - pq); pp2.setAttribute('stroke-dashoffset', 1 - pq);
    pc.setAttribute('opacity', U.seg(q, 0.7, 0.78));
    /* labels pop */
    var lq = [U.seg(q, 0.62, 0.7), U.seg(q, 0.68, 0.76), U.seg(q, 0.74, 0.82), U.seg(q, 0.78, 0.86)];
    for (k = 0; k < labels.length; k++) {
      var e = U.ease.back(lq[k]);
      labels[k].setAttribute('opacity', U.seg(lq[k], 0, 0.3));
    }
    /* beam lights up (paper outlines get thick) */
    var lit = U.seg(q, 0.74, 0.86);
    beam.setAttribute('stroke-width', 2 + lit * 1.6);
    web.setAttribute('fill-opacity', 0.6 + 0.4 * lit);
    if (lit > 0.5 && !beamLit) { beamLit = true; ctx.haptic.play('thud'); }
    if (lit < 0.2) beamLit = false;
    /* studs shimmer one by one as the scanner passes */
    for (k = 0; k < studs.length; k++) {
      studs[k].setAttribute('stroke-opacity', 0.55 + 0.45 * U.seg(q, 0.3 + k * 0.02, 0.4 + k * 0.02));
    }
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
