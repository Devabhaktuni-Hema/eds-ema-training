/*
 * download — WKND "Get the Full Story" file-download card.
 * Source: wknd.site/us/en/magazine/guide-la-skateparks.html (.cmp-download),
 * shown in the magazine sidebar above "Share this Story".
 *
 * Authored structure (rows):
 *   row 1 -> title link   (an <a> whose href is the file, e.g. "Download PDF")
 *   row 2 -> description  (e.g. "Get the Full Story")
 *   row 3 -> file meta    (e.g. "ultimateguidetolaskateparks.pdf, 139 KB, application/pdf")
 *
 * The file href is taken from the row-1 link. A dark action button is generated
 * pointing at that same href. If no link is authored the block renders nothing
 * (never a raw path).
 *
 * @param {Element} block the .download block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const titleLink = block.querySelector('a[href]');
  if (!titleLink) {
    block.textContent = '';
    return;
  }
  const href = titleLink.getAttribute('href');
  const title = titleLink.textContent.trim() || 'Download';
  const description = rows[1]?.textContent.trim() || '';
  const meta = rows[2]?.textContent.trim() || '';

  block.textContent = '';

  // Title (linked heading).
  const h3 = document.createElement('h3');
  h3.className = 'download-title';
  const h3link = document.createElement('a');
  h3link.href = href;
  h3link.textContent = title;
  h3.append(h3link);
  block.append(h3);

  // Description.
  if (description) {
    const p = document.createElement('p');
    p.className = 'download-description';
    p.textContent = description;
    block.append(p);
  }

  // File meta (filename / size / format).
  if (meta) {
    const metaEl = document.createElement('p');
    metaEl.className = 'download-meta';
    metaEl.textContent = meta;
    block.append(metaEl);
  }

  // Action button.
  const action = document.createElement('a');
  action.className = 'download-action';
  action.href = href;
  action.textContent = title;
  block.append(action);
}
