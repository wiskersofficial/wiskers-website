import {mountOpeningReveal} from './pitchdeck-opening.js';

export function mountLeadMagnet(section) {
  return mountOpeningReveal(section, {
    selector: '[data-reveal]', startDelay: 4800, interval: 950,
    onTime(elapsed, reduced) {
      for (const [name, at] of [['form-ready',700],['download-ready',1700],['followup-ready',2850],['settled',3900],['research-ready',4700]]) {
        section.classList.toggle(`lead-${name}`, reduced || elapsed >= at);
      }
    }
  });
}
