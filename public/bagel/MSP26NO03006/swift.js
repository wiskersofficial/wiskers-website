/* Swift Observatory re-entry (MSP26NO03006): one unbroken flight. The craft stays fixed on screen; scroll is time and altitude. */
(function () {
  'use strict';
  var U = Bagel.util;

  /* stretches of the shared 0..1 timeline */
  var BEATS = {
    orbit:  [0.00, 0.14],
    years:  [0.14, 0.30],
    sees:   [0.30, 0.46],
    rescue: [0.46, 0.60],
    sink:   [0.60, 0.73],
    burn:   [0.73, 0.90],
    trail:  [0.90, 1.00]
  };

  window.Swift = {
    code: 'MSP26NO03006',
    beats: BEATS,
    weight: { codeKB: null, mediaKB: 0 },
    mount: function (container, ctx) {
      container.innerHTML = '';
      var order = ['starfield', 'earth', 'years', 'bursts', 'link', 'craft', 'groundtrack', 'trail', 'captions'];
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
