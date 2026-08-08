import { getMetadata } from '../../scripts/aem.js';

// Media query that indicates desktop width.
const isDesktop = window.matchMedia('(min-width: 900px)');

// Compact US flag (matches the source en-US locale indicator: 13 stripes +
// blue canton). Rendered ~20px wide beside the locale label.
const FLAG_US = `
<svg viewBox="0 0 76 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <rect width="76" height="40" fill="#b22234"/>
  <g fill="#fff">
    <rect y="3.08" width="76" height="3.08"/>
    <rect y="9.23" width="76" height="3.08"/>
    <rect y="15.38" width="76" height="3.08"/>
    <rect y="21.54" width="76" height="3.08"/>
    <rect y="27.69" width="76" height="3.08"/>
    <rect y="33.85" width="76" height="3.08"/>
  </g>
  <rect width="30.4" height="21.54" fill="#3c3b6e"/>
  <g fill="#fff">
    <circle cx="3" cy="2.6" r="1.1"/><circle cx="9" cy="2.6" r="1.1"/><circle cx="15" cy="2.6" r="1.1"/>
    <circle cx="21" cy="2.6" r="1.1"/><circle cx="27" cy="2.6" r="1.1"/>
    <circle cx="6" cy="6.4" r="1.1"/><circle cx="12" cy="6.4" r="1.1"/><circle cx="18" cy="6.4" r="1.1"/>
    <circle cx="24" cy="6.4" r="1.1"/>
    <circle cx="3" cy="10.2" r="1.1"/><circle cx="9" cy="10.2" r="1.1"/><circle cx="15" cy="10.2" r="1.1"/>
    <circle cx="21" cy="10.2" r="1.1"/><circle cx="27" cy="10.2" r="1.1"/>
    <circle cx="6" cy="14" r="1.1"/><circle cx="12" cy="14" r="1.1"/><circle cx="18" cy="14" r="1.1"/>
    <circle cx="24" cy="14" r="1.1"/>
    <circle cx="3" cy="17.8" r="1.1"/><circle cx="9" cy="17.8" r="1.1"/><circle cx="15" cy="17.8" r="1.1"/>
    <circle cx="21" cy="17.8" r="1.1"/><circle cx="27" cy="17.8" r="1.1"/>
  </g>
</svg>`;

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
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  // Flag + locale label (source shows a US flag before "EN-US").
  const flag = document.createElement('span');
  flag.className = 'nav-locale-flag';
  flag.innerHTML = FLAG_US;
  const label = document.createElement('span');
  label.className = 'nav-locale-label';
  label.textContent = current;
  toggle.append(flag, label);

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
 * Build the search widget: an always-visible light-grey box with a leading
 * magnifying-glass icon and a "SEARCH" placeholder input (matches the WKND
 * source). The form control is created here (not in the plain fragment) per
 * the nav content contract.
 * @returns {Element}
 */
function buildSearch() {
  const search = document.createElement('div');
  search.className = 'nav-search';

  const icon = document.createElement('span');
  icon.className = 'nav-search-icon';
  icon.setAttribute('aria-hidden', 'true');

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');

  search.append(icon, input);
  return search;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Resolve nav content path. `aem up` serves the local content folder at
  // /content/nav.plain.html; DA/EDS serves it at ${navMeta || '/nav'}.plain.html.
  // Try the environment's expected path first so neither logs a 404 on the
  // happy path, then fall back to the other.
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const isLocal = window.location.hostname === 'localhost';
  const candidates = isLocal
    ? ['/content/nav.plain.html', `${navPath}.plain.html`]
    : [`${navPath}.plain.html`, '/content/nav.plain.html'];
  let resp;
  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(candidates[i]);
    if (resp.ok) break;
  }
  if (!resp || !resp.ok) return;

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
