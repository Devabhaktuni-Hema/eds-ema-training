import { toClassName } from '../../scripts/aem.js';

/**
 * tabs-listing — filterable WKND adventures listing.
 * A horizontal tab bar (All / Climbing / Cycling / ...) switches between
 * panels, each holding a responsive grid of adventure cards
 * (image link + uppercase title link + description).
 *
 * Authored structure (rows):
 *   each row -> [ tab label | tab content (the card grid for that filter) ]
 *
 * After EDS decoration the panel content cell is a FLAT sequence:
 *   <p><picture><img></p>  <h3><a>title</a></h3>  <p>description</p>  (repeated)
 * This decorator groups each image/title/description triplet into a
 * `.tabs-listing-card` so CSS can render a responsive card grid.
 *
 * @param {Element} block the .tabs-listing block element
 */
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
