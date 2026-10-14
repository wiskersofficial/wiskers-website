// Temporary, visible review map. Keep all references here so the next design
// pass can remove or change the map without touching the cat's route logic.
import './review-map.css';

const pages = [
  { selector: '.hero', id: 'page-1', number: '01', title: 'Welcome' },
  { selector: '#difference', id: 'page-2', number: '02', title: 'The difference' },
  { selector: '#try-it', id: 'page-3', number: '03', title: 'Try it' },
  { selector: '#approach', id: 'page-4', number: '04', title: 'Our approach' },
  { selector: '#contact', id: 'page-5', number: '05', title: 'Contact' },
];

const spots = [
  { selector: '#stage-hero', code: '1A', title: 'Cat shelf', status: 'live' },
  { selector: '.hero-copy h1', code: '1B', title: 'Headline', status: 'idea' },
  { selector: '#perch-bridge', code: '2A', title: 'Bridge', status: 'live', shape: 'thin' },
  { selector: '#cat-route-wall', code: '2B', title: 'Climb + slide wall', status: 'live', shape: 'wall' },
  { selector: '#perch-paw', code: '2C', title: 'PDF card', status: 'live' },
  { selector: '.tool-preview', code: '2D', title: 'Tool preview', status: 'idea' },
  { selector: '.select-shell', code: '3A', title: 'Question choice', status: 'idea' },
  { selector: '#perch-jump', code: '3B', title: 'Answer card', status: 'live' },
  { selector: '#perch-approach', code: '4A', title: 'Cat ledge', status: 'live' },
  { selector: '#perch-approach article:nth-child(1)', code: '4B', title: 'Find the question', status: 'idea' },
  { selector: '#perch-approach article:nth-child(2)', code: '4C', title: 'Make it interactive', status: 'idea' },
  { selector: '#perch-approach article:nth-child(3)', code: '4D', title: 'Put it to work', status: 'idea' },
  { selector: '#stage-contact', code: '5A', title: 'Snack ledge', status: 'live' },
  { selector: '.contact-panel', code: '5B', title: 'Contact panel', status: 'idea' },
];

const node = (tag, className, text) => {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
};

for (const page of pages) {
  const section = document.querySelector(page.selector);
  if (!section) continue;
  section.id ||= page.id;
  section.classList.add('review-page');
  section.dataset.reviewPage = page.number;
  section.insertAdjacentElement('afterbegin', node('span', 'review-page-label', `PAGE ${page.number} / ${page.title}`));
}

for (const spot of spots) {
  const target = document.querySelector(spot.selector);
  if (!target) continue;
  target.classList.add('review-spot', `review-spot--${spot.status}`);
  if (spot.shape) target.classList.add(`review-spot--${spot.shape}`);
  target.dataset.reviewRef = spot.code;
  const tag = node('span', 'review-spot-label', `${spot.code} · ${spot.title}`);
  tag.setAttribute('aria-hidden', 'true');
  target.append(tag);
}

const header = document.querySelector('.site-header');
if (header) {
  const map = node('nav', 'review-map', '');
  map.setAttribute('aria-label', 'Page review map');
  map.append(node('strong', 'review-map-title', 'SITE MAP / V1'));
  const links = node('div', 'review-map-links', '');
  for (const page of pages) {
    const link = node('a', '', `${page.number} ${page.title}`);
    link.href = `#${document.querySelector(page.selector)?.id || page.id}`;
    links.append(link);
  }
  map.append(links);
  const legend = node('div', 'review-map-legend', '');
  legend.append(node('span', 'review-map-key review-map-key--live', 'Current cat action'));
  legend.append(node('span', 'review-map-key review-map-key--idea', 'Possible next action'));
  map.append(legend);
  header.insertAdjacentElement('afterend', map);
}
