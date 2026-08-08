/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsTeamParser from './parsers/cards-team.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-team': cardsTeamParser,
  'cards': cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json.
// urls[] holds both feature-landing pages (About Us + Magazine index).
const PAGE_TEMPLATE = {
  name: 'feature-landing',
  description: 'Section landing page built from contributor/team card grids plus (on magazine) an articles cards grid.',
  urls: [
    'https://wknd.site/us/en/about-us.html',
    'https://wknd.site/us/en/magazine.html',
  ],
  blocks: [
    {
      name: 'cards-team',
      instances: ['.cmp-experience-fragment--contributor'],
    },
    {
      name: 'cards',
      instances: ['.image-list.list'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Contributor Grids',
      selector: 'main.cmp-layout-container--fixed main.container.responsivegrid',
      style: null,
      blocks: ['cards-team', 'cards'],
      defaultContent: [
        'main.cmp-layout-container--fixed main.container.responsivegrid h1',
        'main.cmp-layout-container--fixed main.container.responsivegrid h2',
        'main.cmp-layout-container--fixed main.container.responsivegrid p',
      ],
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

    // 3. Parse each block (skip elements already removed by a consolidating parser)
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
