/*
 * related-stories — WKND magazine "SHARE THIS STORY" block.
 * Renders the share heading and a list of other magazine stories (title +
 * date), built dynamically from the query index. The current page is excluded.
 *
 * Authored structure (rows):
 *   single cell holding a content path prefix, e.g. "/us/en/magazine"
 *   — the sibling stories are the other published pages under that path.
 *
 * If the index is unavailable (e.g. query-index.json 404 on a branch preview
 * before helix-query.yaml is on main), the block renders just the heading and
 * no list — never a raw config path.
 *
 * @param {Element} block the .related-stories block element
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

/** On `aem up` pages are served under /content/…; add the prefix for links. */
function resolveHref(path) {
  const onContent = window.location.pathname.split('/').filter(Boolean)[0] === 'content';
  return onContent && !path.startsWith('/content') ? `/content${path}` : path;
}

/** Normalise the current path (strip /content prefix + .html) for comparison. */
function normalizePath(p) {
  return p.replace(/^\/content/, '').replace(/\.html$/, '').replace(/\/$/, '');
}

/** Sibling pages one segment under `source`, excluding the current page. */
function siblingStories(rows, source, here) {
  const base = source.replace(/\/$/, '');
  const depth = base.split('/').filter(Boolean).length;
  return rows.filter((row) => {
    const p = (row.path || '').replace(/\/$/, '');
    if (!p.startsWith(`${base}/`)) return false;
    if (p.split('/').filter(Boolean).length !== depth + 1) return false;
    return p !== here; // exclude the article we're on
  });
}

/** Format an epoch-seconds or ISO date as "Thursday, 9 Jul 2020" (source style). */
function formatDate(value) {
  if (!value) return '';
  const num = Number(value);
  const d = Number.isFinite(num) && num > 0 ? new Date(num * 1000) : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${wd}, ${d.getUTCDate()} ${mo} ${d.getUTCFullYear()}`;
}

export default async function decorate(block) {
  const source = block.textContent.trim();
  const isConfig = /^\/[\w/-]+$/.test(source) && !block.querySelector('picture, img, a');

  // Build the heading (always shown).
  const heading = document.createElement('h5');
  heading.className = 'related-stories-heading';
  heading.textContent = 'Share this Story';

  if (!isConfig) {
    // Not the dynamic config shape — leave authored content, just add heading.
    block.prepend(heading);
    return;
  }

  const here = normalizePath(window.location.pathname);
  const rows = siblingStories(await fetchIndex(), source, here);

  block.textContent = '';
  block.append(heading);
  if (!rows.length) return; // index unavailable → heading only, no raw path

  const list = document.createElement('ul');
  list.className = 'related-stories-list';
  rows.forEach((row) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = resolveHref(row.path);
    const title = document.createElement('span');
    title.className = 'related-stories-title';
    title.textContent = row.title || row.path;
    a.append(title);
    const dateStr = formatDate(row.date);
    if (dateStr) {
      const date = document.createElement('span');
      date.className = 'related-stories-date';
      date.textContent = dateStr;
      a.append(date);
    }
    li.append(a);
    list.append(li);
  });
  block.append(list);
}
