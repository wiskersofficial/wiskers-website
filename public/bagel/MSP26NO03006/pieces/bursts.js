/* bursts: flashes on both sides as Swift flies through what it studied. Each flash glints on the craft; a label peels off and drifts away.
 * Categories are NASA's own list. No counts (outlets disagree). Role: events along the path. Group: drawn in code. */
Bagel.shared = Bagel.shared || {};
(function () {
  var START = 0.30, END = 0.46;                        /* kept in step with Swift.beats.sees */
  var EV = [
    { t: 0.06, side: 'l', y: 0.30, label: 'Gamma-ray burst' },
    { t: 0.20, side: 'r', y: 0.58, label: 'Active galaxy' },
    { t: 0.36, side: 'l', y: 0.62, label: 'X-ray flare' },
    { t: 0.52, side: 'r', y: 0.28, label: 'Supernova' },
    { t: 0.68, side: 'l', y: 0.40, label: 'Comet' },
    { t: 0.82, side: 'r', y: 0.50, label: 'Asteroid' }
  ];
  Bagel.shared.glint = function (p) {
    var q = Math.min(1, Math.max(0, (p - START) / (END - START)));
    if (p < START || p > END) return 0;
    var g = 0;
    EV.forEach(function (e) { var d = q - e.t; if (d >= 0 && d < 0.07) g = Math.max(g, (1 - d / 0.07) * 0.9); });
    return g;
  };
  Bagel.register('bursts', function (layer, ctx, B) {
    var U = Bagel.util, el = U.el;
    var evs = EV.map(function (e) {
      var d = el('div', { 'class': 'ev' }, layer);
      d.style.left = (e.side === 'l' ? 10 : 90) + '%'; d.style.top = (e.y * 100) + '%';
      var f = el('div', { 'class': 'flash' }, d);
      var rg = el('div', { 'class': 'ring' }, d);
      var l = el('div', { 'class': 'lab', text: e.label }, d);
      l.style.top = '16px'; if (e.side === 'l') l.style.left = '10px'; else l.style.right = '10px';
      return { d: d, f: f, rg: rg, l: l, e: e, fired: false };
    });
    var unsub = ctx.timeline.subscribe(function (p) {
      var on = p > START - 0.02 && p < END + 0.03;
      layer.style.visibility = on ? 'visible' : 'hidden';
      if (!on) { evs.forEach(function (v) { v.fired = false; }); return; }
      var q = (p - START) / (END - START);
      evs.forEach(function (v) {
        var s = U.clamp((q - v.e.t) / 0.2);
        var live = q >= v.e.t;
        var pop = live ? (s < 0.06 ? s / 0.06 : Math.pow(1 - s, 1.6)) : 0;
        v.f.style.opacity = pop;
        v.f.style.transform = 'scale(' + (0.35 + 1.2 * U.ease.out(s)) + ')';
        v.rg.style.opacity = live ? (1 - s) * 0.9 : 0;
        v.rg.style.transform = 'scale(' + (0.3 + 4.5 * U.ease.out(s)) + ')';
        var lab = U.seg(s, 0.05, 0.16) * (1 - U.seg(s, 0.7, 1));
        v.l.style.opacity = live ? lab : 0;
        v.l.style.transform = 'translate3d(' + ((v.e.side === 'l' ? -1 : 1) * s * 24) + 'px,' + (s * 70) + 'px,0)';
        if (live && s < 0.2 && !v.fired) { v.fired = true; ctx.haptic.play('tick'); }
        if (!live) v.fired = false;
      });
    });
    return { destroy: function () { unsub(); layer.innerHTML = ''; } };
  });
})();
