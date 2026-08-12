/**
 * breadcrumbs-article
 * Decorates an authored breadcrumb trail into an accessible <nav> of links.
 *
 * Authored structure (rows of the block table, each a single cell with a link
 * or plain text for the current page):
 *   row 1 -> Magazine   (link)
 *   row 2 -> Arctic Surfing   (current page, plain text, no link)
 *
 * Alternatively a single cell containing a list/paragraph of links is also
 * supported. The last item is treated as the current (active) page.
 *
 * @param {Element} block the .breadcrumbs-article block element
 */
export default function decorate(block) {
  // Collect breadcrumb items: prefer explicit rows, fall back to any links.
  const rows = [...block.children];
  let items = rows
    .map((row) => row.querySelector('a') || row)
    .filter((el) => el && el.textContent.trim());

  // If the block was authored as a single cell with multiple links, use those.
  if (items.length <= 1) {
    const links = [...block.querySelectorAll('a')];
    if (links.length) items = links;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-article-list';

  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-article-item';
    const isLast = i === items.length - 1;

    const link = item.tagName === 'A' ? item : item.querySelector('a');
    if (link && !isLast) {
      link.className = 'breadcrumbs-article-link';
      li.append(link);
    } else {
      // Current page: render as plain text, mark as current.
      const span = document.createElement('span');
      span.textContent = item.textContent.trim();
      span.setAttribute('aria-current', 'page');
      li.classList.add('breadcrumbs-article-item-current');
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.innerHTML = '';
  block.append(nav);
}
