/* Swift Observatory re-entry (MSP26NO03006): one unbroken flight. The craft stays fixed on screen; scroll is time and altitude. */
(function () {
  'use strict';
  var U = Bagel.util;

  /* stretches of the shared 0..1 timeline */
  var BEATS = {
    orbit:  [0.00, 0.12],
    years:  [0.12, 0.27],
    sees:   [0.27, 0.43],
    rescue: [0.43, 0.55],
    sink:   [0.55, 0.67],
    burn:   [0.67, 0.80],
    zone:   [0.79, 0.85],
    odds:   [0.85, 0.93],
    trail:  [0.93, 1.00]
  };

  window.Swift = {
    code: 'MSP26NO03006',
    beats: BEATS,
    weight: { codeKB: null, mediaKB: 0 },
    mount: function (container, ctx) {
      container.innerHTML = '';
      var order = ['starfield', 'earth', 'years', 'bursts', 'link', 'craft', 'zone', 'odds', 'trail', 'captions'];
      var mounted = [];
      order.forEach(function (name) {
        var layer = U.el('div', { 'class': 'layer ' + name }, container);
        layer.setAttribute('data-piece', name);
        mounted.push(Bagel.pieces[name](layer, ctx, BEATS));
      });
      return {
        destroy: function () {
          mounted.forEach(function (m) { m && m.destroy && m.destroy(); });
          ctx.destroy && ctx.destroy();
          container.innerHTML = '';
        }
      };
    }
  };
})();
