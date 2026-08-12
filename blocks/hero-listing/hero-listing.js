/**
 * hero-listing — intro banner for the WKND adventures listing page.
 * A content-width feature image with a white text panel (heading + short
 * description, no CTA) overlapping the lower edge of the image.
 *
 * Authored structure (rows):
 *   row 1 -> image cell (picture/img)
 *   row 2 -> text cell  (heading + description paragraph)
 *
 * @param {Element} block the .hero-listing block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const textRow = rows.find((row) => row !== imageRow
    && (row.querySelector('h1, h2, h3, h4, h5, h6') || row.querySelector('p')));

  if (imageRow) imageRow.classList.add('hero-listing-image');
  if (textRow) textRow.classList.add('hero-listing-text');

  if (!imageRow) block.classList.add('no-image');
}
