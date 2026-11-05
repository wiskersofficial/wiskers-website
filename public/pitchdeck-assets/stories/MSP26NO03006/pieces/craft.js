/* craft: Swift as a real lit 3D model on a canvas (Bagel.Mesh), not a flat drawing. Role: hero and connective tissue; fixed on screen all the way.
 * Parts: bus with gold foil band and star trackers, BAT (coded-mask box) with antenna, gold-foil telescope barrel with a second tube, two cell-gridded solar wings.
 * The craft really turns (yaw and pitch). Burn: faces blend toward ember, parts break away along their own 3D paths with ember trails, debris sprays,
 * the first break-up has a white flash as the visual twin of the thud. Group: vector model drawn in code, no media. Illustration, not to scale.
 * Layout: the craft sits below the copy zone (centre 57.5% of the screen height) so no title or caption ever covers it. */
Bagel.register('craft', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el, M = Bagel.Mesh;
  var cv = el('canvas', { 'class': 'c3d', 'aria-hidden': 'true' }, layer);
  var g = cv.getContext('2d');
  var gateBox = el('div', { 'data-gate': 'art', 'data-gate-id': 'craft', style: 'position:absolute;pointer-events:none;opacity:0' }, layer);
  var whiteout = el('div', { 'class': 'whiteout' }, layer);
  var W = 0, H = 0, dpr = 1;
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = layer.clientWidth; H = layer.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  resize(); window.addEventListener('resize', resize);
  var rend = M.renderer(g);

  /* ---- the model ---- */
  var WHITE = '#dfe6f3', GOLD = '#cfa24a', BLUE = '#1f3a80', SILVER = '#a9b6cd', DARK = '#2a3350';
  var cells = { grid: { u: 9, v: 4, c: '130,170,240' } };
  var model = { groups: {} };
  model.groups.bus = { faces: [].concat(
    M.box(-0.5, -0.45, -0.5, 0.5, 0.45, 0.5, WHITE, 'matte', { perFace: { 0: { grid: { u: 1, v: 6, c: '90,104,140' } }, 2: { grid: { u: 1, v: 6, c: '90,104,140' } }, 3: { grid: { u: 1, v: 6, c: '90,104,140' } } } }),
    M.box(-0.53, -0.45, -0.53, 0.53, 0.08, 0.53, GOLD, 'foil', { perFace: { 0: { grid: { u: 7, v: 3, c: '110,74,18' } }, 2: { grid: { u: 5, v: 3, c: '110,74,18' } }, 3: { grid: { u: 5, v: 3, c: '110,74,18' } } } }),
    M.box(0.5, 0.2, -0.3, 0.57, 0.3, -0.18, DARK, 'dark'), M.box(-0.57, 0.2, -0.3, -0.5, 0.3, -0.18, DARK, 'dark')
  ) };
  model.groups.bat = { faces: [].concat(
    M.box(-0.58, 0.45, -0.58, 0.58, 0.6, 0.58, SILVER, 'matte', { perFace: { 4: { mask: { u: 15, v: 15 } }, 0: { grid: { u: 10, v: 1, c: '70,84,120' } } } }),
    M.box(-0.03, 0.6, -0.03, 0.03, 0.84, 0.03, SILVER, 'gloss'),
    M.dish(0, 0.86, 0.0, 0.2, 0.1, 14, '#f2f6ff', 'gloss')
  ) };
  model.groups.tube = { faces: [].concat(
    M.cylinder(0, 0, 0.3, -1.45, -0.45, 18, GOLD, 'foil', { bottom: '#0a0f20' }),
    M.cylinder(0.4, 0.12, 0.15, -1.1, -0.45, 12, SILVER, 'gloss', { bottom: '#0a0f20' }),
    M.box(-0.34, -0.8, -0.34, 0.34, -0.74, 0.34, DARK, 'dark')
  ) };
  model.groups.wingL = { faces: [].concat(
    M.box(-0.62, -0.03, -0.03, -0.5, 0.03, 0.03, SILVER, 'gloss'),
    M.box(-1.85, -0.46, -0.025, -0.62, 0.46, 0.025, BLUE, 'gloss', { perFace: { 0: cells, 1: cells } })
  ) };
  model.groups.wingR = { faces: [].concat(
    M.box(0.5, -0.03, -0.03, 0.62, 0.03, 0.03, SILVER, 'gloss'),
    M.box(0.62, -0.46, -0.025, 1.85, 0.46, 0.025, BLUE, 'gloss', { perFace: { 0: cells, 1: cells } })
  ) };
  var IDS = ['wingL', 'wingR', 'bat', 'dish', 'tube', 'bus'];
  /* the dish rides with the BAT group; keep a separate break key for it so it can leave on its own */
  var BREAK = {
    wingL: { at: 0.16, v: [-3.4, 0.4, 1.0], spin: [2.2, 1.6, 3.0] },
    wingR: { at: 0.26, v: [3.8, 0.2, -0.8], spin: [-1.8, 2.4, -2.6] },
    bat:   { at: 0.40, v: [-1.4, 1.0, 2.2], spin: [2.4, -1.2, 1.9] },
    tube:  { at: 0.52, v: [0.8, -2.0, 1.2], spin: [1.4, 0.8, 2.8] },
    bus:   { at: 0.62, v: [0.0, -0.6, 0.0], spin: [0.6, 0.4, 1.1] }
  };
  var R = U.rng(3200), debris = [];
  for (var i = 0; i < 34; i++) debris.push({ a: R() * 6.283, v: 40 + R() * 190, at: 0.14 + R() * 0.62, life: 0.16 + R() * 0.22, gy: 40 + R() * 120, r: 1 + R() * 2.3, w: R() });

  var thudded = false, rumbled = false;
  function proj(pt, v, f) {                                          /* same transform the renderer uses, for trails */
    var q = pt, c, s, t, x = q[0], y = q[1], z = q[2];
    if (v.roll) { c = Math.cos(v.roll); s = Math.sin(v.roll); t = x * c - y * s; y = x * s + y * c; x = t; }
    if (v.pitch) { c = Math.cos(v.pitch); s = Math.sin(v.pitch); t = y * c - z * s; z = y * s + z * c; y = t; }
    if (v.yaw) { c = Math.cos(v.yaw); s = Math.sin(v.yaw); t = x * c + z * s; z = -x * s + z * c; x = t; }
    var k = f / (f - z); return [v.cx + x * k * v.scale, v.cy - y * k * v.scale];
  }

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var calm = ctx.reducedMotion();
    var burn = U.seg(p, B.burn[0], B.burn[1]);
    var gone = U.seg(burn, 0.78, 0.98);
    layer.style.visibility = gone < 1 ? 'visible' : 'hidden';
    if (gone >= 1) { thudded = false; rumbled = false; return; }
    var enter = U.ease.out(U.seg(p, 0, 0.05));
    var sink = U.ease.inout(U.seg(p, B.sink[0], B.sink[1]));
    var heat = U.ease.inout(U.seg(burn, 0, 0.35)) * (1 - U.seg(burn, 0.8, 1));
    var yaw = calm ? 0.5 : 0.75 * Math.sin(t * 0.45 + p * 5) * (1 - 0.7 * sink);
    var pitch = 0.3 - 0.12 * sink + (calm ? 0 : Math.sin(t * 0.3) * 0.04);
    var shake = calm ? 0 : heat * (1 + burn * 3) * 2.4;
    var cx = W / 2 + (calm ? 0 : Math.sin(t * 53) * shake), cy = H * 0.575 + (1 - enter) * 14 + (calm ? 0 : Math.cos(t * 47) * shake);
    var span = Math.min(W * 0.7, 270), scale = span / 3.7 * (1 - 0.08 * sink);
    var view = { cx: cx, cy: cy, scale: scale, yaw: yaw, pitch: pitch, roll: -0.08 + (calm ? 0 : Math.sin(t * 38) * heat * 0.03), heat: heat, t: t, persp: 7 };

    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    var alpha = enter * (1 - gone);
    g.globalAlpha = alpha;
    /* glows behind the model: burst glint (cool) and burn flare (ember) */
    var gl = Bagel.shared && Bagel.shared.glint ? Bagel.shared.glint(p) : 0;
    g.globalCompositeOperation = 'lighter';
    if (gl > 0.02) { var gg = g.createRadialGradient(cx, cy, 0, cx, cy, scale * 2.2); gg.addColorStop(0, 'rgba(200,225,255,' + (0.55 * gl).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = gg; g.fillRect(0, 0, W, H); }
    if (heat > 0.02) { var fl = U.ease.out(U.seg(burn, 0.02, 0.4)) * (1 - U.seg(burn, 0.7, 1)); var fg = g.createRadialGradient(cx, cy, 0, cx, cy, scale * (1.8 + heat)); fg.addColorStop(0, 'rgba(255,150,70,' + (0.8 * fl).toFixed(3) + ')'); fg.addColorStop(0.5, 'rgba(255,100,40,' + (0.25 * fl).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = fg; g.fillRect(0, 0, W, H); }
    g.globalCompositeOperation = 'source-over';

    /* break-up transforms, per group */
    IDS.forEach(function (id) { if (model.groups[id]) model.groups[id].t = { pos: [0, 0, 0], rot: [0, 0, 0], a: 1 }; });
    var trails = [];
    Object.keys(BREAK).forEach(function (id) {
      var b = BREAK[id], s = U.seg(burn, b.at, b.at + 0.3);
      if (s <= 0) return;
      var d = s * s * 1.0, tr = model.groups[id].t;
      tr.pos = [b.v[0] * d, b.v[1] * d, b.v[2] * d];
      tr.rot = [b.spin[0] * s * 2, b.spin[1] * s * 2, b.spin[2] * s * 2];
      tr.a = id === 'bus' ? 1 - U.seg(s, 0.45, 1) : 1 - U.seg(s, 0.55, 1);
      var s0 = Math.max(0, s - 0.08), d0 = s0 * s0;
      trails.push({ a: [b.v[0] * d0, b.v[1] * d0, b.v[2] * d0], b: tr.pos, k: tr.a * Math.min(1, s * 3) });
    });
    var info = rend.draw(model, view);

    /* ember trails and debris, over the model */
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    trails.forEach(function (tl) {
      var A = proj(tl.a, view, 7), Bp = proj(tl.b, view, 7);
      g.strokeStyle = 'rgba(255,150,80,' + (0.8 * tl.k).toFixed(3) + ')'; g.lineWidth = 3; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(Bp[0], Bp[1]); g.stroke();
    });
    debris.forEach(function (c) {
      var s = (burn - c.at) / c.life; if (s <= 0 || s >= 1) return;
      g.fillStyle = 'rgba(255,' + (150 + 60 * c.w | 0) + ',' + (90 + 40 * c.w | 0) + ',' + (1 - s).toFixed(3) + ')';
      g.beginPath(); g.arc(cx + Math.cos(c.a) * c.v * s * 1.2, cy + Math.sin(c.a) * c.v * s * 1.2 + c.gy * s * s, c.r, 0, 6.283); g.fill();
    });
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

    /* the gate box follows the craft's real extent */
    var bb = info.bbox;
    if (isFinite(bb[0]) && bb[2] > bb[0]) { gateBox.style.left = bb[0] + 'px'; gateBox.style.top = bb[1] + 'px'; gateBox.style.width = (bb[2] - bb[0]) + 'px'; gateBox.style.height = (bb[3] - bb[1]) + 'px'; }
    gateBox.style.opacity = alpha;

    /* thud with its flash twin; rumble while heating */
    var first = U.seg(burn, BREAK.wingL.at, BREAK.wingL.at + 0.04);
    whiteout.style.opacity = 0.5 * Math.sin(first * Math.PI) * (burn < BREAK.wingL.at + 0.06 ? 1 : 0);
    if (first > 0.2 && !thudded) { thudded = true; ctx.haptic.play('thud'); }
    if (first < 0.02) thudded = false;
    if (heat > 0.12 && burn < 0.9 && !rumbled) { rumbled = true; ctx.haptic.play('rumble'); }
    if (heat < 0.05) rumbled = false;
  });
  return { destroy: function () { unsub(); window.removeEventListener('resize', resize); layer.innerHTML = ''; } };
});
