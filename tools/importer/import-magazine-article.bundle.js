/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document }) {
    const image = element.querySelector("img.cmp-image__image, .cmp-image img, img");
    if (!image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([image]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/breadcrumbs-article.js
  function parse2(element, { document }) {
    const items = Array.from(
      element.querySelectorAll("li.cmp-breadcrumb__item, nav ol > li")
    );
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      if (link && link.textContent.trim()) {
        cells.push([link]);
      } else {
        const label = li.textContent.trim();
        if (label) cells.push([label]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "breadcrumbs-article",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-pull.js
  function parse3(element, { document }) {
    const quote = element.querySelector("blockquote");
    if (!quote || !quote.textContent.trim()) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([quote]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-pull", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".sharing",
        "#destination_publishing_iframe_wkndsite_0"
      ]);
      if (payload && payload.template && payload.template.name === "magazine-article") {
        WebImporter.DOMUtils.remove(element, [
          ".cmp-contentfragment__title",
          "main .cmp-experiencefragment",
          "aside.cmp-layoutcontainer--sidebar"
        ]);
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav",
        "iframe",
        "noscript"
      ]);
      element.querySelectorAll("[data-cmp-data-layer], [data-cmp-data-layer-enabled], [data-cmp-data-layer-name]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-data-layer-enabled");
        el.removeAttribute("data-cmp-data-layer-name");
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const sections = payload && payload.template && payload.template.sections || [];
    if (!Array.isArray(sections) || sections.length < 2) return;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl || !sectionEl.parentElement) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(payload.document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.parentElement.insertBefore(metadataBlock, sectionEl.nextSibling);
      }
      if (i > 0) {
        const hr = payload.document.createElement("hr");
        sectionEl.parentElement.insertBefore(hr, sectionEl);
      }
    }
  }

  // tools/importer/import-magazine-article.js
  var parsers = {
    "hero-article": parse,
    "breadcrumbs-article": parse2,
    "quote-pull": parse3
  };
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "Editorial article page: hero banner, breadcrumbs, pull quote, and long-form body content.",
    urls: [
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html",
      "https://wknd.site/us/en/magazine/ski-touring.html",
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: ["main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image"]
      },
      {
        name: "breadcrumbs-article",
        instances: [".breadcrumb"]
      },
      {
        name: "quote-pull",
        instances: [".text:has(blockquote)"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Lead Hero Image",
        selector: "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image",
        style: null,
        blocks: ["hero-article"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Breadcrumb",
        selector: ".breadcrumb",
        style: null,
        blocks: ["breadcrumbs-article"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Article Body",
        selector: "main.cmp-layout-container--fixed main.container.responsivegrid",
        style: null,
        blocks: ["quote-pull"],
        defaultContent: [
          "main.cmp-layout-container--fixed main.container.responsivegrid h1",
          "main.cmp-layout-container--fixed main.container.responsivegrid h2",
          "main.cmp-layout-container--fixed main.container.responsivegrid p"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
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
  var import_magazine_article_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_magazine_article_exports);
})();
