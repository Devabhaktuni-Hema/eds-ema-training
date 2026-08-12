/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: hero-article
 * Base block: hero
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image
 * Generated: 2026-08-07
 *
 * Block library structure (hero): 1 column, 3 rows.
 *  - Row 1: block name (added by createBlock).
 *  - Row 2: single cell = background image (optional).
 *  - Row 3: single cell = title + subheading + CTA (all optional).
 *
 * This variant is an image-ONLY editorial lead photo: no overlaid heading,
 * subheading, or CTA. Source is an AEM Core Component image block:
 *   `.image > .cmp-image > img.cmp-image__image`
 * Only the lead image is emitted (row 2). No row 3 is produced because there
 * is no title/subheading/CTA content for this variant.
 */
export default function parse(element, { document }) {
  // Row 2: lead image. Prefer the AEM core-component image class, then any
  // image inside the .cmp-image wrapper, then any <img> as a final fallback.
  const image = element.querySelector('img.cmp-image__image, .cmp-image img, img');

  // Empty-block guard: without an image there is nothing to render.
  if (!image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // 1-column block: one row whose single cell holds the image element.
  cells.push([image]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
