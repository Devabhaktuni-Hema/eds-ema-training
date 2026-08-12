/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: tabs-detail
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selectors: .tabs.panelcontainer
 * Generated: 2026-08-06
 *
 * Block library structure (tabs): 2-column table, first row = block name.
 * Each subsequent row = one tab:
 *   cell 1 = tab label (mandatory), cell 2 = tab content (mandatory).
 *
 * Source (AEM Core Component tabs):
 *   - `.cmp-tabs__tablist > li.cmp-tabs__tab` provides the ordered labels
 *     (Overview / Itinerary / What to Bring).
 *   - Each `.cmp-tabs__tabpanel` (direct children of `.cmp-tabs`) holds the
 *     matching content, wrapped in a content fragment. The meaningful body
 *     is `.cmp-contentfragment__elements`, which contains paragraphs, images,
 *     and lists interleaved with empty AEM grid `<div>`s that must be skipped.
 */
export default function parse(element, { document }) {
  const cmpTabs = element.querySelector('.cmp-tabs') || element;

  // Ordered tab labels.
  const labels = Array.from(cmpTabs.querySelectorAll('.cmp-tabs__tablist > li.cmp-tabs__tab'));

  // Only the panels that are direct children of the tabs container (avoid
  // any accidentally nested panels being counted twice).
  let panels = Array.from(cmpTabs.querySelectorAll(':scope > .cmp-tabs__tabpanel'));
  if (panels.length === 0) {
    panels = Array.from(cmpTabs.querySelectorAll('.cmp-tabs__tabpanel'));
  }

  // Pull the meaningful content out of a panel, skipping empty AEM grid
  // scaffolding and the redundant content-fragment title.
  const extractContent = (panel) => {
    if (!panel) return [];
    const body = panel.querySelector('.cmp-contentfragment__elements') || panel;
    const out = [];

    const isEmptyGrid = (el) => (
      el.classList && (el.classList.contains('aem-Grid') || el.classList.contains('aem-GridColumn'))
      && el.textContent.trim() === ''
      && !el.querySelector('img')
    );

    // Walk direct-ish descendants and collect content-bearing nodes:
    // headings, paragraphs, lists, and images.
    body.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6, img').forEach((node) => {
      // Skip the content-fragment title heading (h3.cmp-contentfragment__title)
      if (node.classList && node.classList.contains('cmp-contentfragment__title')) return;
      // Skip empty text nodes.
      if (node.tagName === 'IMG') {
        out.push(node);
        return;
      }
      if (node.querySelector && node.querySelector('img') && node.textContent.trim() === '') {
        // paragraph/div wrapping only an image — push the image itself
        node.querySelectorAll('img').forEach((im) => out.push(im));
        return;
      }
      if (node.textContent.trim() === '' && !node.querySelector('img')) return;
      // Avoid pushing a list's parent twice: only push top-level lists (not nested inside another collected node)
      out.push(node);
    });

    // De-duplicate: if an image was already pushed via its wrapper AND directly,
    // keep unique nodes only.
    const unique = [];
    out.forEach((n) => {
      if (n.tagName === 'IMG') {
        // avoid duplicate image already collected
        if (!unique.some((u) => u.tagName === 'IMG' && u.getAttribute('src') === n.getAttribute('src'))) {
          unique.push(n);
        }
      } else {
        unique.push(n);
      }
    });

    return unique;
  };

  const cells = [];
  const count = Math.max(labels.length, panels.length);

  for (let i = 0; i < count; i += 1) {
    const label = labels[i];
    const panel = panels[i];

    const labelText = label ? label.textContent.trim() : '';
    const content = extractContent(panel);

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
