/* earth: the limb curving below the craft. It swells as Swift sinks and glows ember during the burn. Group: drawn in code (CSS). */
Bagel.register('earth', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var ball = el('div', { 'class': 'ball', 'aria-hidden': 'true' }, layer);
  var heat = el('div', { 'class': 'heat', 'aria-hidden': 'true' }, layer);
  ball.style.transformOrigin = heat.style.transformOrigin = '50% 0';
  /* altitude gauge: only the starting figure is reported (about 171 mi, CNN/AP); the descent itself is illustrated, so no other numbers */
  var gauge = el('div', { 'aria-hidden': 'true', style: 'position:absolute;right:22px;top:46svh;height:30svh;width:70px;opacity:0;will-change:opacity;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#EAF2FF' }, layer);
  el('div', { 'data-gate': 'text', 'data-gate-group': 'gauge', text: '171 mi', style: 'position:absolute;right:14px;top:-18px;white-space:nowrap;font-size:12px' }, gauge);
  el('div', { 'data-gate': 'text', 'data-gate-group': 'gauge', text: 'last reported', style: 'position:absolute;right:14px;top:-5px;white-space:nowrap;color:#7FB4FF;font-size:9.5px;transform:translateY(0)' }, gauge);
  el('div', { style: 'position:absolute;right:6px;top:14px;bottom:0;width:1px;background:rgba(234,242,255,.45)' }, gauge);
  for (var k = 0; k <= 8; k++) el('div', { style: 'position:absolute;right:2px;width:9px;height:1px;background:rgba(234,242,255,.45);top:' + (14 + k * (100 - 0) / 8 * 0.86) + '%' }, gauge);
  var mk = el('div', { style: 'position:absolute;right:0;top:14px;width:0;height:0;border-left:11px solid #FF7A3D;border-top:6px solid transparent;border-bottom:6px solid transparent;margin-top:-6px;margin-right:12px;will-change:transform' }, gauge);
  el('div', { 'data-gate': 'text', 'data-gate-group': 'gauge', text: 'atmosphere', style: 'position:absolute;right:14px;bottom:-16px;white-space:nowrap;color:#FF9A5C;font-size:9.5px' }, gauge);

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var sink = U.ease.inout(U.seg(p, B.sink[0], B.sink[1] + 0.02));
    var burn = U.seg(p, B.burn[0], B.burn[1]);
    var lift = sink * 30 + burn * 14;                         /* svh the limb rises */
    var sc = 1 + 0.55 * sink + 0.25 * burn;
    var drift = ctx.reducedMotion() ? 0 : Math.sin(t * 0.2) * 0.4;
    var tf = 'translate3d(0,' + (-lift + drift) + 'svh,0) scale(' + sc.toFixed(3) + ')';
    ball.style.transform = heat.style.transform = tf;
    heat.style.opacity = U.seg(p, B.burn[0], B.burn[0] + 0.1) * (1 - U.seg(p, B.burn[1] + 0.02, B.trail[0] + 0.07));
    var gIn = U.ease.out(U.seg(p, B.sink[0] - 0.005, B.sink[0] + 0.02)) * (1 - U.seg(p, B.sink[1] + 0.005, B.burn[0] + 0.03));
    gauge.style.opacity = gIn;
    mk.style.transform = 'translate3d(0,' + (U.ease.inout(U.seg(p, B.sink[0] + 0.01, B.sink[1] + 0.01)) * gauge.clientHeight * 0.78).toFixed(1) + 'px,0)';
    layer.style.visibility = 'visible';
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
