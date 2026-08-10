function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-teaser');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-teaser-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-teaser-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-teaser-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-teaser-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

// Auto-rotation interval (ms). WKND-style hero cycles roughly every 6s.
const AUTOPLAY_DELAY = 6000;

/**
 * Start auto-advancing the carousel and wire the pause/resume triggers.
 * Rotation pauses on hover/focus-within and when the tab is hidden, and
 * respects prefers-reduced-motion (no autoplay at all). The returned resetter
 * is called on manual navigation so the timer restarts from the new slide.
 * @param {Element} block the .carousel-teaser element
 * @returns {() => void} reset — restart the autoplay timer
 */
function startAutoplay(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;
  let paused = false;

  const advance = () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const run = () => {
    stop();
    if (paused || reduceMotion.matches || document.hidden) return;
    timer = setInterval(advance, AUTOPLAY_DELAY);
  };

  // Pause while the user is interacting (hover or keyboard focus inside).
  block.addEventListener('mouseenter', () => { paused = true; stop(); });
  block.addEventListener('mouseleave', () => { paused = false; run(); });
  block.addEventListener('focusin', () => { paused = true; stop(); });
  block.addEventListener('focusout', () => { paused = false; run(); });
  // Pause when the tab is backgrounded; resume on return.
  document.addEventListener('visibilitychange', run);
  reduceMotion.addEventListener('change', run);

  run();
  return run; // calling run() again restarts the interval from now
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-teaser-slide-indicators');
  if (!slideIndicators) return;

  // Kick off auto-rotation; resetAutoplay() restarts the timer after any
  // manual navigation so the full delay applies from the user's chosen slide.
  const resetAutoplay = startAutoplay(block);

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      resetAutoplay();
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    resetAutoplay();
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    resetAutoplay();
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-teaser-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-teaser-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-teaser-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-teaser-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-teaser-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-teaser-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-teaser-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-teaser-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-teaser-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-teaser-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
