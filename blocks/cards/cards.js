import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * cards — WKND article/adventure card grid.
 *
 * Two modes:
 *  1. Authored (default): each block row becomes a card (image cell + body).
 *  2. Dynamic: if the block is authored with a single config cell holding a
 *     content path (e.g. "/us/en/magazine"), the cards are built from the
 *     query index — every published page directly under that path becomes a
 *     card (newest first). Publish a new article under the path and it appears
 *     automatically, no edit to the listing.
 */

/**
 * Read the dynamic source path from the block, if authored.
 * A dynamic block is a single row whose only text is a path beginning with "/".
 * @param {Element} block
 * @returns {string|null} the source path (e.g. "/us/en/magazine") or null
 */
function getDynamicSource(block) {
  const rows = [...block.children];
  if (rows.length !== 1) return null;
  const text = rows[0].textContent.trim();
  // A lone path, no images or extra markup → dynamic listing config.
  if (/^\/[\w/-]+$/.test(text) && !rows[0].querySelector('picture, img')) return text;
  return null;
}

/**
 * Fetch the site query index (cached). The backend builds /query-index.json
 * from helix-query.yaml; `aem up` serves a local copy.
 * @returns {Promise<Array>} index rows
 */
let indexPromise;
function fetchIndex() {
  if (!indexPromise) {
    indexPromise = fetch('/query-index.json')
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexPromise;
}

/**
 * Path prefixing: on `aem up`, pages are served under /content/…; the index
 * stores clean paths (/us/en/…). Add the /content prefix for local links.
 * @param {string} path
 */
function resolveHref(path) {
  const onContent = window.location.pathname.split('/').filter(Boolean)[0] === 'content';
  return onContent && !path.startsWith('/content') ? `/content${path}` : path;
}

/**
 * Return the index rows that are direct children of `source` (one path segment
 * deeper), i.e. the listing's items — excluding the listing page itself and any
 * grandchild pages. Newest first when lastModified is available.
 * @param {Array} rows
 * @param {string} source e.g. "/us/en/magazine"
 */
function childPages(rows, source) {
  const base = source.replace(/\/$/, '');
  const depth = base.split('/').filter(Boolean).length;
  return rows
    .filter((row) => {
      const p = (row.path || '').replace(/\/$/, '');
      if (!p.startsWith(`${base}/`)) return false;
      return p.split('/').filter(Boolean).length === depth + 1; // direct child only
    })
    .sort((a, b) => Number(b.lastModified || 0) - Number(a.lastModified || 0));
}

/**
 * Build a card <li> for a dynamic index row.
 * @param {object} row { path, title, description, image }
 */
function buildDynamicCard(row) {
  const li = document.createElement('li');

  const imageCell = document.createElement('div');
  imageCell.className = 'cards-card-image';
  if (row.image) {
    const link = document.createElement('a');
    link.href = resolveHref(row.path);
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('tabindex', '-1');
    const pic = createOptimizedPicture(row.image, row.title || '', false, [{ width: '750' }]);
    link.append(pic);
    imageCell.append(link);
  }

  const body = document.createElement('div');
  body.className = 'cards-card-body';
  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = resolveHref(row.path);
  titleLink.textContent = row.title || row.path;
  h3.append(titleLink);
  body.append(h3);
  if (row.description) {
    const p = document.createElement('p');
    p.textContent = row.description;
    body.append(p);
  }

  li.append(imageCell, body);
  return li;
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  const source = getDynamicSource(block);

  if (source) {
    // --- Dynamic listing: build cards from the query index ---
    block.classList.add('cards-dynamic');
    const rows = await fetchIndex();
    childPages(rows, source).forEach((row) => ul.append(buildDynamicCard(row)));
    block.replaceChildren(ul);
    return;
  }

  // --- Authored cards (default) ---
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Make the card image link to the same target as the card title, so clicking
  // the image navigates like clicking the title (source behaviour). The image
  // link is hidden from assistive tech to avoid a duplicate of the title link.
  ul.querySelectorAll('li').forEach((li) => {
    const imageCell = li.querySelector('.cards-card-image');
    const picture = imageCell?.querySelector('picture');
    const titleLink = li.querySelector('.cards-card-body a[href]');
    if (imageCell && picture && titleLink && !imageCell.querySelector('a')) {
      const link = document.createElement('a');
      link.href = titleLink.getAttribute('href');
      link.setAttribute('aria-hidden', 'true');
      link.setAttribute('tabindex', '-1');
      picture.replaceWith(link);
      link.append(picture);
    }
  });

  block.replaceChildren(ul);
}
