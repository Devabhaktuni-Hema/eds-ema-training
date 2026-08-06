import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — prefer the migrated content path, fall back to /footer
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  let fragment = await loadFragment(footerPath);
  if (!fragment) {
    footerPath = '/footer';
    fragment = await loadFragment(footerPath);
  }
  if (!fragment) return;

  // resolve relative image paths (e.g. images/social-x.svg) against the footer folder
  const footerBase = new URL(`${footerPath}.plain.html`, window.location);
  fragment.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
      img.src = new URL(src, footerBase).href;
    }
  });

  // inline SVG icons so they inherit color from CSS (currentColor).
  // <img src="*.svg"> cannot inherit the parent text color, which would
  // render the icons black-on-black in the dark footer.
  await Promise.all([...fragment.querySelectorAll('img[src$=".svg"]')].map(async (img) => {
    try {
      const resp = await fetch(img.src);
      if (!resp.ok) return;
      const svgText = await resp.text();
      const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = svgDoc.querySelector('svg');
      if (!svg) return;
      svg.setAttribute('aria-hidden', 'true');
      if (img.alt) {
        const link = img.closest('a');
        if (link && !link.getAttribute('aria-label')) link.setAttribute('aria-label', img.alt);
      }
      img.replaceWith(svg);
    } catch (e) {
      // leave the <img> in place on failure
    }
  }));

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-columns';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // tag the sections: first = brand, the rest = link columns
  const sections = [...footer.children];
  sections.forEach((section, i) => {
    section.classList.add('footer-column');
    if (i === 0) {
      section.classList.add('footer-brand');
      const socialWrap = section.querySelector('p:last-of-type');
      if (socialWrap && socialWrap.querySelector('img')) {
        socialWrap.classList.add('footer-social');
      }
      const brandLink = section.querySelector('p:first-of-type a');
      if (brandLink) brandLink.classList.add('footer-brand-link');
    } else {
      section.classList.add('footer-links');
    }
  });

  block.append(footer);
}
