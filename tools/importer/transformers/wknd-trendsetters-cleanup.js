/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable global chrome (header/nav, footer, skip link) and
 * in-content breadcrumbs. All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Breadcrumbs live inside the Article Header section (parsed as a columns block).
    // Remove before block parsing so the parser does not pick them up.
    // Found in captured HTML: <div class="breadcrumbs"> ... </div>
    WebImporter.DOMUtils.remove(element, ['.breadcrumbs']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome. NOTE: the hero is <header class="section secondary-section">
    // INSIDE main and IS authorable, so we target the global nav by its own class (.navbar),
    // never the generic `header` tag.
    // Found in captured HTML:
    //   <a href="#main-content" class="skip-link"> (skip link)
    //   <div class="navbar"> ... </div>          (global header / nav / mega menu)
    //   <footer class="footer inverse-footer">    (global footer)
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'footer.footer',
    ]);
  }
}
