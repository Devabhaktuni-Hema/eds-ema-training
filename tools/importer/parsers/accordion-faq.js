/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: accordion-faq
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html
 * Selectors: .accordion.panelcontainer
 * Generated: 2026-08-07
 *
 * Block library structure (accordion): 2-column table, first row = block name.
 * Each subsequent row = one accordion item:
 *   cell 1 = title/label (mandatory), cell 2 = expandable content (mandatory).
 *
 * Source (AEM Core Component accordion):
 *   - `.cmp-accordion__item` — one per Q&A pair (7 on the FAQ page).
 *   - Question: `.cmp-accordion__header .cmp-accordion__button .cmp-accordion__title`
 *     text. The decorative `.cmp-accordion__icon` span is a sibling of the title,
 *     so reading the title span alone keeps the question plain-text and icon-free.
 *   - Answer: `.cmp-accordion__panel` wraps a container/`.cmp-text` with the body
 *     paragraphs. Some panels contain empty scaffolding (e.g. `<h3>&nbsp;</h3>`)
 *     that must be dropped.
 */
export default function parse(element, { document }) {
  const cmpAccordion = element.querySelector('.cmp-accordion') || element;

  const items = Array.from(cmpAccordion.querySelectorAll('.cmp-accordion__item'));

  // Extract the plain-text question, stripping any decorative icon span.
  const extractTitle = (item) => {
    const titleEl = item.querySelector('.cmp-accordion__title');
    if (titleEl) return titleEl.textContent.trim();
    // Fallback: read the button text but remove the icon span first.
    const button = item.querySelector('.cmp-accordion__button, .cmp-accordion__header button');
    if (button) {
      const clone = button.cloneNode(true);
      clone.querySelectorAll('.cmp-accordion__icon').forEach((icon) => icon.remove());
      return clone.textContent.trim();
    }
    return '';
  };

  // Pull the content-bearing nodes out of a panel, skipping empty scaffolding.
  const extractContent = (item) => {
    const panel = item.querySelector('.cmp-accordion__panel');
    if (!panel) return [];
    const body = panel.querySelector('.cmp-text') || panel;
    const out = [];

    body.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6, img').forEach((node) => {
      if (node.tagName === 'IMG') {
        out.push(node);
        return;
      }
      // Node wrapping only an image — push the image itself.
      if (node.querySelector && node.querySelector('img') && node.textContent.trim() === '') {
        node.querySelectorAll('img').forEach((im) => out.push(im));
        return;
      }
      // Skip empty text-only nodes (e.g. <h3>&nbsp;</h3>).
      if (node.textContent.replace(/ /g, ' ').trim() === '' && !node.querySelector('img')) return;
      out.push(node);
    });

    return out;
  };

  const cells = [];

  items.forEach((item) => {
    const titleText = extractTitle(item);
    const content = extractContent(item);

    // Title cell (mandatory) — plain text question.
    const titleCell = document.createElement('p');
    titleCell.textContent = titleText;

    // Both cells mandatory per block library; pad empty content rather than skip.
    cells.push([titleCell, content.length ? content : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
