/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-05
 *
 * Columns is a flexible block: the number of columns equals the natural
 * grouping of content, derived from the direct children of the grid layout.
 * Each direct child of the grid becomes one cell in a single content row.
 *   - instance 0: 2 columns (image | article header text)
 *   - instance 1: 2 columns (heading intro | FAQ list)
 *   - instance 2: 1 column (overlay card: heading, subheading, CTA)
 */
export default function parse(element, { document }) {
  // Locate the grid layout that defines the columns. The matched element may be
  // the grid itself or a container wrapping a single grid.
  let grid = element;
  if (!element.classList.contains('grid-layout')) {
    grid = element.querySelector(':scope > .grid-layout')
      || element.querySelector('.grid-layout')
      || element;
  }

  // Each direct child of the grid is a column cell.
  const columnCells = Array.from(grid.children).filter(
    (c) => c.nodeType === 1,
  );

  // Empty-block guard: nothing to lay out.
  if (!columnCells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row whose cell count equals the number of columns.
  cells.push(columnCells);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
