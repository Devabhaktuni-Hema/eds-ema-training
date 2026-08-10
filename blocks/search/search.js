/*
 * search — WKND site search results.
 *
 * Reads the query from the `?q=` URL parameter, fetches the site's
 * query-index.json, ranks matching pages (title > description > path), and
 * renders a results list. Also wires a search form so a new query re-runs the
 * search. Authored as an empty `search` block on the results page; all UI is
 * built here.
 */

const INDEX_PATH = '/query-index.json';

/**
 * Fetch and cache the query index rows.
 * @returns {Promise<Array>} index rows ({ path, title, description, ... })
 */
let indexPromise;
async function fetchIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_PATH)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexPromise;
}

/**
 * Score a row against the search terms. Title hits weigh most, then
 * description, then path. Returns 0 when a term is missing entirely so every
 * term must match somewhere (AND semantics).
 * @param {object} row
 * @param {string[]} terms lowercased query terms
 * @returns {number}
 */
function scoreRow(row, terms) {
  const title = (row.title || '').toLowerCase();
  const description = (row.description || '').toLowerCase();
  const path = (row.path || '').toLowerCase();
  let score = 0;
  for (let i = 0; i < terms.length; i += 1) {
    const term = terms[i];
    if (title.includes(term)) score += 10;
    else if (description.includes(term)) score += 4;
    else if (path.includes(term)) score += 2;
    else return 0; // term not found anywhere → drop this row
  }
  return score;
}

/**
 * Run the query against the index and return ranked rows.
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function search(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const rows = await fetchIndex();
  return rows
    .map((row) => ({ row, score: scoreRow(row, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.row);
}

/**
 * Build a single result item.
 * @param {object} row
 * @returns {HTMLLIElement}
 */
function renderResult(row) {
  const li = document.createElement('li');
  li.className = 'search-result';

  const link = document.createElement('a');
  link.className = 'search-result-link';
  link.href = row.path;

  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = row.title || row.path;
  link.append(title);

  if (row.description) {
    const desc = document.createElement('p');
    desc.className = 'search-result-description';
    desc.textContent = row.description;
    link.append(desc);
  }

  li.append(link);
  return li;
}

/**
 * loads and decorates the search block
 * @param {Element} block
 */
export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  block.textContent = '';

  // --- Search form (pre-filled with the current query) ---
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.action = window.location.pathname;
  form.method = 'get';

  const icon = document.createElement('span');
  icon.className = 'search-form-icon';
  icon.setAttribute('aria-hidden', 'true');

  const input = document.createElement('input');
  input.className = 'search-input';
  input.type = 'search';
  input.name = 'q';
  input.value = query;
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');

  form.append(icon, input);
  block.append(form);

  // --- Results heading + list ---
  const heading = document.createElement('p');
  heading.className = 'search-summary';
  block.append(heading);

  const list = document.createElement('ul');
  list.className = 'search-results';
  block.append(list);

  if (!query) {
    heading.textContent = 'Enter a search term to find articles and adventures.';
    return;
  }

  const results = await search(query);
  list.textContent = '';

  if (!results.length) {
    heading.textContent = `No results for “${query}”.`;
    return;
  }

  heading.textContent = `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`;
  results.forEach((row) => list.append(renderResult(row)));
}
