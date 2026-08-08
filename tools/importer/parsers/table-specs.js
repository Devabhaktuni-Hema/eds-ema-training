/* eslint-disable */
/* global WebImporter */
/**
 * Parser for block variant: table-specs
 * Base block: table
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selectors: .contentfragment.cmp-contentfragment--elements
 * Generated: 2026-08-06
 *
 * Block library structure (table): first row = block name, each subsequent
 * row is a row of data. This variant renders a 2-column spec table:
 *   cell 1 = label (dt), cell 2 = value (dd).
 * Source is a definition list `dl.cmp-contentfragment__elements` whose
 * `.cmp-contentfragment__element` divs each contain a `dt` (label) and
 * `dd` (value): Activity, Adventure Type, Trip Length, Group Size,
 * Difficulty, Price.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each spec is a dt/dd pair. Prefer the semantic element wrapper; fall back
  // to reading dt/dd pairs directly from the definition list.
  let specRows = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));

  if (specRows.length > 0) {
    specRows.forEach((row) => {
      const label = row.querySelector('.cmp-contentfragment__element-title, dt');
      const value = row.querySelector('.cmp-contentfragment__element-value, dd');
      if (!label && !value) return;

      const labelText = label ? label.textContent.trim() : '';
      const valueText = value ? value.textContent.trim() : '';

      const labelCell = document.createElement('strong');
      labelCell.textContent = labelText;
      cells.push([labelCell, valueText]);
    });
  } else {
    // Fallback: pair dt/dd siblings directly if the wrapper divs are absent.
    const dts = Array.from(element.querySelectorAll('dt'));
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === 'DD'
        ? dt.nextElementSibling
        : null;
      const labelCell = document.createElement('strong');
      labelCell.textContent = dt.textContent.trim();
      cells.push([labelCell, dd ? dd.textContent.trim() : '']);
    });
  }

  // Empty-block guard: nothing to tabulate.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-specs', cells });
  element.replaceWith(block);
}
