/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd.site section breaks + section metadata.
 *
 * Adds an EDS section break (<hr>) before every non-first section and, when a
 * section defines a `style`, a Section Metadata block after it. Sections are
 * read from payload.template.sections (page-templates.json), so this file is
 * template-agnostic and reused across wknd.site templates.
 *
 * For the adventure-detail template the sections are (all style: null):
 *   rc1 Breadcrumb       -> .breadcrumb.cmp-breadcrumb--fixed              (first, no <hr>)
 *   rc2 Image Carousel   -> .carousel.panelcontainer.cmp-carousel--mini    (<hr> before)
 *   rc3 Adventure Detail -> main.container.responsivegrid.cmp-layout-container--fixed (<hr> before)
 * => 2 section breaks, 0 Section Metadata blocks.
 *
 * All selectors originate from page-templates.json (each section.selector),
 * which were validated against migration-work/cleaned.html.
 *
 * Runs in beforeTransform: some section anchors ARE the block elements that
 * the block parsers replace via element.replaceWith() (e.g. rc2's carousel).
 * If we waited until afterTransform, those anchors would no longer be in the
 * DOM and their section break would silently be skipped. Inserting the <hr>
 * (and any Section Metadata block) while the original DOM is intact places a
 * positional sibling that survives the later replaceWith(). Block parsing
 * runs between beforeTransform and afterTransform, so the breaks are already
 * in place when parsing happens; an <hr>/section-metadata sibling never
 * matches a block selector, so it does not interfere with findBlocksOnPage().
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const sections = (payload && payload.template && payload.template.sections) || [];
  if (!Array.isArray(sections) || sections.length < 2) return;

  // Process in reverse so inserting nodes never shifts sections not yet handled.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl || !sectionEl.parentElement) continue;

    // Section Metadata block (only when a style is defined for the section).
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(payload.document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.parentElement.insertBefore(metadataBlock, sectionEl.nextSibling);
    }

    // Section break before every section except the first one.
    if (i > 0) {
      const hr = payload.document.createElement('hr');
      sectionEl.parentElement.insertBefore(hr, sectionEl);
    }
  }
}
