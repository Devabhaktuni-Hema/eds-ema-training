/**
 * hero-banner
 * Renders the two WKND homepage promo banners from a single block:
 *  - `.featured`: image beside a grey text panel, led by a small pretitle
 *    (the "Featured Article" teaser).
 *  - `.banner`:  full-bleed image with a white text panel attached below
 *    (the "Climbing New Zealand" hero).
 *
 * Authored structure (rows):
 *   row 1 -> image cell (picture/img)
 *   row 2 -> text cell  (optional leading pretitle <p>, heading, description, CTA)
 *
 * @param {Element} block the .hero-banner block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const textRow = rows.find((row) => row !== imageRow
    && (row.querySelector('h1, h2, h3, h4, h5, h6') || row.querySelector('p')));

  if (imageRow) imageRow.classList.add('hero-banner-image');
  if (textRow) textRow.classList.add('hero-banner-text');

  // A leading paragraph that precedes the heading (and is not the CTA) is the
  // "Featured Article" pretitle -> distinguishes the featured teaser variant.
  const textCell = textRow ? textRow.firstElementChild : null;
  const heading = textCell ? textCell.querySelector('h1, h2, h3, h4, h5, h6') : null;
  const first = textCell ? textCell.firstElementChild : null;
  // querySelectorAll returns elements in document order, so comparing indices
  // tells us whether `first` precedes the heading (no bitwise mask needed).
  const orderedEls = textCell ? [...textCell.querySelectorAll('*')] : [];
  const hasPretitle = first && heading
    && first.tagName === 'P'
    && !first.querySelector('a')
    && orderedEls.indexOf(first) < orderedEls.indexOf(heading);

  if (hasPretitle) {
    first.classList.add('hero-banner-pretitle');
    block.classList.add('featured');
  } else {
    block.classList.add('banner');
  }

  if (!imageRow) block.classList.add('no-image');
}
