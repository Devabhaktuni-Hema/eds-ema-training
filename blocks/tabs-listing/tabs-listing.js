import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

/**
 * tabs-listing — filterable WKND adventures listing.
 * A horizontal tab bar (All / Climbing / Cycling / ...) switches between
 * panels, each holding a responsive grid of adventure cards
 * (image link + uppercase title link + description).
 *
 * Two modes:
 *  1. Authored (default): each block row -> [ tab label | card grid ].
 *  2. Dynamic: if the block is a single cell holding a content path
 *     (e.g. "/us/en/adventures"), the tabs and cards are built from the
 *     query index. An "All" tab lists every child page; one tab per distinct
 *     value of each page's `category` field lists its members. Publish a new
 *     adventure (with a Category) and it appears automatically.
 *
 * In both modes the panel content cell ends up as a FLAT sequence:
 *   <p><a><picture><img></a></p>  <h3><a>title</a></h3>  <p>description</p>
 * `buildCards` groups each image/title/description triplet into a
 * `.tabs-listing-card` so CSS can render a responsive card grid.
 *
 * @param {Element} block the .tabs-listing block element
 */

/**
 * Read the dynamic source path from the block, if authored.
 * A dynamic block is a single row whose only text is a path beginning with "/".
 * @param {Element} block
 * @returns {string|null} the source path (e.g. "/us/en/adventures") or null
 */
function getDynamicSource(block) {
  const rows = [...block.children];
  if (rows.length !== 1) return null;
  const text = rows[0].textContent.trim();
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
 * On `aem up` pages are served under /content/…; the index stores clean paths
 * (/us/en/…). Add the /content prefix for local links.
 * @param {string} path
 */
function resolveHref(path) {
  const onContent = window.location.pathname.split('/').filter(Boolean)[0] === 'content';
  return onContent && !path.startsWith('/content') ? `/content${path}` : path;
}

/**
 * Index rows that are direct children of `source` (one segment deeper),
 * sorted alphabetically by title (matching the source listing order).
 * @param {Array} rows
 * @param {string} source e.g. "/us/en/adventures"
 */
function childPages(rows, source) {
  const base = source.replace(/\/$/, '');
  const depth = base.split('/').filter(Boolean).length;
  return rows
    .filter((row) => {
      const p = (row.path || '').replace(/\/$/, '');
      if (!p.startsWith(`${base}/`)) return false;
      return p.split('/').filter(Boolean).length === depth + 1;
    })
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
}

/** Parse a page's comma-separated `category` field into a clean list. */
function pageCategories(row) {
  return (row.category || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Build one authored-shape card fragment: a linked image <p>, a title <h3><a>,
 * and a description <p> — the exact sequence buildCards() expects.
 * @param {object} row index row { path, title, description, image }
 * @returns {DocumentFragment}
 */
function buildCardFragment(row) {
  const frag = document.createDocumentFragment();
  const href = resolveHref(row.path);

  const imageP = document.createElement('p');
  if (row.image) {
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('tabindex', '-1');
    link.append(createOptimizedPicture(row.image, row.title || '', false, [{ width: '750' }]));
    imageP.append(link);
  }
  frag.append(imageP);

  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = row.title || row.path;
  h3.append(titleLink);
  frag.append(h3);

  if (row.description) {
    const descP = document.createElement('p');
    descP.textContent = row.description;
    frag.append(descP);
  }
  return frag;
}

/** Build one authored-shape row: [ label cell | content cell of card frags ]. */
function buildTabRow(label, pages) {
  const row = document.createElement('div');
  const labelCell = document.createElement('div');
  labelCell.textContent = label;
  const contentCell = document.createElement('div');
  pages.forEach((page) => contentCell.append(buildCardFragment(page)));
  row.append(labelCell, contentCell);
  return row;
}

/**
 * Replace the config cell with authored-shape rows built from the index:
 * an "All" tab plus one tab per distinct category (alphabetical).
 * @param {Element} block
 * @param {string} source
 */
async function buildDynamicRows(block, source) {
  const pages = childPages(await fetchIndex(), source);
  if (!pages.length) return;

  const categories = [...new Set(pages.flatMap(pageCategories))].sort((a, b) => a.localeCompare(b));

  block.textContent = '';
  block.append(buildTabRow('All', pages));
  categories.forEach((cat) => {
    const members = pages.filter((p) => pageCategories(p).includes(cat));
    block.append(buildTabRow(cat, members));
  });
}

function buildCards(panel) {
  const cell = panel.querySelector(':scope > div');
  if (!cell) return;
  cell.classList.add('tabs-listing-cards');

  const cards = [];
  let body = null;
  [...cell.children].forEach((node) => {
    const isImage = node.tagName === 'P' && node.querySelector('picture, img');
    if (isImage) {
      // new card starts at each image
      const card = document.createElement('div');
      card.className = 'tabs-listing-card';

      const imageWrap = document.createElement('div');
      imageWrap.className = 'tabs-listing-card-image';
      imageWrap.append(node);
      card.append(imageWrap);

      body = document.createElement('div');
      body.className = 'tabs-listing-card-body';
      card.append(body);

      cards.push(card);
    } else if (body) {
      // title / description belong to the current card
      body.append(node);
    }
  });

  cards.forEach((card) => cell.append(card));
}

export default async function decorate(block) {
  // Dynamic mode: replace the config cell with authored-shape rows built from
  // the query index, then fall through to the normal decoration below.
  const source = getDynamicSource(block);
  if (source) {
    block.classList.add('tabs-listing-dynamic');
    await buildDynamicRows(block, source);
  }

  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-listing-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-listing-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-listing-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();

    // group the panel's flat image/title/description sequence into cards
    buildCards(tabpanel);
  });

  block.prepend(tablist);
}
