/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: carousel-teaser
 * Base block: carousel
 * Source: https://wknd.site/us/en.html
 * Selectors: .carousel.cmp-carousel--hero, .carousel.panelcontainer.cmp-carousel--hero
 * Generated: 2026-08-06
 *
 * Block library structure (carousel): 2-column table.
 *  - Row 1: block name (added by createBlock).
 *  - Each subsequent row = one slide:
 *      cell 1 = image (mandatory),
 *      cell 2 = optional text (title / description / CTA).
 *
 * Source (AEM Core Component carousel of hero teasers): each
 * `.cmp-carousel__item` wraps a `.cmp-teaser` with:
 *   - `.cmp-teaser__title`         → slide heading (h2)
 *   - `.cmp-teaser__description`   → slide copy (div, may wrap a <p>)
 *   - `.cmp-teaser__action-link`   → single CTA link
 *   - `.cmp-teaser__image .cmp-image img` → the full-width slide image
 * Carousel chrome (`.cmp-carousel__actions` buttons and
 * `.cmp-carousel__indicators`) is intentionally excluded.
 */
export default function parse(element, { document }) {
  // Each slide is a .cmp-carousel__item. Fall back to teaser wrappers if the
  // carousel item markup differs on other pages.
  let items = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('.teaser, .cmp-teaser'));
  }

  const cells = [];

  items.forEach((item) => {
    // Image is mandatory for a slide (first cell, image only).
    const image = item.querySelector('.cmp-teaser__image img, .cmp-image img, img');
    if (!image) return;

    // Second cell: title, description and CTA (all optional individually).
    const textCell = [];

    const heading = item.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not(.cmp-image)');
    if (heading && !heading.querySelector('img')) textCell.push(heading);

    const description = item.querySelector('.cmp-teaser__description');
    if (description && description.textContent.trim()) {
      textCell.push(description);
    }

    // Single CTA per slide; collect any action links defensively.
    item.querySelectorAll('.cmp-teaser__action-link, a[href]').forEach((a) => {
      if (a.textContent.trim() && !textCell.includes(a)) textCell.push(a);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-teaser', cells });
  element.replaceWith(block);
}
