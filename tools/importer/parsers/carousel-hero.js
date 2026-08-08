/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: carousel-hero
 * Base block: carousel
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selectors: .carousel.cmp-carousel--mini, .carousel.panelcontainer
 * Generated: 2026-08-06
 *
 * Block library structure (carousel): 2-column table.
 *  - Row 1: block name (added by createBlock).
 *  - Each subsequent row = one slide:
 *      cell 1 = image (mandatory),
 *      cell 2 = optional text (title / description / CTA).
 * Source (AEM Core Component carousel): each `.cmp-carousel__item` holds a
 * `.cmp-image img`. WKND slides are image-only, so text cells are omitted
 * when absent. Text extraction is included defensively for cross-page reuse.
 */
export default function parse(element, { document }) {
  // Each slide is a .cmp-carousel__item. Fall back to any nested image wrapper
  // if the item markup differs on other pages.
  let items = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('.cmp-image')).map((i) => i.closest('div') || i);
  }

  const cells = [];

  items.forEach((item) => {
    const image = item.querySelector('img');
    if (!image) return; // image is mandatory for a slide

    // Optional text content within the slide (excluding the image wrapper).
    // Only meaningful headings / paragraphs / CTA links, not carousel chrome.
    const textCell = [];
    const heading = item.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]:not(.cmp-image)');
    if (heading && !heading.querySelector('img')) textCell.push(heading);
    item.querySelectorAll(':scope p, :scope .cmp-text p').forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
    item.querySelectorAll('a[href]').forEach((a) => {
      // ignore carousel action buttons (they are <button>, not <a>)
      if (a.textContent.trim()) textCell.push(a);
    });

    if (textCell.length > 0) {
      cells.push([image, textCell]);
    } else {
      cells.push([image]);
    }
  });

  // Empty-block guard: if no slides with images were found, unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
