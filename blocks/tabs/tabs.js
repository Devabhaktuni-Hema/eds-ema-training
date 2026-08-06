// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Testimonial tabs block.
 * Each block row is one testimonial: the first cell is the tab label
 * (avatar + name + role), the second cell is the panel content
 * (large image + name + role + quote).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Testimonials');

  const rows = [...block.children];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const panelCell = cells[1] || cells[0];
    const id = toClassName(labelCell.textContent) || `tab-${i}`;

    // decorate panel
    const panel = row;
    panel.className = 'tabs-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('aria-hidden', !!i);
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('role', 'tabpanel');
    // keep only the panel content cell inside the panel
    if (cells.length > 1) labelCell.remove();
    panelCell.classList.add('tabs-panel-content');

    // restructure panel into image column + text column
    const panelImg = panelCell.querySelector('picture, img');
    if (panelImg) {
      const imgCol = document.createElement('div');
      imgCol.className = 'tabs-panel-image';
      const imgWrap = panelImg.closest('p') || panelImg;
      imgCol.append(imgWrap.querySelector('picture, img') || imgWrap);
      imgWrap.remove();

      const textCol = document.createElement('div');
      textCol.className = 'tabs-panel-text';
      [...panelCell.children].forEach((c) => textCol.append(c));

      panelCell.append(imgCol, textCol);
    }

    // build tab button from the label cell
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = labelCell.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((p) => {
        p.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      panel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
  });

  block.prepend(tablist);
}
