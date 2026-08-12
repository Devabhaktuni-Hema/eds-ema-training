/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: hero-listing
 * Base block: hero
 * Source: https://wknd.site/us/en/adventures.html
 * Selectors: .teaser.cmp-teaser--hero
 * Generated: 2026-08-07
 *
 * Block library structure (hero): 1 column, 3 rows.
 *  - Row 1: block name (added by createBlock).
 *  - Row 2: single cell = feature image (optional).
 *  - Row 3: single cell = title (heading) + description paragraph.
 *    This intro variant has NO call-to-action.
 *
 * Source (AEM Core Component teaser, hero variant):
 *   - `.cmp-teaser__image .cmp-image img` → content-width feature image (row 2)
 *   - `.cmp-teaser__title` (h2)           → heading (row 3)
 *   - `.cmp-teaser__description`          → body copy (row 3)
 * The teaser has no `.cmp-teaser__action-link`, so no CTA is emitted. Content
 * extraction is scoped to `.cmp-teaser__content` / `.cmp-teaser__image` so that
 * nothing outside this teaser is pulled in.
 */
export default function parse(element, { document }) {
  // Scope to this teaser's own content/image wrappers.
  const content = element.querySelector(':scope .cmp-teaser__content, .cmp-teaser__content');
  const imageWrap = element.querySelector(':scope .cmp-teaser__image, .cmp-teaser__image');

  // Row 2: feature image.
  const image = (imageWrap || element).querySelector('.cmp-image img, img');

  // Row 3: heading + description (no CTA for this variant).
  const scope = content || element;
  // Prefer the teaser title; fall back to a real heading element. Do NOT use
  // [class*="title"] — it would also match a pretitle (substring "title").
  let heading = scope.querySelector('.cmp-teaser__title');
  if (!heading) heading = scope.querySelector('h1, h2, h3, h4');
  const description = scope.querySelector('.cmp-teaser__description, p');

  // Empty-block guard: nothing meaningful to render.
  if (!image && !heading && !description) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell (only if present).
  if (image) {
    cells.push([image]);
  }

  // Row 3: text cell holding heading + description in one cell (1-column block).
  const contentCell = [];
  if (heading && !heading.querySelector('img')) contentCell.push(heading);
  if (description && description.textContent.trim() && description !== heading) {
    contentCell.push(description);
  }
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-listing', cells });
  element.replaceWith(block);
}
