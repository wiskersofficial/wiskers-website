/* Dream (MFU26NO03001): assembles one piece per plan element. */
(function () {
  'use strict';
  var U = Bagel.util;

  /* where each beat sits on the shared 0..1 timeline */
  var BEATS = {
    title:   [0.00, 0.20],
    hero:    [0.03, 0.20],     /* the tile arrives with the title, not after it */
    walls:   [0.20, 0.38],
    states:  [0.38, 0.50],
    backers: [0.50, 0.62],
    reveal:  [0.62, 0.90],
    close:   [0.90, 1.00]
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
