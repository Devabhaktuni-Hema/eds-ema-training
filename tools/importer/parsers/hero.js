/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-05
 *
 * Hero is a 1-column, 3-row block:
 *   - row 1: block name (added by createBlock)
 *   - row 2: background image(s) (optional)
 *   - row 3: title (heading), subheading, and CTA link(s) (optional)
 * Source instance has a grid with a text group (h1 + subheading + button-group)
 * and an image group (multiple cover-images).
 */
export default function parse(element, { document }) {
  // Background image(s): all images inside the hero.
  const images = Array.from(element.querySelectorAll('img'));

  // Text content: heading, subheading, and CTA links.
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  const subheading = element.querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.button-group a, a.button'),
  );

  const cells = [];

  // Row 2: background image(s) — only if present.
  if (images.length) {
    cells.push([images]);
  }

  // Row 3: text content in a single cell.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);

  // Empty-block guard: no heading and no subheading — nothing meaningful.
  if (!heading && !subheading && !ctaLinks.length && !images.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
