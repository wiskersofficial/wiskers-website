/* link: the rescue craft. It slides in from the dark, starts to spin before it can reach Swift, and tumbles away.
 * This follows the reporting (Reuters, CNN: LINK began spinning out of control soon after reaching space; attempt abandoned mid-August),
 * not the original plan, which showed it reaching Swift. Role: event along the path. Group: vector illustration, drawn in code. */
Bagel.register('link', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var wrap = el('div', { 'aria-hidden': 'true', 'data-gate': 'art', 'data-gate-group': 'link', 'data-gate-id': 'LINK craft', style: 'position:absolute;left:0;top:0;width:76px;height:52px;margin:-26px 0 0 -38px;will-change:transform,opacity' }, layer);
  var svg = el('svg', { viewBox: '0 0 76 52', width: 76, height: 52 }, wrap);
  el('path', { d: 'M4 20h22v12H4zM50 20h22v12H50z', fill: '#1C3166', stroke: '#EAF2FF', 'stroke-width': 1 }, svg);
  el('path', { d: 'M9 20v12M14 20v12M19 20v12M55 20v12M60 20v12M65 20v12', stroke: '#4F77C8', 'stroke-width': 0.8 }, svg);
  el('rect', { x: 26, y: 14, width: 24, height: 24, fill: '#EAF2FF', stroke: '#fff', 'stroke-width': 0.8 }, svg);
  el('path', { d: 'M26 26h-0M38 14v24', stroke: '#5C6F9A', 'stroke-opacity': 0.5 }, svg);
  el('circle', { cx: 38, cy: 26, r: 5, fill: '#0B1226', 'fill-opacity': 0.6 }, svg);
  var tag = el('div', { 'class': 'tag', 'data-gate': 'text', 'data-gate-group': 'link', 'data-gate-id': 'LINK label' }, layer);
  var spun = false;

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.rescue[0], b = B.rescue[1];
    var on = p > a - 0.02 && p < b + 0.03;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) { spun = false; return; }
    var q = U.seg(p, a, b);
    var W = layer.clientWidth, H = layer.clientHeight;
    var cx = W / 2, cy = H * 0.53;
    var enter = U.ease.out(U.seg(q, 0.0, 0.4));
    var away = U.ease.inout(U.seg(q, 0.5, 1));
    /* from the dark top right, in toward Swift, never arriving, then off to the top left */
    var x = U.lerp(W * 1.15, cx + W * 0.3, enter);
    var y = U.lerp(H * 0.06, cy - H * 0.1, enter);
    x = U.lerp(x, -W * 0.2, away); y = U.lerp(y, H * 0.47, away);
    var spin = U.seg(q, 0.3, 1);
    var ang = (ctx.reducedMotion() ? 0 : 1) * (900 * spin * spin * spin) + 12 * (1 - spin);
    var sz = U.lerp(0.55, 1, enter) * (1 - 0.25 * away);
    wrap.style.opacity = U.seg(q, 0, 0.12) * (1 - U.seg(q, 0.9, 1));
    wrap.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + ang.toFixed(1) + 'deg) scale(' + sz.toFixed(3) + ')';
    tag.style.opacity = U.seg(q, 0.12, 0.25) * (1 - U.seg(q, 0.85, 0.95));
    tag.textContent = q < 0.3 ? 'LINK · rescue craft' : 'LINK · spinning out of control';
    tag.style.transform = 'translate3d(' + Math.max(16, Math.min(W - 230, x - 70)).toFixed(1) + 'px,' + (y - 46).toFixed(1) + 'px,0)';
    if (spin > 0.02 && !spun) { spun = true; ctx.haptic.play('snap'); }
    if (spin < 0.005) spun = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
