/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs
 * Base block: tabs
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-05
 *
 * Tabs convention: 2-column block, each row is one tab.
 *   - cell 1 = Tab Label (mandatory): avatar image + name + role
 *   - cell 2 = Tab Content (mandatory): large image + name + role + quote
 *
 * Source structure (.tabs-wrapper):
 *   .tab-menu  > button.tab-menu-link  (avatar + name + role)      -> label cell
 *   .tabs-content > .tab-pane          (image + name/role + quote) -> content cell
 */
export default function parse(element, { document }) {
  const rows = [];

  const menuItems = Array.from(element.querySelectorAll('.tab-menu > *'));
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));

  const count = Math.max(menuItems.length, panes.length);

  for (let i = 0; i < count; i += 1) {
    const menuItem = menuItems[i];
    const pane = panes[i];

    // --- Cell 1: Tab Label — avatar + name + role ---
    const labelCell = [];
    if (menuItem) {
      const avatarImg = menuItem.querySelector('.avatar img, img');
      if (avatarImg) labelCell.push(avatarImg);
      const textWrap = menuItem.querySelector('[style*="text-align"]') || menuItem;
      Array.from(textWrap.querySelectorAll('div, p')).forEach((d) => {
        if (d.querySelector('img')) return; // skip the avatar container
        const txt = d.textContent.trim();
        if (!txt) return;
        const p = document.createElement('p');
        p.innerHTML = d.innerHTML;
        labelCell.push(p);
      });
    }

    // --- Cell 2: Tab Content — large image + name + role + quote ---
    const contentCell = [];
    if (pane) {
      const grid = pane.querySelector('.grid-layout') || pane;
      const childDivs = Array.from(grid.children).filter((c) => c.tagName === 'DIV');
      const img = pane.querySelector('img');
      if (img) contentCell.push(img);
      const textDiv = childDivs.find((d) => !d.querySelector('img')) || null;
      if (textDiv) {
        Array.from(textDiv.querySelectorAll('div, p')).forEach((d) => {
          if (d.querySelector('div, p')) return; // only leaf text blocks
          const txt = d.textContent.trim();
          if (!txt) return;
          const p = document.createElement('p');
          p.innerHTML = d.innerHTML;
          contentCell.push(p);
        });
      }
    }

    if (!labelCell.length && !contentCell.length) continue;
    rows.push([labelCell.length ? labelCell : '', contentCell.length ? contentCell : '']);
  }

  // Empty-block guard
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells: rows });
  element.replaceWith(block);
}
