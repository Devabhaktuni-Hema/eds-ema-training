/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: hero-banner
 * Base block: hero
 * Source: https://wknd.site/us/en.html
 * Selectors: .teaser.cmp-teaser--featured, .teaser.cmp-teaser--hero.cmp-teaser--imagebottom
 * Generated: 2026-08-06
 *
 * Block library structure (hero): 1 column, 3 rows.
 *  - Row 1: block name (added by createBlock).
 *  - Row 2: single cell = background image (optional).
 *  - Row 3: single cell = title (heading) + subheading + CTA (all optional).
 *
 * Source (AEM Core Component teaser). Two instances with the same inner
 * structure are handled:
 *   - Featured teaser (.cmp-teaser--featured): image-beside-text, includes a
 *     `.cmp-teaser__pretitle` ("Featured Article").
 *   - Hero banner (.cmp-teaser--hero.cmp-teaser--imagebottom): full-bleed, no
 *     pretitle.
 * Shared inner nodes:
 *   - `.cmp-teaser__image .cmp-image img` → hero image (row 2)
 *   - `.cmp-teaser__pretitle`             → optional eyebrow text (row 3)
 *   - `.cmp-teaser__title`                → heading (row 3)
 *   - `.cmp-teaser__description`          → body copy (row 3)
 *   - `.cmp-teaser__action-link`          → CTA link(s) (row 3)
 * NOTE: the imagebottom instance contains a nested <main> with unrelated
 * blocks (title + image-list). Extraction is scoped to `.cmp-teaser__content`
 * and `.cmp-teaser__image` so that nested content is never pulled in.
 */
export default function parse(element, { document }) {
  // Scope to this teaser's own content/image wrappers so nested blocks
  // (e.g. an adjacent image-list inside a following <main>) are excluded.
  const content = element.querySelector(':scope .cmp-teaser__content, .cmp-teaser__content');
  const imageWrap = element.querySelector(':scope .cmp-teaser__image, .cmp-teaser__image');

  // Row 2: background/hero image.
  const image = (imageWrap || element).querySelector('.cmp-image img, img');

  // Row 3 content, all optional.
  const scope = content || element;
  const pretitle = scope.querySelector('.cmp-teaser__pretitle');
  // Prefer the teaser title; fall back to a real heading element.
  // NOTE: do NOT use [class*="title"] — it would also match
  // `.cmp-teaser__pretitle` (substring "title"), and querySelector returns the
  // first match in document order, stealing the pretitle instead of the title.
  let heading = scope.querySelector('.cmp-teaser__title');
  if (!heading) heading = scope.querySelector('h1, h2, h3, h4');
  const description = scope.querySelector('.cmp-teaser__description, p:not(.cmp-teaser__pretitle)');
  const ctaLinks = Array.from(scope.querySelectorAll('.cmp-teaser__action-link, a[href]'));

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

  // Row 3: text cell holding all copy elements in one cell (1-column block).
  const contentCell = [];
  if (pretitle && pretitle.textContent.trim()) contentCell.push(pretitle);
  if (heading && !heading.querySelector('img')) contentCell.push(heading);
  if (description && description.textContent.trim() && description !== pretitle) {
    contentCell.push(description);
  }
  ctaLinks.forEach((a) => {
    if (a.textContent.trim() && !contentCell.includes(a)) contentCell.push(a);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
