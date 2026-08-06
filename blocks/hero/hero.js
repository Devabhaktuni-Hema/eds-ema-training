/**
 * Hero block: text column (heading, subheading, CTAs) alongside an image grid.
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    if (cell.querySelector('h1, h2, h3')) {
      row.classList.add('hero-content');
      cell.classList.add('hero-content-inner');

      // group standalone CTA links into a button group
      const ctaParas = [...cell.querySelectorAll(':scope > p')]
        .filter((p) => p.childElementCount === 1 && p.firstElementChild.tagName === 'A' && p.textContent.trim() === p.firstElementChild.textContent.trim());

      if (ctaParas.length) {
        const group = document.createElement('div');
        group.className = 'button-group';
        ctaParas.forEach((p, i) => {
          const a = p.firstElementChild;
          a.classList.add('button');
          if (i > 0) a.classList.add('secondary');
          group.append(a);
          p.remove();
        });
        cell.append(group);
      }
    } else if (cell.querySelector('picture, img')) {
      row.classList.add('hero-images');
      cell.classList.add('hero-images-inner');
    }
  });
}
