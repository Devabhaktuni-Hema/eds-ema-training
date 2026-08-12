/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroListingParser from './parsers/hero-listing.js';
import tabsListingParser from './parsers/tabs-listing.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-listing': heroListingParser,
  'tabs-listing': tabsListingParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json.
const PAGE_TEMPLATE = {
  name: 'adventures-listing',
  description: 'Adventures listing page: hero banner followed by tabbed/filterable listing of adventures.',
  urls: [
    'https://wknd.site/us/en/adventures.html',
  ],
  blocks: [
    {
      name: 'hero-listing',
      instances: ['.teaser.cmp-teaser--hero'],
    },
    {
      name: 'tabs-listing',
      instances: ['.tabs.panelcontainer'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Page Title',
      selector: 'main.cmp-layout-container--fixed > .cmp-container > .aem-Grid',
      style: null,
      blocks: [],
      defaultContent: ['h1'],
    },
    {
      id: 'rc2',
      name: 'Intro Hero',
      selector: '.teaser.cmp-teaser--hero',
      style: null,
      blocks: ['hero-listing'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'Current Adventures Listing',
      selector: '.tabs.panelcontainer',
      style: null,
      blocks: ['tabs-listing'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata.
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector "${selector}": ${e.message}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (cleanup + section breaks before block parsing)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
