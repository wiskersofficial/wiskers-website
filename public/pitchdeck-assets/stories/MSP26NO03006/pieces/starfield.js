/* starfield: three depths of stars on canvas. Position is a pure function of the timeline, so it scrubs both ways.
 * Streams down while Swift flies on, then streaks UP while it sinks (the camera is locked to the craft). Group: drawn in code. */
Bagel.register('starfield', function (layer, ctx, B) {
  var U = Bagel.util;
  var cv = U.el('canvas', { 'class': 'sf', 'aria-hidden': 'true' }, layer);
  var g = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = layer.clientWidth; H = layer.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  resize(); window.addEventListener('resize', resize);

  var R = U.rng(2004), stars = [];
  for (var i = 0; i < 190; i++) {
    var d = R();
    stars.push({ x: R(), y: R(), k: d < 0.55 ? 0.35 : d < 0.85 ? 0.7 : 1.15, r: d < 0.55 ? 0.7 : d < 0.85 ? 1 : 1.5, a: 0.35 + R() * 0.65, tw: R() * 6.28 });
  }
  /* signed scroll speed over the timeline, integrated once into a table */
  function speed(p) {
    var pre = 0.28 + 0.35 * U.seg(p, B.years[0], B.years[0] + 0.03) * (1 - U.seg(p, B.years[1] - 0.02, B.years[1] + 0.04));
    var sink = -(0.3 + 3.4 * U.ease.inout(U.seg(p, B.sink[0] + 0.01, B.sink[0] + 0.1))) * (1 - U.seg(p, B.burn[1] - 0.02, B.trail[0] + 0.05));
    return U.lerp(pre, sink, U.seg(p, B.sink[0] - 0.02, B.sink[0] + 0.01));
  }
  var N = 1000, table = new Float32Array(N + 1), acc = 0;
  for (i = 1; i <= N; i++) { acc += speed(i / N) / N; table[i] = acc; }
  function S(p) { var f = U.clamp(p) * N, i0 = Math.floor(f), i1 = Math.min(N, i0 + 1); return U.lerp(table[i0], table[i1], f - i0); }

  var unsub = ctx.timeline.subscribe(function (p, t) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    var sc = S(p), v = speed(p), calm = ctx.reducedMotion();
    var streak = calm ? 0 : Math.min(120, Math.abs(v) * 26);
    g.lineCap = 'round';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = (((s.y * H + sc * H * s.k * 0.9) % H) + H) % H;
      var a = s.a * (0.8 + 0.2 * Math.sin(t * 1.3 + s.tw));
      g.strokeStyle = 'rgba(234,242,255,' + a.toFixed(3) + ')';
      g.lineWidth = s.r;
      g.beginPath();
      var len = streak * s.k;
      g.moveTo(s.x * W, y);
      g.lineTo(s.x * W, y + (v >= 0 ? -len : len) * 0.5 - (len ? 0 : -0.01));
      g.stroke();
    }
    /* burning: the sky behind goes warm at the bottom */
    var heat = U.seg(p, B.burn[0], B.burn[0] + 0.08) * (1 - U.seg(p, B.burn[1], B.trail[0] + 0.04));
    if (heat > 0.001) {
      var gr = g.createLinearGradient(0, H, 0, H * 0.3);
      gr.addColorStop(0, 'rgba(255,100,40,' + (0.28 * heat).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,100,40,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
  });
  return { destroy: function () { unsub(); window.removeEventListener('resize', resize); layer.innerHTML = ''; } };
});
