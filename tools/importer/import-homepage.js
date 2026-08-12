/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselTeaserParser from './parsers/carousel-teaser.js';
import heroBannerParser from './parsers/hero-banner.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-teaser': carouselTeaserParser,
  'hero-banner': heroBannerParser,
  'cards': cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json.
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Site landing page: full-width carousel, alternating hero banners, and a cards feature grid.',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    {
      name: 'carousel-teaser',
      instances: ['.carousel.cmp-carousel--hero', '.carousel.panelcontainer.cmp-carousel--hero'],
    },
    {
      name: 'hero-banner',
      instances: ['.teaser.cmp-teaser--featured', '.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'],
    },
    {
      name: 'cards',
      instances: ['.image-list.list'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Hero Carousel',
      selector: '.carousel.panelcontainer.cmp-carousel--hero',
      style: null,
      blocks: ['carousel-teaser'],
      defaultContent: [],
    },
    {
      id: 'rc2',
      name: 'Featured Articles',
      selector: '#container-9c4899b718',
      style: null,
      blocks: ['hero-banner', 'cards'],
      defaultContent: ['#container-9c4899b718 h2'],
    },
    {
      id: 'rc3',
      name: 'Climbing Hero Banner',
      selector: '.teaser.cmp-teaser--hero.cmp-teaser--imagebottom',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'Adventures Grid',
      selector: '#container-4d3fed64ff',
      style: null,
      blocks: ['cards'],
      defaultContent: ['#container-4d3fed64ff h2'],
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
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

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
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
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

    // 1. beforeTransform (initial cleanup + section breaks placed before parsing)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by an earlier parser
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

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
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
