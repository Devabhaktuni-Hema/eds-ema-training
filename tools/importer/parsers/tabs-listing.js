/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: tabs-listing
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures.html
 * Selectors: .tabs.panelcontainer
 * Generated: 2026-08-07
 *
 * Block library structure (tabs): 2-column table, first row = block name.
 * Each subsequent row = one tab:
 *   cell 1 = tab label (mandatory), cell 2 = tab content (mandatory).
 *
 * Source (AEM Core Component tabs, filterable adventure listing):
 *   - `.cmp-tabs__tablist > li.cmp-tabs__tab` provides the ordered labels
 *     (All / Climbing / Cycling / Skiing / Surfing / Travel).
 *   - Each `.cmp-tabs__tabpanel` (direct child of `.cmp-tabs`) holds that tab's
 *     adventure grid: an `.image-list.list > ul.cmp-image-list` of
 *     `<li.cmp-image-list__item>` cards, each with:
 *       - `.cmp-image-list__item-image img`   → adventure image
 *       - `.cmp-image-list__item-title-link[href] > .cmp-image-list__item-title`
 *                                             → linked title (href to /us/en/adventures/*.html)
 *       - `.cmp-image-list__item-description` → description text
 *
 * This is a single self-contained listing block (David's model: no nested
 * blocks). Each tab's cards are emitted as INLINE content in the tab's content
 * cell — image + linked heading + description per card — rather than a nested
 * cards block. Card link hrefs are preserved on the promoted title heading.
 */
export default function parse(element, { document }) {
  const cmpTabs = element.querySelector('.cmp-tabs') || element;

  // Ordered tab labels.
  const labels = Array.from(cmpTabs.querySelectorAll('.cmp-tabs__tablist > li.cmp-tabs__tab'));

  // Only the panels that are direct children of the tabs container (panels do
  // not nest, but scope to avoid ever double-counting).
  let panels = Array.from(cmpTabs.querySelectorAll(':scope > .cmp-tabs__tabpanel'));
  if (panels.length === 0) {
    panels = Array.from(cmpTabs.querySelectorAll('.cmp-tabs__tabpanel'));
  }

  // Render one tab panel's adventure cards as inline content: for each card,
  // push the image, a linked title heading, and the description paragraph.
  const extractCards = (panel) => {
    if (!panel) return [];
    const out = [];
    const items = Array.from(panel.querySelectorAll('.cmp-image-list__item'));

    items.forEach((item) => {
      const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

      const titleEl = item.querySelector('.cmp-image-list__item-title');
      const titleLink = item.querySelector('.cmp-image-list__item-title-link');
      const href = titleLink
        ? titleLink.getAttribute('href')
        : (item.querySelector('.cmp-image-list__item-image-link, a[href]') || {}).getAttribute?.('href');

      const description = item.querySelector('.cmp-image-list__item-description');

      // Image (kept as plain image; the card destination is preserved on the
      // linked title below).
      if (image) out.push(image);

      // Linked title, promoted to a heading so it reads as a card title.
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
        out.push(heading);
      }

      // Description.
      if (description && description.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        out.push(p);
      }
    });

    return out;
  };

  const cells = [];
  const count = Math.max(labels.length, panels.length);

  for (let i = 0; i < count; i += 1) {
    const label = labels[i];
    const panel = panels[i];

    const labelText = label ? label.textContent.trim() : '';
    const content = extractCards(panel);

    // Both cells mandatory per block library; pad empties rather than skip.
    const labelCell = document.createElement('p');
    labelCell.textContent = labelText;

    cells.push([labelCell, content.length ? content : '']);
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-listing', cells });
  element.replaceWith(block);
}
