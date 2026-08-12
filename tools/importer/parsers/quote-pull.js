/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: quote-pull
 * Base block: quote (custom — not in library catalog; structure inferred from
 *   source HTML).
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: .text:has(blockquote)
 * Generated: 2026-08-07
 *
 * Block table structure: 1 column.
 *  - Row 1: block name (added by createBlock).
 *  - Row 2: single cell = the quotation text (from <blockquote>).
 *  There is no attribution on this page, so no attribution row is emitted.
 *
 * Source (AEM Core Component text block):
 *   `.text > .cmp-text > blockquote`
 *
 * IMPORTANT: extract ONLY the <blockquote>. On this page a sibling <h2>
 * ("The front") follows this block as a separate `.title` block and must NOT
 * be pulled in — it is default body content that stays in the page flow.
 * Targeting the <blockquote> directly (rather than the whole .text/.cmp-text
 * wrapper) guarantees the trailing heading is never captured even if the DOM
 * varies across pages.
 */
export default function parse(element, { document }) {
  // Extract only the quotation. Scope strictly to the blockquote so any
  // trailing heading/body content in or after this block is excluded.
  const quote = element.querySelector('blockquote');

  // Empty-block guard: no quotation → drop the wrapper, keep children.
  if (!quote || !quote.textContent.trim()) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // 1-column block: one row whose single cell holds the quotation element.
  cells.push([quote]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-pull', cells });
  element.replaceWith(block);
}
