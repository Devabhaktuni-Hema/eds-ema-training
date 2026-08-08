import { getMetadata } from '../../scripts/aem.js';

// Media query that indicates desktop width.
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapse the mobile menu / reset the hamburger label.
 * @param {Element} nav
 */
function closeMenu(nav) {
  nav.setAttribute('aria-expanded', 'false');
  const hamburgerBtn = nav.querySelector('.nav-hamburger button');
  if (hamburgerBtn) hamburgerBtn.setAttribute('aria-label', 'Open navigation');
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav
 */
function toggleMenu(nav) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const hamburgerBtn = nav.querySelector('.nav-hamburger button');
  if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * Build the locale toggle + dropdown from a plain <ul> of locale links.
 * @param {Element} localeList the <ul> of locale <a> elements
 * @returns {Element} the locale widget
 */
function buildLocale(localeList) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';
  wrapper.setAttribute('aria-expanded', 'false');

  const links = [...localeList.querySelectorAll('a')];
  const current = links[0] ? links[0].textContent.trim() : 'en-US';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-locale-toggle';
  toggle.textContent = current;
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');

  localeList.className = 'nav-locale-list';

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrapper.getAttribute('aria-expanded') === 'true';
    wrapper.setAttribute('aria-expanded', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  wrapper.append(toggle, localeList);
  return wrapper;
}

/**
 * Build the search widget: a magnifying-glass icon button that expands to
 * reveal the input on click (collapses when it loses focus / on Escape).
 * The form control is created here (not in the plain fragment) per the nav
 * content contract.
 * @returns {Element}
 */
function buildSearch() {
  const search = document.createElement('div');
  search.className = 'nav-search';
  search.setAttribute('aria-expanded', 'false');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Search');
  toggle.innerHTML = '<span class="nav-search-icon"></span>';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');

  const open = () => {
    search.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    input.focus();
  };
  const close = () => {
    search.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (search.getAttribute('aria-expanded') === 'true') close();
    else open();
  });
  // Keep open while interacting with the input; collapse when empty and blurred.
  input.addEventListener('blur', () => {
    if (!input.value) close();
  });
  input.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') { close(); toggle.focus(); }
  });

  search.append(toggle, input);
  return search;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Resolve nav content path: localhost/aem up serves /content/nav.plain.html;
  // DA/EDS serves ${navMeta}.plain.html.
  const navMeta = getMetadata('nav');
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return;

  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  // Nav images use relative paths (per the nav content contract). Resolve them
  // to the /content/images location where they are actually served, so they
  // don't resolve against the current page path (e.g. /content/us/en/images/...).
  fragment.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

  const sections = [...fragment.children];

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');

  // Section 0 = brand/logo, 1 = primary nav links, 2 = utility (Sign In + locales)
  const [brandSection, navSection, utilSection] = sections;

  // --- Utility area (Sign In + locale) ---
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  if (utilSection) {
    const signIn = utilSection.querySelector('p a');
    if (signIn) {
      signIn.classList.add('nav-signin');
      utility.append(signIn);
    }
    const localeList = utilSection.querySelector('ul');
    if (localeList) utility.append(buildLocale(localeList));
  }

  // --- Brand ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) brand.append(...brandSection.childNodes);

  // --- Tools: primary nav + search ---
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (navSection) navSections.append(...navSection.childNodes);
  tools.append(navSections, buildSearch());

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.type = 'button';
  hamburgerBtn.setAttribute('aria-controls', 'nav');
  hamburgerBtn.setAttribute('aria-label', 'Open navigation');
  hamburgerBtn.innerHTML = '<span></span>';
  hamburgerBtn.addEventListener('click', () => toggleMenu(nav));
  hamburger.append(hamburgerBtn);

  nav.append(utility, brand, tools, hamburger);

  // Close locale dropdown on outside click; escape collapses the mobile menu.
  document.addEventListener('click', () => {
    const locale = nav.querySelector('.nav-locale');
    if (locale) {
      locale.setAttribute('aria-expanded', 'false');
      const t = locale.querySelector('.nav-locale-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeMenu(nav);
  });

  // Reset state when crossing the desktop/mobile breakpoint without a reload.
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'true');
    } else {
      closeMenu(nav);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
