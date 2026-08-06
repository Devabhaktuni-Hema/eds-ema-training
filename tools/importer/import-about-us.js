/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import heroParser from './parsers/hero.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
  columns: columnsParser,
  hero: heroParser,
  tabs: tabsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'About Us page with hero header, mission/story sections, team/values content blocks, and call-to-action',
  urls: [
    'https://wknd-trendsetters.site/about-us',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '#main-content > header.section.secondary-section .grid-layout',
      ],
    },
    {
      name: 'columns',
      instances: [
        '#main-content > section.section:nth-of-type(1) .grid-layout',
        '#main-content > section.section:nth-of-type(5) .grid-layout',
        '#main-content > section.section.inverse-section .grid-layout',
      ],
    },
    {
      name: 'cards',
      instances: [
        '#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column',
        '#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column',
      ],
    },
    {
      name: 'tabs',
      instances: [
        '#main-content > section.section:nth-of-type(3) .tabs-wrapper',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Intro',
      selector: '#main-content > header.section.secondary-section',
      style: 'secondary',
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article Header',
      selector: '#main-content > section.section:nth-of-type(1)',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Image Gallery',
      selector: '#main-content > section.section.secondary-section:nth-of-type(2)',
      style: 'secondary',
      blocks: ['cards'],
      defaultContent: [
        '#main-content > section.section.secondary-section:nth-of-type(2) .utility-text-align-center',
      ],
    },
    {
      id: 'section-4',
      name: 'Testimonials',
      selector: '#main-content > section.section:nth-of-type(3)',
      style: null,
      blocks: ['tabs'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Latest Articles',
      selector: '#main-content > section.section.secondary-section:nth-of-type(4)',
      style: 'secondary',
      blocks: ['cards'],
      defaultContent: [
        '#main-content > section.section.secondary-section:nth-of-type(4) .utility-text-align-center',
      ],
    },
    {
      id: 'section-6',
      name: 'FAQ',
      selector: '#main-content > section.section:nth-of-type(5)',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'CTA Banner',
      selector: '#main-content > section.section.inverse-section',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, sections last (adds <hr> + section metadata)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
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
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
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

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
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
