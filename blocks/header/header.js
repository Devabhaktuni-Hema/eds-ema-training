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

// Simple flags for the other locale countries (viewBox 0 0 3 2), rendered in
// the language dropdown next to each country group.
const FLAG_CA = '<svg viewBox="0 0 6 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="6" height="3" fill="#fff"/><rect width="1.5" height="3" fill="#d52b1e"/><rect x="4.5" width="1.5" height="3" fill="#d52b1e"/><path fill="#d52b1e" d="M3 1.15l.12.28.3-.06-.14.27.24.19-.3.06.02.3-.24-.18-.24.18.02-.3-.3-.06.24-.19-.14-.27.3.06z"/></svg>';
const FLAG_CH = '<svg viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="3" height="3" fill="#d52b1e"/><rect x="1.25" y="0.6" width="0.5" height="1.8" fill="#fff"/><rect x="0.6" y="1.25" width="1.8" height="0.5" fill="#fff"/></svg>';
const FLAG_DE = '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="3" height="2" y="0" fill="#000"/><rect width="3" height="1.333" y="0.667" fill="#d00"/><rect width="3" height="0.667" y="1.333" fill="#ffce00"/></svg>';
const FLAG_FR = '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="1" height="2" x="0" fill="#002395"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ed2939"/></svg>';
const FLAG_ES = '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>';
const FLAG_IT = '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="1" height="2" x="0" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ce2b37"/></svg>';

// Map a URL country segment (/us/…, /ca/…) to its display name + flag SVG.
const COUNTRIES = {
  us: { name: 'United States', flag: FLAG_US },
  ca: { name: 'Canada', flag: FLAG_CA },
  ch: { name: 'Switzerland', flag: FLAG_CH },
  de: { name: 'Germany', flag: FLAG_DE },
  fr: { name: 'France', flag: FLAG_FR },
  es: { name: 'Spain', flag: FLAG_ES },
  it: { name: 'Italy', flag: FLAG_IT },
};

/**
 * Group flat locale links by their URL country segment, preserving first-seen
 * order. Returns [{ code, name, flag, locales: [{label, href}] }].
 * @param {HTMLAnchorElement[]} links
 */
function groupLocalesByCountry(links) {
  const groups = [];
  const byCode = new Map();
  links.forEach((a) => {
    const code = (new URL(a.href, window.location).pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
    const meta = COUNTRIES[code] || { name: code.toUpperCase(), flag: '' };
    let group = byCode.get(code);
    if (!group) {
      group = {
        code, name: meta.name, flag: meta.flag, locales: [],
      };
      byCode.set(code, group);
      groups.push(group);
    }
    group.locales.push({ label: a.textContent.trim(), href: a.getAttribute('href') });
  });
  return groups;
}

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
  // State lives in data-expanded (a plain <div> can't carry aria-expanded —
  // that belongs on the toggle button below). Used only as a CSS hook.
  wrapper.dataset.expanded = 'false';

  const links = [...localeList.querySelectorAll('a')];
  const current = links[0] ? links[0].textContent.trim() : 'en-US';
  const currentCountry = COUNTRIES[
    (new URL(links[0]?.href || '/us/en', window.location).pathname.split('/').filter(Boolean)[0] || 'us').toLowerCase()
  ] || COUNTRIES.us;

  // --- Toggle: current country's flag + locale label + caret ---
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-locale-toggle';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  const flag = document.createElement('span');
  flag.className = 'nav-locale-flag';
  flag.innerHTML = currentCountry.flag;
  const label = document.createElement('span');
  label.className = 'nav-locale-label';
  label.textContent = current;
  toggle.append(flag, label);

  // --- Dropdown: country groups (flag + name + locale codes) ---
  const panel = document.createElement('div');
  panel.className = 'nav-locale-list';
  groupLocalesByCountry(links).forEach((group) => {
    const row = document.createElement('div');
    row.className = 'nav-locale-country';

    const groupFlag = document.createElement('span');
    groupFlag.className = 'nav-locale-country-flag';
    groupFlag.innerHTML = group.flag;

    const body = document.createElement('div');
    body.className = 'nav-locale-country-body';
    const name = document.createElement('span');
    name.className = 'nav-locale-country-name';
    name.textContent = group.name;

    const codes = document.createElement('div');
    codes.className = 'nav-locale-codes';
    group.locales.forEach((loc) => {
      const a = document.createElement('a');
      a.href = loc.href;
      a.textContent = loc.label;
      if (loc.label === current) a.setAttribute('aria-current', 'true');
      codes.append(a);
    });

    body.append(name, codes);
    row.append(groupFlag, body);
    panel.append(row);
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrapper.dataset.expanded === 'true';
    wrapper.dataset.expanded = open ? 'false' : 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  wrapper.append(toggle, panel);
  return wrapper;
}

/**
 * Build the search widget: an always-visible light-grey box with a leading
 * magnifying-glass icon and a "Search" placeholder input (matches the WKND
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

  // --- Utility bar (Sign In + locale) ---
  // Full-width dark band (a direct child of the wrapper, not inside the
  // centered nav) so it spans the content width without a scrollbar-unsafe
  // `vw` breakout. Its inner content is centered to the same content edge.
  const utilityBar = document.createElement('div');
  utilityBar.className = 'nav-utility-bar';
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  utilityBar.append(utility);
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

  // Highlight the nav item for the current page (source: active link gets the
  // yellow box + aria-current). Normalise both sides to a bare locale path
  // (drop /content prefix, .html, trailing slash) so a nav link to
  // /us/en/magazine matches whether we're on /content/us/en/magazine or the
  // clean preview path, and any child page under it (e.g. an article) keeps
  // its section highlighted.
  const normalizePath = (p) => p
    .replace(/^\/content/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '') || '/';
  const here = normalizePath(window.location.pathname);
  navSections.querySelectorAll('a[href]').forEach((a) => {
    const target = normalizePath(new URL(a.href, window.location).pathname);
    if (target !== '/' && (here === target || here.startsWith(`${target}/`))) {
      a.setAttribute('aria-current', 'page');
    }
  });

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

  nav.append(brand, tools, hamburger);

  // Close locale dropdown on outside click; escape collapses the mobile menu.
  document.addEventListener('click', () => {
    const locale = nav.querySelector('.nav-locale');
    if (locale) {
      locale.dataset.expanded = 'false';
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
  navWrapper.append(utilityBar, nav);
  block.append(navWrapper);

  // Shrink-on-scroll: the source collapses the fixed header (~194px → ~114px)
  // once the page is scrolled a little, and expands it again at the top.
  // Toggle a class on the <header> past a small threshold (source: ~16-20px);
  // the CSS animates the height/padding change.
  const headerEl = block.closest('header') || document.querySelector('header');
  if (headerEl) {
    const SHRINK_AT = 16;
    let ticking = false;
    const updateScrolled = () => {
      headerEl.classList.toggle('nav-scrolled', window.scrollY > SHRINK_AT);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrolled);
      }
    }, { passive: true });
    updateScrolled();
  }
}
