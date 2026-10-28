const slides = [...document.querySelectorAll('.deck-slide')];
const navLinks = [...document.querySelectorAll('.deck-nav a')];
const currentSlide = document.getElementById('current-slide');
const progressBar = document.getElementById('progress-bar');

if (slides.length) {
  const setActive = (slide) => {
    const number = slide.dataset.slide;
    if (currentSlide) currentSlide.textContent = number;
    for (const link of navLinks) {
      if (link.hash === `#${slide.id}`) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
      if (entry.isIntersecting && entry.intersectionRatio >= 0.38) setActive(entry.target);
    }
  }, { threshold: [0, 0.2, 0.38, 0.65], rootMargin: '-7% 0px -12% 0px' });

  slides.forEach((slide) => observer.observe(slide));
  const initial = slides.find((slide) => `#${slide.id}` === location.hash) || slides[0];
  setActive(initial);

  let ticking = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  window.addEventListener('hashchange', () => {
    const target = slides.find((slide) => `#${slide.id}` === location.hash);
    if (target) setActive(target);
  });
}
