const applications = {
  introduce: { title: 'Introduce a new offer', copy: 'Give prospects a clear first look at what you offer, who it is for, and how it could fit their business.' },
  explain: { title: 'Explain a complex offer', copy: 'Make a layered product, service, or approach easier to explore, so prospects can focus on what matters to their situation.' },
  compare: { title: 'Help prospects compare options', copy: 'Show how different products, service levels, or approaches differ, and let prospects explore what each means for them.' },
};
const approaches = {
  focused: { title: 'A focused introduction', copy: 'Your experience centres on one offer: a clear introduction, a relevant use case, and details prospects can open at their own pace.' },
  deeper: { title: 'A deeper exploration', copy: 'Your experience connects several parts of an offer: topics to explore, approaches to compare, and an optional question that gives the conversation more context.' },
};

/** Demo activity stays in memory. Exposure and deliberate choices remain separate. */
export function mountExperience(root) {
  const demo = root?.querySelector('[data-experience]');
  if (!demo) return () => {};
  const page = demo.querySelector('[data-prospect-page]');
  const activity = demo.querySelector('[data-activity]');
  const exposure = demo.querySelector('[data-exposure]');
  const conversation = demo.querySelector('[data-conversation]');
  const announcement = demo.querySelector('[data-activity-announcement]');
  const cleanups = [];
  const actions = new Map();
  const viewed = new Set();
  let approach = null;
  let priority = null;
  let application = null;
  let observer;
  const listen = (element, event, handler) => {
    element.addEventListener(event, handler);
    cleanups.push(() => element.removeEventListener(event, handler));
  };
  function render() {
    activity.replaceChildren();
    for (const { verb, text } of actions.values()) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = verb;
      const content = document.createElement('p');
      content.textContent = text;
      content.setAttribute('data-v6-warp', '');
      item.append(label, content);
      activity.append(item);
    }
    demo.querySelector('[data-activity-empty]').hidden = actions.size > 0;
    const facts = [];
    if (application) facts.push(`You explored “${applications[application].title}”.`);
    if (actions.has('compare')) facts.push('You compared the two approaches.');
    if (approach) facts.push(`You selected “${approaches[approach].title}”.`);
    if (priority) facts.push(`You chose “${priority}” as what matters most.`);
    let question = '';
    if (priority === 'Clarity of the offer') question = 'Ask which part of the offer needs a clearer explanation.';
    else if (priority === 'Better-fit prospects') question = 'Ask what a good-fit prospect looks like for your business.';
    else if (priority === 'Better conversations') question = 'Ask what your team would like to know before a first conversation.';
    else if (approach === 'deeper') question = 'Ask which topics and options your prospects need to explore.';
    else if (approach === 'focused') question = 'Ask which offer you would like to introduce.';
    else if (application) question = 'Ask how that application could fit your offer.';
    else if (actions.size) question = 'Ask what you would like to explore further.';
    conversation.textContent = facts.length ? `${facts.join(' ')} ${question}` : actions.size ? `You opened details about ${[...actions.values()].filter(a => a.verb === 'Opened').map(a => a.text.toLowerCase()).join(' and ') || 'the approaches'}. ${question}` : 'Make a choice in the experience to see what it could add to a conversation.';
    demo.classList.toggle('has-activity', actions.size > 0);
  }
  function record(key, verb, text) {
    const previous = actions.get(key);
    if (previous?.text === text) return;
    actions.set(key, { verb, text });
    render();
    announcement.textContent = `${verb}: ${text}`;
  }
  function markViewed(section) {
    const label = section.dataset.experienceSection;
    if (viewed.has(label)) return;
    viewed.add(label);
    const item = document.createElement('li');
    item.textContent = label;
    exposure.append(item);
  }
  function observeSections() {
    observer?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    // Each short heading, rather than a potentially tall section, must be visible
    // inside both the scroll pane and the browser viewport before it is recorded.
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && document.visibilityState === 'visible') markViewed(entry.target.closest('[data-experience-section]'));
      }
    }, { threshold: [0.5] });
    demo.querySelectorAll('[data-experience-section] > .v6-demo-label').forEach(label => observer.observe(label));
  }
  demo.querySelectorAll('.v6-demo-nav a').forEach(link => listen(link, 'click', event => {
    event.preventDefault();
    const target = demo.querySelector(link.getAttribute('href'));
    page.scrollTo({ top: target.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));
  demo.querySelectorAll('[data-application]').forEach(button => listen(button, 'click', () => {
    application = button.dataset.application;
    demo.querySelectorAll('[data-application]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    demo.querySelector('[data-application-title]').textContent = applications[application].title;
    demo.querySelector('[data-application-copy]').textContent = applications[application].copy;
    demo.querySelector('[data-offer-preview]').dataset.applicationState = application;
    record('application', 'Explored', applications[application].title);
  }));
  demo.querySelectorAll('[data-experience-detail]').forEach(detail => listen(detail, 'toggle', () => {
    if (detail.open) record(`detail-${detail.dataset.experienceDetail}`, 'Opened', detail.dataset.experienceDetail);
  }));
  const compareButton = demo.querySelector('[data-compare-toggle]');
  const comparison = demo.querySelector('#experience-comparison');
  listen(compareButton, 'click', () => {
    const open = compareButton.getAttribute('aria-expanded') !== 'true';
    compareButton.setAttribute('aria-expanded', String(open));
    comparison.hidden = !open;
    if (open) record('compare', 'Compared', 'A focused introduction and a deeper exploration');
  });
  demo.querySelectorAll('[name="experience-approach"]').forEach(input => listen(input, 'change', () => {
    if (!input.checked) return;
    approach = input.value;
    demo.querySelector('[data-tailored-title]').textContent = approaches[approach].title;
    demo.querySelector('[data-tailored-copy]').textContent = approaches[approach].copy;
    demo.querySelector('[data-tailored-preview]').hidden = false;
    record('approach', 'Selected', approaches[approach].title);
  }));
  demo.querySelectorAll('[name="experience-priority"]').forEach(input => listen(input, 'change', () => {
    if (!input.checked) return;
    priority = input.value;
    record('priority', 'Answered', `What matters most? “${priority}”`);
  }));
  listen(demo.querySelector('[data-experience-reset]'), 'click', () => {
    actions.clear(); viewed.clear(); approach = null; priority = null; application = null;
    exposure.replaceChildren();
    demo.querySelectorAll('input').forEach(input => { input.checked = false; });
    demo.querySelectorAll('details').forEach(detail => { detail.open = false; });
    demo.querySelectorAll('[data-application]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.application === 'introduce')));
    demo.querySelector('[data-application-title]').textContent = applications.introduce.title;
    demo.querySelector('[data-application-copy]').textContent = applications.introduce.copy;
    demo.querySelector('[data-offer-preview]').dataset.applicationState = 'introduce';
    demo.querySelector('[data-tailored-preview]').hidden = true;
    comparison.hidden = true;
    compareButton.setAttribute('aria-expanded', 'false');
    page.scrollTo({ top: 0, behavior: 'instant' });
    render(); observeSections();
    announcement.textContent = 'Demo reset. Explore again to see a new activity record.';
  });
  render(); observeSections();
  return () => { observer?.disconnect(); cleanups.forEach(cleanup => cleanup()); };
}
