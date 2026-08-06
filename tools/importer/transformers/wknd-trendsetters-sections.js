/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section breaks and Section Metadata.
 * Runs in afterTransform only. Uses payload.template.sections.
 * For each section (reverse order):
 *   - append a "Section Metadata" block when section.style is set
 *   - insert an <hr> before the section when it is not the first section
 * Section selectors come from tools/importer/page-templates.json (verified
 * against migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const doc = element.ownerDocument;
    const sections = (payload && payload.template && payload.template.sections) || [];
    if (sections.length < 2) return;

    // Resolve a section element from its template selector. The selectors are
    // rooted at "#main-content > ..."; element is the #main-content <main>, so a
    // direct querySelector works, with a :scope-relative fallback for safety.
    const resolve = (selector) => {
      if (!selector) return null;
      let el = element.querySelector(selector);
      if (!el) {
        el = element.querySelector(selector.replace(/^#main-content\s*>\s*/, ':scope > '));
      }
      return el;
    };

    // Process in reverse order so inserting nodes does not disturb the position
    // of sections not yet handled.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = resolve(section.selector);
      if (!sectionEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const smBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(smBlock);
      }

      // Section break before every non-first section.
      if (i > 0) {
        sectionEl.before(doc.createElement('hr'));
      }
    }
  }
}
