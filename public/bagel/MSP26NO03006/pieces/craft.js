/* craft: Swift, a layered 2.5D vector illustration (not to scale). Role: hero and connective tissue; fixed on screen all the way.
 * Parts: bus, BAT (coded-mask box), telescope barrel, two solar wings, dish. A yaw wobble is faked by squeezing the wings and sliding the layers.
 * Burn: an ember copy of the whole craft fades in over it, parts break away along their own paths, debris sprays, the first break-up has a flash twin for the thud. */
Bagel.register('craft', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var ICE = '#EAF2FF', MID = '#AEBFE0', SHADE = '#5C6F9A', INK = '#0B1226', PANEL = '#1C3166', CELL = '#4F77C8';

  var wrap = el('div', { 'class': 'wrap', 'aria-hidden': 'true' }, layer);
  var flare = el('div', { 'class': 'flare' }, wrap);
  var glint = el('div', { 'class': 'glint' }, wrap);
  var svg = el('svg', { viewBox: '0 0 240 200' }, wrap);
  var defs = el('defs', {}, svg);
  var gp = el('linearGradient', { id: 'cg-sheen', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#2C4C98' }, gp); el('stop', { offset: 0.5, 'stop-color': '#1C3166' }, gp); el('stop', { offset: 1, 'stop-color': '#12234F' }, gp);

  var main = el('g', {}, svg);
  var parts = {};          /* id -> { nodes: [mainNode, heatNode], base: [dx,dy] } */

  function part(id, parent) { var g = el('g', { 'data-part': id }, parent); return g; }
  function panelGroup(g, x, y, w, h) {
    el('rect', { x: x, y: y, width: w, height: h, fill: 'url(#cg-sheen)', stroke: ICE, 'stroke-width': 1.1 }, g);
    var d = '';
    for (var i = 1; i < 6; i++) d += 'M' + (x + i * w / 6) + ' ' + y + 'v' + h;
    for (i = 1; i < 3; i++) d += 'M' + x + ' ' + (y + i * h / 3) + 'h' + w;
    el('path', { d: d, stroke: CELL, 'stroke-width': 0.7, fill: 'none', 'stroke-opacity': 0.8 }, g);
    el('path', { d: 'M' + (x + 4) + ' ' + (y + h - 3) + 'L' + (x + w * 0.45) + ' ' + (y + 3), stroke: '#fff', 'stroke-opacity': 0.28, 'stroke-width': 3, fill: 'none' }, g);
  }

  /* wings and booms */
  var wingL = part('wingL', main); el('path', { d: 'M92 100h-6', stroke: MID, 'stroke-width': 2 }, wingL); panelGroup(wingL, 8, 78, 78, 44);
  var wingR = part('wingR', main); el('path', { d: 'M148 100h6', stroke: MID, 'stroke-width': 2 }, wingR); panelGroup(wingR, 154, 78, 78, 44);
  /* telescope barrel */
  var tube = part('tube', main);
  el('rect', { x: 106, y: 134, width: 28, height: 48, fill: MID, stroke: ICE, 'stroke-width': 1 }, tube);
  el('rect', { x: 106, y: 134, width: 10, height: 48, fill: ICE, 'fill-opacity': 0.75 }, tube);
  el('rect', { x: 124, y: 134, width: 10, height: 48, fill: SHADE, 'fill-opacity': 0.8 }, tube);
  el('path', { d: 'M106 146h28M106 158h28M106 170h28', stroke: INK, 'stroke-opacity': 0.5, 'stroke-width': 1.2 }, tube);
  el('ellipse', { cx: 120, cy: 182, rx: 14, ry: 4.5, fill: INK, stroke: ICE, 'stroke-width': 1 }, tube);
  el('ellipse', { cx: 120, cy: 182, rx: 8, ry: 2.5, fill: '#2A3A66' }, tube);
  /* bus: front, side and top faces for a little depth */
  var bus = part('bus', main);
  el('rect', { x: 92, y: 64, width: 56, height: 72, fill: ICE, stroke: '#fff', 'stroke-width': 0.8 }, bus);
  el('path', { d: 'M148 64l12 -8v72l-12 8z', fill: SHADE, stroke: ICE, 'stroke-width': 0.8 }, bus);
  el('path', { d: 'M92 64l12 -8h56l-12 8z', fill: '#fff', 'fill-opacity': 0.9, stroke: ICE, 'stroke-width': 0.8 }, bus);
  el('path', { d: 'M92 88h56M92 112h56M120 64v72', stroke: SHADE, 'stroke-opacity': 0.45, 'stroke-width': 0.9, fill: 'none' }, bus);
  el('rect', { x: 100, y: 118, width: 14, height: 12, fill: INK, 'fill-opacity': 0.55 }, bus);
  el('circle', { cx: 134, cy: 76, r: 3, fill: INK, 'fill-opacity': 0.6 }, bus);
  /* BAT: the coded-mask box on top */
  var bat = part('bat', main);
  el('rect', { x: 96, y: 38, width: 48, height: 18, fill: MID, stroke: ICE, 'stroke-width': 1 }, bat);
  el('path', { d: 'M96 38l8 -6h48l-8 6z', fill: '#fff', 'fill-opacity': 0.85, stroke: ICE, 'stroke-width': 0.8 }, bat);
  var mask = ''; for (var i = 0; i < 8; i++) for (var j = 0; j < 3; j++) if ((i * 3 + j * 5) % 3) mask += 'M' + (99 + i * 5.6) + ' ' + (41 + j * 4.6) + 'h3v3h-3z';
  el('path', { d: mask, fill: INK, 'fill-opacity': 0.7 }, bat);
  /* dish */
  var dish = part('dish', main);
  el('path', { d: 'M160 96l12 -14', stroke: MID, 'stroke-width': 2 }, dish);
  el('path', { d: 'M165 76a10 10 0 0 1 14 14z', fill: ICE, stroke: '#fff', 'stroke-width': 0.8 }, dish);

  /* ember copy: same geometry, every fill and stroke ember */
  var heatG = main.cloneNode(true);
  heatG.setAttribute('class', 'heatclone');
  heatG.setAttribute('opacity', 0);
  svg.appendChild(heatG);
  var st = el('style', { text: '.heatclone *{fill:#FF7A3D !important;stroke:#FFC08A !important;fill-opacity:.9 !important}' }, svg);
  ['wingL', 'wingR', 'tube', 'bus', 'bat', 'dish'].forEach(function (id) {
    parts[id] = { nodes: [main.querySelector('[data-part=' + id + ']'), heatG.querySelector('[data-part=' + id + ']')] };
  });

  /* break-up schedule: when each part lets go (0..1 through the burn), and where to */
  var BREAK = {
    wingL: { at: 0.28, dx: -150, dy: 40, rot: -140 },
    wingR: { at: 0.36, dx: 160, dy: 20, rot: 120 },
    bat:   { at: 0.50, dx: -40, dy: -140, rot: -200 },
    dish:  { at: 0.56, dx: 150, dy: -90, rot: 260 },
    tube:  { at: 0.62, dx: 20, dy: 180, rot: 80 },
    bus:   { at: 0.72, dx: 0, dy: 20, rot: 24 }
  };
  var trails = el('g', { stroke: '#FF9A5C', 'stroke-linecap': 'round', fill: 'none' }, svg);
  var trailEl = {};
  Object.keys(BREAK).forEach(function (id) { trailEl[id] = el('line', { x1: 120, y1: 100, x2: 120, y2: 100, 'stroke-width': 3, opacity: 0 }, trails); });
  /* debris spray (scrubbed, not simulated) */
  var R = U.rng(3200), debris = [];
  var dg = el('g', {}, svg);
  for (i = 0; i < 26; i++) {
    var a = R() * 6.283, v = 40 + R() * 150;
    debris.push({ n: el('circle', { r: 1 + R() * 2.2, fill: i % 3 ? '#FFB27A' : '#FF7A3D', opacity: 0 }, dg), a: a, v: v, at: 0.26 + R() * 0.5, life: 0.18 + R() * 0.2, gy: 40 + R() * 80 });
  }

  var whiteout = el('div', { 'class': 'whiteout' }, layer);
  whiteout.style.zIndex = 5;
  var thudded = false, rumbled = false;

  function applyPart(id, tf, op) {
    var p = parts[id]; for (var k = 0; k < 2; k++) { p.nodes[k].setAttribute('transform', tf); p.nodes[k].setAttribute('opacity', op); }
  }

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var calm = ctx.reducedMotion();
    var burn = U.seg(p, B.burn[0], B.burn[1]);
    var gone = U.seg(p, B.burn[1] - 0.02, B.burn[1] + 0.005);
    layer.style.visibility = (gone < 1) ? 'visible' : 'hidden';
    if (gone >= 1) { thudded = false; return; }

    /* settle in at the start */
    var enter = U.ease.out(U.seg(p, 0, 0.05));
    var sink = U.ease.inout(U.seg(p, B.sink[0], B.sink[1]));
    var heat = U.ease.inout(U.seg(burn, 0, 0.35));
    var yaw = calm ? 0.25 : 0.62 * Math.sin(t * 0.55 + p * 5) * (1 - 0.8 * sink);
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var shake = calm ? 0 : (heat * (1 + burn * 3)) * 2.2;
    var rot = (calm ? -6 : -7 + 3 * Math.sin(t * 0.4)) * (1 - sink) + sink * 4 + (calm ? 0 : Math.sin(t * 38) * heat * 1.6);
    var sx = calm ? 0 : Math.sin(t * 53) * shake, sy2 = calm ? 0 : Math.cos(t * 47) * shake;
    var sc = enter * (1 - 0.1 * sink);
    wrap.style.opacity = enter;
    wrap.style.transform = 'translate3d(' + sx.toFixed(2) + 'px,' + (sy2 + (1 - enter) * 10).toFixed(2) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';

    /* yaw wobble: squeeze the wings, slide the layers */
    var wl = 'translate(92 0) scale(' + cy.toFixed(3) + ' 1) translate(-92 0)';
    var wr = 'translate(148 0) scale(' + cy.toFixed(3) + ' 1) translate(-148 0)';
    var off = { tube: sy * 12, bat: -sy * 8, dish: sy * 5 };
    var order = ['wingL', 'wingR', 'tube', 'bus', 'bat', 'dish'];
    for (var i = 0; i < order.length; i++) {
      var id = order[i], b = BREAK[id];
      var tf = id === 'wingL' ? wl : id === 'wingR' ? wr : 'translate(' + (off[id] || 0).toFixed(2) + ' 0)';
      var op = 1;
      var s = U.seg(burn, b.at, b.at + (id === 'bus' ? 0.26 : 0.3));
      if (s > 0) {
        var d = s * s;                                   /* accelerates away */
        tf = 'translate(' + (b.dx * d).toFixed(1) + ' ' + (b.dy * d).toFixed(1) + ') rotate(' + (b.rot * s).toFixed(1) + ' 120 100) ' + tf;
        op = id === 'bus' ? 1 - U.seg(s, 0.4, 1) : 1 - U.seg(s, 0.55, 1);
        if (id === 'bus') tf += ' translate(120 100) scale(' + (1 - 0.45 * s).toFixed(3) + ') translate(-120 -100)';
        var tr = trailEl[id], len = 55 * Math.min(1, s * 3) * (1 - U.seg(s, 0.6, 1));
        var vx = b.dx * 2 * s, vy = b.dy * 2 * s, vl = Math.hypot(vx, vy) || 1;
        tr.setAttribute('x1', 120 + b.dx * d); tr.setAttribute('y1', 100 + b.dy * d);
        tr.setAttribute('x2', 120 + b.dx * d - vx / vl * len); tr.setAttribute('y2', 100 + b.dy * d - vy / vl * len);
        tr.setAttribute('opacity', 0.8 * (1 - U.seg(s, 0.7, 1)));
      } else { trailEl[id].setAttribute('opacity', 0); }
      applyPart(id, tf, op);
    }
    heatG.setAttribute('opacity', heat * 0.92);
    flare.style.opacity = U.ease.out(U.seg(burn, 0.02, 0.4)) * (1 - U.seg(burn, 0.8, 1));
    flare.style.transform = 'scale(' + (0.6 + heat * 0.7 + (calm ? 0 : Math.sin(t * 9) * 0.03)) + ')';
    debris.forEach(function (c) {
      var s = (burn - c.at) / c.life;
      if (s <= 0 || s >= 1) { c.n.setAttribute('opacity', 0); return; }
      c.n.setAttribute('cx', 120 + Math.cos(c.a) * c.v * s); c.n.setAttribute('cy', 100 + Math.sin(c.a) * c.v * s + c.gy * s * s);
      c.n.setAttribute('opacity', 1 - s);
    });

    /* glint when a burst flashes (the bursts piece owns the schedule) */
    var gl = Bagel.shared && Bagel.shared.glint ? Bagel.shared.glint(p) : 0;
    glint.style.opacity = gl;

    /* thud: first wing lets go, with a white flash as its visual twin */
    var first = U.seg(burn, BREAK.wingL.at, BREAK.wingL.at + 0.04);
    whiteout.style.opacity = 0.5 * Math.sin(first * Math.PI) * (burn < BREAK.wingL.at + 0.06 ? 1 : 0);
    if (first > 0.2 && !thudded) { thudded = true; ctx.haptic.play('thud'); }
    if (first < 0.02) thudded = false;
    if (heat > 0.12 && burn < 0.97 && !rumbled) { rumbled = true; ctx.haptic.play('rumble'); }
    if (heat < 0.05) rumbled = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
