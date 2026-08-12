/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import tableSpecsParser from './parsers/table-specs.js';
import tabsDetailParser from './parsers/tabs-detail.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'table-specs': tableSpecsParser,
  'tabs-detail': tabsDetailParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json.
// urls[] holds all adventure-detail pages so this script can be used for
// both the single representative import and the full bulk import.
const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Adventure detail page: breadcrumbs, image carousel, and tabbed detail/itinerary content.',
  urls: [
    'https://wknd.site/us/en/adventures/bali-surf-camp.html',
    'https://wknd.site/us/en/adventures/beervana-portland.html',
    'https://wknd.site/us/en/adventures/climbing-new-zealand.html',
    'https://wknd.site/us/en/adventures/colorado-rock-climbing.html',
    'https://wknd.site/us/en/adventures/cycling-southern-utah.html',
    'https://wknd.site/us/en/adventures/cycling-tuscany.html',
    'https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html',
    'https://wknd.site/us/en/adventures/gastronomic-marais-tour.html',
    'https://wknd.site/us/en/adventures/napa-wine-tasting.html',
    'https://wknd.site/us/en/adventures/riverside-camping-australia.html',
    'https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html',
    'https://wknd.site/us/en/adventures/surf-camp-costa-rica.html',
    'https://wknd.site/us/en/adventures/tahoe-skiing.html',
    'https://wknd.site/us/en/adventures/west-coast-cycling.html',
    'https://wknd.site/us/en/adventures/whistler-mountain-biking.html',
    'https://wknd.site/us/en/adventures/yosemite-backpacking.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.carousel.cmp-carousel--mini', '.carousel.panelcontainer'],
    },
    {
      name: 'table-specs',
      instances: ['.contentfragment.cmp-contentfragment--elements'],
    },
    {
      name: 'tabs-detail',
      instances: ['.tabs.panelcontainer'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Breadcrumb',
      selector: '.breadcrumb.cmp-breadcrumb--fixed',
      style: null,
      blocks: [],
      defaultContent: ['.breadcrumb.cmp-breadcrumb--fixed'],
    },
    {
      id: 'rc2',
      name: 'Image Carousel',
      selector: '.carousel.panelcontainer.cmp-carousel--mini',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'Adventure Detail',
      selector: 'main.container.responsivegrid.cmp-layout-container--fixed',
      style: null,
      blocks: ['table-specs', 'tabs-detail'],
      defaultContent: ['main.container.responsivegrid.cmp-layout-container--fixed h1'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, then section breaks/metadata.
// Section transformer only included when the template has 2+ sections.
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
        // Avoid processing the same element twice when multiple selectors match it.
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

    // 1. beforeTransform (initial cleanup)
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

    // 4. afterTransform (final cleanup + section breaks/metadata)
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
