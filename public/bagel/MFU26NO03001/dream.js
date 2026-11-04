/* Dream (MFU26NO03001): assembles one piece per plan element. */
(function () {
  'use strict';
  var U = Bagel.util;

  /* where each beat sits on the shared 0..1 timeline */
  var BEATS = {
    title:   [0.00, 0.13],
    hero:    [0.13, 0.30],
    walls:   [0.30, 0.47],
    states:  [0.47, 0.61],
    backers: [0.61, 0.73],
    reveal:  [0.73, 0.93],
    close:   [0.93, 1.00]
  };

  window.Dream = {
    code: 'MFU26NO03001',
    beats: BEATS,
    /* declared weight (assumed until measured) */
    weight: { codeKB: null, mediaKB: 0 },
    mount: function (container, ctx) {
      container.innerHTML = '';
      var order = ['blueprint-bg', 'hero-17m', 'walls', 'states', 'backers', 'reveal', 'cash-accent', 'captions'];
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
