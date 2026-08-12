/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: cards
 * Base block: cards
 * Source: https://wknd.site/us/en.html
 * Selectors: .image-list.list
 * Generated: 2026-08-06
 *
 * Block library structure (cards): 2-column table.
 *  - Row 1: block name (added by createBlock).
 *  - Each subsequent row = one card:
 *      cell 1 = image/icon (mandatory),
 *      cell 2 = text (title as heading + description + optional CTA).
 *
 * Source (AEM Core Component image-list): a `.cmp-image-list` <ul> whose
 * `<li.cmp-image-list__item>` each wrap an `<article>` containing:
 *   - `.cmp-image-list__item-image-link > .cmp-image-list__item-image img` → card image
 *   - `.cmp-image-list__item-title-link > .cmp-image-list__item-title`     → title text (inside a link)
 *   - `.cmp-image-list__item-description`                                  → description text
 * Each item is fully linked (image + title share the same href). The title is
 * promoted to a heading and kept as a link so the card destination is
 * preserved.
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll(':scope > ul > li, li'));
  }

  const cells = [];

  items.forEach((item) => {
    // Cell 1: image (mandatory for a card row).
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');
    if (!image) return;

    // Cell 2: title + description.
    const textCell = [];

    const titleEl = item.querySelector('.cmp-image-list__item-title');
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const href = titleLink ? titleLink.getAttribute('href')
      : (item.querySelector('.cmp-image-list__item-image-link, a[href]') || {}).getAttribute?.('href');

    if (titleEl && titleEl.textContent.trim()) {
      const heading = document.createElement('h3');
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = titleEl.textContent.trim();
        heading.appendChild(link);
      } else {
        heading.textContent = titleEl.textContent.trim();
      }
      textCell.push(heading);
    }

    const description = item.querySelector('.cmp-image-list__item-description');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.push(p);
    }

    cells.push([image, textCell.length ? textCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
