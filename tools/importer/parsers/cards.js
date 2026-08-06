/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-05
 *
 * Cards is a 2-column block: cell 1 = image/icon, cell 2 = text content
 * (heading, description, CTA). This page uses three distinct card layouts,
 * all normalized to the same 2-column rows:
 *   - instance 0: image-only grid (.grid-layout > .utility-aspect-1x1 > img)
 *   - instance 1: tabbed testimonial cards (.tabs-wrapper .tab-pane .grid-layout)
 *   - instance 2: linked article cards (a.article-card with image + body)
 */
export default function parse(element, { document }) {
  const rows = [];

  // Mode 1: linked article cards (image + body with meta/heading)
  const articleCards = Array.from(element.querySelectorAll('a.article-card'));
  // Mode 2: tabbed cards — each active/inactive tab pane is a card
  const tabPanes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));

  if (articleCards.length) {
    articleCards.forEach((card) => {
      const img = card.querySelector('img');
      const body = card.querySelector('.article-card-body') || card;
      const href = card.getAttribute('href');
      const textCell = [];
      const meta = body.querySelector('.article-card-meta');
      if (meta) {
        // Split meta into category (pill) + date. Wrap the category tag in
        // <strong> so it survives markdown and can be styled as a pill; keep
        // the date as trailing plain text.
        const tag = meta.querySelector('.tag');
        const date = meta.querySelector('.utility-text-secondary, .paragraph-sm');
        const metaP = document.createElement('p');
        if (tag) {
          const strong = document.createElement('strong');
          strong.textContent = tag.textContent.trim();
          metaP.appendChild(strong);
        }
        if (date && date !== tag) {
          metaP.appendChild(document.createTextNode(` ${date.textContent.trim()}`));
        }
        textCell.push(metaP.childNodes.length ? metaP : meta);
      }
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        // Preserve the card link by wrapping the heading text in an anchor
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = heading.textContent;
          heading.textContent = '';
          heading.appendChild(a);
        }
        textCell.push(heading);
      } else if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = 'Read more';
        textCell.push(a);
      }
      rows.push([img || '', textCell.length ? textCell : '']);
    });
  } else if (tabPanes.length) {
    tabPanes.forEach((pane) => {
      const grid = pane.querySelector('.grid-layout') || pane;
      const img = pane.querySelector('img');
      const childDivs = Array.from(grid.children).filter((c) => c.tagName === 'DIV');
      // Text content lives in the child div that does not contain the image
      const textDiv = childDivs.find((d) => !d.querySelector('img'));
      const textCell = [];
      if (textDiv) {
        Array.from(textDiv.children).forEach((c) => textCell.push(c));
      }
      rows.push([img || '', textCell.length ? textCell : '']);
    });
  } else {
    // Mode 3: generic grid — each direct child is a card
    const cardEls = Array.from(element.children)
      .filter((c) => c.tagName === 'DIV' || c.tagName === 'A');
    cardEls.forEach((card) => {
      const img = card.querySelector('img');
      const textCell = [];
      Array.from(card.children).forEach((child) => {
        if (child.tagName === 'IMG') return; // image handled separately
        if (child.querySelector && child.querySelector('img') && child.children.length === 1
          && child.children[0].tagName === 'IMG') return; // pure image wrapper
        textCell.push(child);
      });
      rows.push([img || '', textCell.length ? textCell : '']);
    });
  }

  // Empty-block guard: no cards found, unwrap
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  rows.forEach((r) => cells.push(r));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
