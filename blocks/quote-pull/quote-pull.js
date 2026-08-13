export default async function decorate(block) {
  const [quotation, attribution] = [...block.children].map((c) => c.firstElementChild);
  const blockquote = document.createElement('blockquote');

  // The WKND "definition" pull-quote variant (e.g. Western Australia's
  // "Wanderlust … a strong desire to travel." / noun) authors the quote as a
  // blockquote followed by a short label paragraph, inside one cell. Detect that
  // trailing label so the block can render the grey-box definition style.
  const label = quotation?.querySelector(':scope > blockquote ~ p, :scope > p');
  if (quotation && quotation.querySelector(':scope > blockquote') && label) {
    block.classList.add('quote-pull-definition');
    label.classList.add('quote-pull-label');
  }

  // decorate quotation
  quotation.className = 'quote-pull-quotation';
  blockquote.append(quotation);
  // decoration attribution
  if (attribution) {
    attribution.className = 'quote-pull-attribution';
    blockquote.append(attribution);
    const ems = attribution.querySelectorAll('em');
    ems.forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
  }
  block.innerHTML = '';
  block.append(blockquote);
}
