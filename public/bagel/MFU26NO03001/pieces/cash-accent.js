/* cash-accent: banknotes erupt from the $17M and tumble past the camera. Role: foreground accent, one beat only.
 * Group: vector illustration drawn on canvas (generic notes, no real currency design). Fully scrubbed by the timeline. */
Bagel.register('cash-accent', function (layer, ctx, B) {
  var U = Bagel.util;
  var cv = U.el('canvas', { 'class': 'cash', 'aria-hidden': 'true' }, layer);
  var g = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = layer.clientWidth; H = layer.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  var R = U.rng(17);
  var notes = [];
  for (var i = 0; i < 46; i++) {
    var depth = 0.45 + R() * 1.25;                      /* near notes are bigger and faster */
    var ang = -Math.PI / 2 + (R() - 0.5) * 2.5;       /* mostly upward fan */
    notes.push({
      depth: depth, ang: ang, v: (0.55 + R() * 0.8) * depth, delay: R() * 0.3,
      rz0: R() * 6.28, rzs: (R() - 0.5) * 7, rx0: R() * 6.28, rxs: 4 + R() * 7
    });
  }
  notes.sort(function (a, b) { return a.depth - b.depth; });

  function drawNote(n, x, y, scale, t) {
    var sx = Math.cos(n.rx0 + n.rxs * t);
    var w = 74 * scale, h = 36 * scale;
    g.save();
    g.globalAlpha = n.depth < 0.9 ? 0.62 : 1;
    g.translate(x, y);
    g.rotate(n.rz0 + n.rzs * t);
    g.scale(sx, 1);
    var face = sx > 0;
    g.fillStyle = face ? '#F2A33A' : '#C47D1C';
    g.strokeStyle = '#0F2A4A'; g.lineWidth = Math.max(1, 1.6 * scale);
    var r = 3 * scale;
    g.beginPath();
    g.moveTo(-w / 2 + r, -h / 2); g.lineTo(w / 2 - r, -h / 2); g.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    g.lineTo(w / 2, h / 2 - r); g.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); g.lineTo(-w / 2 + r, h / 2);
    g.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); g.lineTo(-w / 2, -h / 2 + r); g.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(15,42,74,.55)'; g.lineWidth = Math.max(1, 1.2 * scale);
    if (face) {                                           /* a circle and two bars: deliberately generic */
      g.beginPath(); g.arc(0, 0, h * 0.28, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(-w * 0.4, -h * 0.2); g.lineTo(-w * 0.22, -h * 0.2); g.moveTo(-w * 0.4, h * 0.2); g.lineTo(-w * 0.22, h * 0.2);
      g.moveTo(w * 0.22, -h * 0.2); g.lineTo(w * 0.4, -h * 0.2); g.moveTo(w * 0.22, h * 0.2); g.lineTo(w * 0.4, h * 0.2); g.stroke();
    } else {
      g.beginPath(); g.rect(-w * 0.34, -h * 0.28, w * 0.68, h * 0.56); g.stroke();
    }
    g.restore();
  }

  var wasOn = false, burst = false;
  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.hero[0] + 0.058, b = B.hero[1] + 0.005;
    var q = U.seg(p, a, b);
    var on = p > a - 0.002 && p < b + 0.002 && !ctx.reducedMotion();
    if (!on) {
      if (wasOn) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); wasOn = false; }
      if (q <= 0) burst = false;
      return;
    }
    wasOn = true;
    if (!burst && q > 0.01) { burst = true; ctx.haptic.play('burst'); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    var ox = W / 2, oy = H * 0.46;
    var unit = Math.min(W, H);
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      var t = (q * 1.3 - n.delay);
      if (t <= 0 || t > 1.05) continue;
      var tt = t * 1.0;
      var x = ox + Math.cos(n.ang) * n.v * unit * 1.25 * tt;
      var y = oy + Math.sin(n.ang) * n.v * unit * 1.25 * tt + 0.5 * H * 2.6 * tt * tt * 0.9;
      var grow = U.ease.out(U.clamp(tt * 5));             /* erupts from the number, small to full size */
      var scale = (unit / 380) * n.depth * (0.25 + 0.75 * grow);
      if (x < -90 || x > W + 90 || y > H + 90 || y < -140) continue;
      drawNote(n, x, y, scale, q * 2 + n.delay);
    }
  });
  return { destroy: function () { unsub(); window.removeEventListener('resize', resize); layer.innerHTML = ''; } };
});
