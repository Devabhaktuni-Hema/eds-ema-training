import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllDropdowns(navSections, except = null) {
  navSections.querySelectorAll('.nav-drop').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (navSections) closeAllDropdowns(navSections);
  }
}

/**
 * Toggles the mobile nav open/closed.
 * @param {Element} nav
 * @param {Element} navSections
 * @param {*} forceExpanded
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  if (expanded || isDesktop.matches) {
    if (navSections) closeAllDropdowns(navSections);
  }
}

/**
 * Wires up a nav item that has a sub-panel (megamenu or simple dropdown).
 * Hover opens on desktop; click toggles on all viewports.
 * @param {Element} navSection the top-level <li>
 * @param {Element} navSections the sections container
 */
function decorateDrop(navSection, navSections) {
  navSection.classList.add('nav-drop');
  navSection.setAttribute('aria-expanded', 'false');

  // label = the leading text node before the nested <ul>
  const submenu = navSection.querySelector(':scope > ul');
  if (!submenu) return;

  // wrap the leading label text in a button-like span for styling/interaction
  const label = document.createElement('span');
  label.className = 'nav-drop-label';
  // move all nodes before the submenu into the label
  const nodes = [...navSection.childNodes];
  nodes.forEach((n) => {
    if (n === submenu) return;
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) return;
    label.append(n);
  });
  navSection.prepend(label);

  // classify the submenu: megamenu if any child <li> has its own <ul>
  const isMega = [...submenu.children].some((li) => li.querySelector(':scope > ul') || li.querySelector(':scope > h3'));
  submenu.classList.add(isMega ? 'nav-megamenu' : 'nav-dropdown');
  if (isMega) {
    // tag column headings (leading text of each column li) and featured card
    [...submenu.children].forEach((li) => {
      const colSub = li.querySelector(':scope > ul');
      if (colSub) {
        li.classList.add('nav-mega-col');
        // wrap the leading text (column heading) in a span
        const heading = document.createElement('span');
        heading.className = 'nav-mega-col-heading';
        [...li.childNodes].forEach((n) => {
          if (n === colSub) return;
          if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) return;
          heading.append(n);
        });
        if (heading.textContent.trim()) li.prepend(heading);
      } else if (li.querySelector(':scope > h3')) {
        li.classList.add('nav-mega-featured');
      }
    });
  }

  const toggle = () => {
    const open = navSection.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns(navSections, navSection);
    navSection.setAttribute('aria-expanded', open ? 'false' : 'true');
  };

  label.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // desktop hover
  navSection.addEventListener('mouseenter', () => {
    if (isDesktop.matches) {
      closeAllDropdowns(navSections, navSection);
      navSection.setAttribute('aria-expanded', 'true');
    }
  });
  navSection.addEventListener('mouseleave', () => {
    if (isDesktop.matches) navSection.setAttribute('aria-expanded', 'false');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — prefer the migrated content path, fall back to /nav
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  let fragment = await loadFragment(navPath);
  if (!fragment) {
    navPath = '/nav';
    fragment = await loadFragment(navPath);
  }
  if (!fragment) return;

  // resolve relative image paths (e.g. images/nav-logo.svg) against the nav folder
  const navBase = new URL(`${navPath}.plain.html`, window.location);
  fragment.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
      img.src = new URL(src, navBase).href;
    }
  });

  // inline SVG icons so they inherit color from CSS (currentColor)
  await Promise.all([...fragment.querySelectorAll('img[src$=".svg"]')].map(async (img) => {
    try {
      const resp = await fetch(img.src);
      if (!resp.ok) return;
      const svgDoc = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
      const svg = svgDoc.querySelector('svg');
      if (!svg) return;
      svg.setAttribute('aria-hidden', 'true');
      img.replaceWith(svg);
    } catch (e) {
      // leave the <img> in place on failure
    }
  }));

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: strip button classes from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = 'nav-brand-link';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
    }
  }

  // sections: wire up dropdowns / megamenus
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector(':scope > ul')) {
        decorateDrop(navSection, navSections);
      }
    });
  }

  // tools: style the Subscribe CTA
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const cta = navTools.querySelector('a');
    if (cta) cta.classList.add('nav-cta');
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close open dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (navSections && !nav.contains(e.target)) closeAllDropdowns(navSections);
  });
  window.addEventListener('keydown', closeOnEscape);

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, isDesktop.matches);
    if (navSections) closeAllDropdowns(navSections);
  });
  toggleMenu(nav, navSections, isDesktop.matches);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
