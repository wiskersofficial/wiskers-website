/* bursts: Swift flies through what it studied. Six events, each with its OWN art (Josh, 4 Nov 2026: "if you're going to do that, I would expect you to have different pieces of art"):
 *   gamma-ray burst: a point with twin relativistic jets and shock rings   active galaxy: a spiral disc with a bright core and a jet
 *   X-ray flare: a star with looping flare arcs                            supernova: an expanding, ragged shell with filaments
 *   comet: a coma with dust and ion tails                                  asteroid: a tumbling, cratered rock with a dust trail
 * Categories are NASA's own list; no counts (outlets disagree). Each flash glints on the craft (shared glint) and gives a tick.
 * Layout: events pass in the free band below the craft (about 70 to 88% of the height), so labels never touch the craft or the copy. Group: drawn in code. */
Bagel.shared = Bagel.shared || {};
(function () {
  var START = 0.27, END = 0.43;                        /* kept in step with Swift.beats.sees */
  var EV = [
    { t: 0.05, side: 'l', type: 'gamma',    label: 'Gamma-ray burst' },
    { t: 0.20, side: 'r', type: 'galaxy',   label: 'Active galaxy' },
    { t: 0.35, side: 'l', type: 'xray',     label: 'X-ray flare' },
    { t: 0.50, side: 'r', type: 'nova',     label: 'Supernova' },
    { t: 0.65, side: 'l', type: 'comet',    label: 'Comet', noRing: 1 },
    { t: 0.80, side: 'r', type: 'asteroid', label: 'Asteroid', noRing: 1 }
  ];
  Bagel.shared.glint = function (p) {
    var q = Math.min(1, Math.max(0, (p - START) / (END - START)));
    if (p < START || p > END) return 0;
    var g = 0;
    EV.forEach(function (e) { var d = q - e.t; if (d >= 0 && d < 0.07) g = Math.max(g, (1 - d / 0.07) * 0.9); });
    return g;
  };

  var ICE = '#EAF2FF', BLUE = '#7FB4FF', EMB = '#FF7A3D';

  /* each maker draws into a 100x100 box centred on 0,0 and returns set(s) for life s in 0..1 */
  function makers(el, svg, uid, U) {
    var defs = el('defs', {}, svg);
    function rg(id, stops) { var g = el('radialGradient', { id: id + uid }, defs); stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g); }); return 'url(#' + id + uid + ')'; }
    function lg(id, x1, y1, x2, y2, stops) { var g = el('linearGradient', { id: id + uid, x1: x1, y1: y1, x2: x2, y2: y2 }, defs); stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g); }); return 'url(#' + id + uid + ')'; }
    var R = U.rng(uid * 97 + 5);
    return {
      gamma: function () {
        var glow = el('circle', { r: 34, fill: rg('gl', [[0, '#fff', 1], [0.3, '#cfe6ff', 0.6], [1, BLUE, 0]]) }, svg);
        var jg = lg('jg', 0, 1, 0, 0, [[0, '#fff', 1], [0.6, '#9cc8ff', 0.7], [1, BLUE, 0]]);
        var up = el('path', { d: 'M-4.5 0L4.5 0L0 -1Z', fill: jg }, svg), dn = el('path', { d: 'M-4.5 0L4.5 0L0 1Z', fill: jg }, svg);
        var r1 = el('circle', { r: 6, fill: 'none', stroke: ICE, 'stroke-width': 1.4 }, svg), r2 = el('circle', { r: 6, fill: 'none', stroke: BLUE, 'stroke-width': 1 }, svg);
        var core = el('circle', { r: 5, fill: '#fff' }, svg);
        return function (s) {
          var L = 6 + 44 * U.ease.out(s);
          up.setAttribute('transform', 'scale(1 ' + L + ')'); dn.setAttribute('transform', 'scale(1 ' + L + ')'); dn.setAttribute('d', 'M-4.5 0L4.5 0L0 1Z'); dn.setAttribute('transform', 'scale(1 ' + (-L) + ')');
          var a = 1 - U.seg(s, 0.6, 1); up.setAttribute('opacity', a); dn.setAttribute('opacity', a);
          r1.setAttribute('r', 6 + 40 * U.ease.out(s)); r1.setAttribute('opacity', (1 - s) * 0.9);
          r2.setAttribute('r', 4 + 30 * U.ease.out(U.seg(s, 0.1, 1))); r2.setAttribute('opacity', (1 - U.seg(s, 0.1, 1)) * 0.7);
          glow.setAttribute('opacity', 1 - s * 0.6); core.setAttribute('r', 5 * (1 - 0.4 * s));
        };
      },
      galaxy: function () {
        var outer = el('g', { transform: 'rotate(-22)' }, svg);
        var halo = el('ellipse', { rx: 46, ry: 16, fill: rg('gx', [[0, '#fff3d8', 0.9], [0.3, '#cfe0ff', 0.5], [1, '#5b86d8', 0]]) }, outer);
        var flat = el('g', { transform: 'scale(1 .34)' }, outer), spin = el('g', {}, flat);
        [0, Math.PI].forEach(function (off) {
          var d = ''; for (var i = 0; i <= 28; i++) { var t = i / 28, r = 4 + t * 40, a = t * 5.0 + off; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
          el('path', { d: d, fill: 'none', stroke: '#cfe0ff', 'stroke-width': 3, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, spin);
          el('path', { d: d, fill: 'none', stroke: '#fff', 'stroke-width': 1, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, spin);
        });
        var jet = el('path', { d: 'M0 0L0 -1', stroke: BLUE, 'stroke-width': 3, 'stroke-linecap': 'round' }, outer), jet2 = el('path', { d: 'M0 0L0 1', stroke: BLUE, 'stroke-width': 3, 'stroke-linecap': 'round' }, outer);
        var core = el('circle', { r: 6, fill: rg('gc', [[0, '#fff', 1], [0.5, '#ffe9b8', 0.9], [1, '#ffb060', 0]]) }, outer);
        return function (s) {
          spin.setAttribute('transform', 'rotate(' + (s * 140) + ')');
          var L = 8 + 38 * U.ease.out(s);
          jet.setAttribute('d', 'M0 -4L0 ' + (-L)); jet2.setAttribute('d', 'M0 4L0 ' + L);
          jet.setAttribute('opacity', 0.4 + 0.6 * U.seg(s, 0, 0.3)); jet2.setAttribute('opacity', 0.4 + 0.6 * U.seg(s, 0, 0.3));
          core.setAttribute('r', 6 + 3 * Math.sin(s * 9));
        };
      },
      xray: function () {
        var halo = el('circle', { r: 30, fill: rg('xh', [[0, '#ffd9a0', 0.7], [1, '#ff9a50', 0]]) }, svg);
        var star = el('circle', { r: 15, fill: rg('xs', [[0, '#fff', 1], [0.55, '#ffeab8', 1], [1, '#ff9a50', 1]]) }, svg);
        var loops = [0, 1, 2].map(function (i) {
          var g = el('g', { transform: 'rotate(' + (-50 + i * 14) + ')' }, svg);
          el('path', { d: 'M12 -6A' + (14 + i * 4) + ' ' + (22 + i * 6) + ' 0 0 1 12 8', fill: 'none', stroke: i === 1 ? '#fff' : EMB, 'stroke-width': 2.2 - i * 0.4, 'stroke-linecap': 'round' }, g);
          return g;
        });
        var spike = el('path', { d: 'M0 -2L40 0L0 2Z', fill: '#fff', transform: 'rotate(-38) translate(13 0)' }, svg);
        return function (s) {
          loops.forEach(function (g, i) { var t = U.seg(s, i * 0.12, 0.5 + i * 0.15); g.setAttribute('transform', 'rotate(' + (-50 + i * 14) + ') scale(' + (0.5 + 1.1 * U.ease.out(t)) + ')'); g.setAttribute('opacity', t * (1 - U.seg(s, 0.8, 1))); });
          var sp = U.seg(s, 0.05, 0.4) * (1 - U.seg(s, 0.4, 0.8)); spike.setAttribute('transform', 'rotate(-38) translate(13 0) scale(' + (0.2 + sp) + ' ' + (0.6 + sp) + ')'); spike.setAttribute('opacity', sp);
          halo.setAttribute('opacity', 0.6 + 0.4 * sp);
        };
      },
      nova: function () {
        var glow = el('circle', { r: 26, fill: rg('nv', [[0, '#fff', 1], [0.3, '#cfe6ff', 0.6], [1, BLUE, 0]]) }, svg);
        var fil = el('g', { stroke: ICE, 'stroke-linecap': 'round' }, svg);
        var lines = []; for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283 + R() * 0.2, l0 = 0.35 + R() * 0.2, l1 = 0.75 + R() * 0.25; lines.push({ n: el('line', { x1: 0, y1: 0, x2: 0, y2: 0, 'stroke-width': 1 + R() }, fil), a: a, l0: l0, l1: l1 }); }
        function ring(base, jit) { var d = ''; for (var k = 0; k < 30; k++) { var a = k / 30 * 6.283, r = base * (1 + (R() - 0.5) * jit); d += (k ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d + 'Z'; }
        var shell = el('path', { d: ring(1, 0.22), fill: 'none', stroke: ICE, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
        var shell2 = el('path', { d: ring(0.72, 0.3), fill: 'none', stroke: EMB, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg);
        return function (s) {
          var e = U.ease.out(s), r = 4 + 40 * e;
          shell.setAttribute('transform', 'scale(' + r + ')'); shell.setAttribute('stroke-width', 2.4 / r); shell.setAttribute('opacity', 1 - U.seg(s, 0.7, 1));
          shell2.setAttribute('transform', 'scale(' + (r * 0.95) + ')'); shell2.setAttribute('stroke-width', 1.8 / r); shell2.setAttribute('opacity', 0.85 - U.seg(s, 0.6, 1) * 0.85);
          lines.forEach(function (l) { var r0 = r * l.l0, r1 = r * l.l1; l.n.setAttribute('x1', Math.cos(l.a) * r0); l.n.setAttribute('y1', Math.sin(l.a) * r0); l.n.setAttribute('x2', Math.cos(l.a) * r1); l.n.setAttribute('y2', Math.sin(l.a) * r1); l.n.setAttribute('opacity', 0.9 * (1 - U.seg(s, 0.5, 1))); });
          glow.setAttribute('opacity', 1 - U.seg(s, 0, 0.7)); glow.setAttribute('r', 26 * (1 - 0.5 * s));
        };
      },
      comet: function () {
        var wrap = el('g', { transform: 'rotate(-18)' }, svg);
        var dust = el('path', { d: 'M0 0Q-34 -2 -66 -24Q-36 10 0 4Z', fill: lg('dt', 1, 0, 0, 0, [[0, '#fff', 0.9], [0.5, '#bfd8ff', 0.4], [1, BLUE, 0]]) }, wrap);
        var ion = el('path', { d: 'M0 -1L-70 -6', stroke: lg('io', 1, 0, 0, 0, [[0, '#9cc8ff', 0.9], [1, BLUE, 0]]), 'stroke-width': 2.4, 'stroke-linecap': 'round' }, wrap);
        var coma = el('circle', { r: 12, fill: rg('cm', [[0, '#fff', 1], [0.4, '#cfe6ff', 0.7], [1, BLUE, 0]]) }, wrap);
        var nuc = el('circle', { r: 3.2, fill: '#fff' }, wrap);
        return function (s) {
          wrap.setAttribute('transform', 'translate(' + (-14 + 28 * s) + ' ' + (4 - 8 * s) + ') rotate(-18)');
          dust.setAttribute('transform', 'scale(' + (0.95 + 0.55 * s) + ' ' + (1.0 + 0.4 * s) + ')'); ion.setAttribute('transform', 'scale(' + (0.9 + 0.5 * s) + ' 1)');
          coma.setAttribute('r', 10 + 4 * Math.sin(s * 6));
        };
      },
      asteroid: function () {
        var pts = []; for (var i = 0; i < 11; i++) { var a = i / 11 * 6.283, r = 17 + (R() - 0.5) * 9; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
        var rock = el('g', {}, svg);
        el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z', fill: lg('rk', 0, 0, 1, 1, [[0, '#b7c4dc', 1], [0.55, '#5a6a8c', 1], [1, '#232c47', 1]]), stroke: ICE, 'stroke-opacity': 0.5, 'stroke-width': 0.9, 'stroke-linejoin': 'round' }, rock);
        [[-5, -4, 4.5], [6, 3, 3.4], [-2, 8, 2.6]].forEach(function (c) { el('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[2] * 0.7, fill: '#1b2440', 'fill-opacity': 0.6, stroke: '#9fb0cc', 'stroke-opacity': 0.4, 'stroke-width': 0.7 }, rock); });
        var dots = []; for (var j = 0; j < 7; j++) dots.push(el('circle', { r: 1.1 + R() * 1.2, fill: ICE }, svg));
        return function (s) {
          rock.setAttribute('transform', 'rotate(' + (s * 230) + ') scale(' + (0.9 + 0.2 * s) + ')');
          dots.forEach(function (d, i) { var k = (i + 1) / 8, off = k * 34 * (0.4 + s); d.setAttribute('cx', -22 - off); d.setAttribute('cy', Math.sin(i * 2.3 + s * 4) * 6 + k * 6); d.setAttribute('opacity', (1 - k) * 0.8 * (1 - U.seg(s, 0.8, 1))); });
        };
      }
    };
  }

  Bagel.register('bursts', function (layer, ctx, B) {
    var U = Bagel.util, el = U.el;
    var evs = EV.map(function (e, idx) {
      var d = el('div', { 'class': 'ev', 'data-gate-id': e.label }, layer);
      d.style.left = (e.side === 'l' ? 25 : 75) + '%';
      var flash = el('div', { 'class': 'flash' }, d), ring = el('div', { 'class': 'ring' }, d);
      var svg = el('svg', { viewBox: '-38 -38 76 76', 'class': 'art', 'data-gate': 'art', 'data-gate-group': 'ev' + idx, 'data-gate-id': e.label + ' art' }, d);
      var set = makers(el, svg, idx + 1, U)[e.type]();
      var lab = el('div', { 'class': 'lab', 'data-gate': 'text', 'data-gate-group': 'ev' + idx, text: e.label }, d);
      return { d: d, flash: flash, ring: ring, svg: svg, set: set, lab: lab, e: e, fired: false };
    });
    var unsub = ctx.timeline.subscribe(function (p) {
      var on = p > START - 0.02 && p < END + 0.03;
      layer.style.visibility = on ? 'visible' : 'hidden';
      if (!on) { evs.forEach(function (v) { v.fired = false; }); return; }
      var q = (p - START) / (END - START);
      evs.forEach(function (v) {
        var s = U.clamp((q - v.e.t) / 0.2), live = q >= v.e.t && s < 1;
        v.d.style.display = live ? '' : 'none';
        if (!live) { v.fired = false; return; }
        var inn = U.ease.out(U.seg(s, 0, 0.1)), out = 1 - U.seg(s, 0.8, 1);
        v.d.style.transform = 'translate3d(0,' + (s * 2) + 'svh,0)';
        v.svg.style.opacity = inn * out;
        v.svg.style.transform = 'scale(' + (0.5 + 0.5 * U.ease.back(U.seg(s, 0, 0.18))) + ')';
        v.set(s);
        var pop = s < 0.05 ? s / 0.05 : Math.pow(1 - s, 1.8);
        v.flash.style.opacity = pop * 0.9; v.flash.style.transform = 'scale(' + (0.3 + 1.0 * U.ease.out(s)) + ')';
        v.ring.style.opacity = v.e.noRing ? 0 : (1 - U.seg(s, 0, 0.6)) * 0.55; v.ring.style.transform = 'scale(' + (0.3 + 1.1 * U.ease.out(U.seg(s, 0, 0.6))) + ')';
        v.lab.style.opacity = U.seg(s, 0.06, 0.16) * out;
        if (s < 0.2 && !v.fired) { v.fired = true; ctx.haptic.play('tick'); }
      });
    });
    return { destroy: function () { unsub(); layer.innerHTML = ''; } };
  });
})();
