/* trail: the craft is gone; its streak stays across the screen and fades to a thin line. Role: exit.
 * Group: drawn in code (one gradient div scaled and faded, so it animates transform and opacity only). */
Bagel.register('trail', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var streak = el('div', { 'aria-hidden': 'true', style: 'position:absolute;left:50%;top:-10%;width:34px;height:130%;margin-left:-17px;transform-origin:50% 40%;will-change:transform,opacity;background:linear-gradient(to bottom, rgba(255,122,61,0) 0%, rgba(255,150,80,.55) 22%, rgba(255,210,170,.95) 46%, rgba(255,122,61,.5) 70%, rgba(255,122,61,0) 100%)' }, layer);
  var core = el('div', { 'aria-hidden': 'true', style: 'position:absolute;left:50%;top:-10%;width:2px;height:130%;margin-left:-1px;will-change:opacity;background:linear-gradient(to bottom, rgba(234,242,255,0), rgba(234,242,255,.9) 46%, rgba(234,242,255,0))' }, layer);
  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.burn[1] - 0.012, b = B.trail[1];
    var on = p > a && p <= b + 0.01;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    var born = U.ease.out(U.seg(p, a, B.trail[0] + 0.015));
    var fade = U.ease.inout(U.seg(p, B.trail[0] + 0.02, b));
    var rot = 5 - 2 * fade;
    streak.style.opacity = born * (1 - fade * 0.9);
    streak.style.transform = 'rotate(' + rot + 'deg) scale3d(' + (1 - 0.88 * fade) + ',' + (0.4 + 0.6 * born) + ',1)';
    core.style.opacity = born * (0.35 + 0.65 * fade);
    core.style.transform = 'rotate(' + rot + 'deg)';
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
