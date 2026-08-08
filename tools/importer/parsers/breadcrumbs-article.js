/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: breadcrumbs-article
 * Base block: breadcrumbs (custom — not in library catalog; structure inferred
 *   from source HTML).
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: .breadcrumb
 * Generated: 2026-08-07
 *
 * Block table structure: 1 column.
 *  - Row 1: block name (added by createBlock).
 *  - Rows 2..n: one row per breadcrumb crumb, in trail order.
 *      - Link crumbs keep their <a> element (href + label preserved).
 *      - The final/current crumb (li.cmp-breadcrumb__item--active, no link) is
 *        emitted as plain text.
 *
 * Source (AEM Core Component breadcrumb):
 *   `nav.cmp-breadcrumb > ol.cmp-breadcrumb__list > li.cmp-breadcrumb__item`
 *   - Each non-active <li> wraps `a.cmp-breadcrumb__item-link > span`.
 *   - The active <li> has class `cmp-breadcrumb__item--active` and only a
 *     `<span>` (no anchor). Each <li> also contains an empty <meta> tag which
 *     carries no text and is ignored.
 */
export default function parse(element, { document }) {
  // Collect crumbs in document (trail) order. Fall back to any <li> if the
  // core-component class is absent on other pages.
  const items = Array.from(
    element.querySelectorAll('li.cmp-breadcrumb__item, nav ol > li'),
  );

  const cells = [];

  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    if (link && link.textContent.trim()) {
      // Link crumb — keep the anchor so href + label are preserved.
      cells.push([link]);
    } else {
      // Current/active crumb — plain-text label (strip empty <meta>, spans).
      const label = li.textContent.trim();
      if (label) cells.push([label]);
    }
  });

  // Empty-block guard: no crumbs found → drop the wrapper, keep children.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'breadcrumbs-article',
    cells,
  });
  element.replaceWith(block);
}
