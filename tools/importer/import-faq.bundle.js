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

  // tools/importer/import-faq.js
  var import_faq_exports = {};
  __export(import_faq_exports, {
    default: () => import_faq_default
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

  // tools/importer/parsers/accordion-faq.js
  function parse2(element, { document }) {
    const cmpAccordion = element.querySelector(".cmp-accordion") || element;
    const items = Array.from(cmpAccordion.querySelectorAll(".cmp-accordion__item"));
    const extractTitle = (item) => {
      const titleEl = item.querySelector(".cmp-accordion__title");
      if (titleEl) return titleEl.textContent.trim();
      const button = item.querySelector(".cmp-accordion__button, .cmp-accordion__header button");
      if (button) {
        const clone = button.cloneNode(true);
        clone.querySelectorAll(".cmp-accordion__icon").forEach((icon) => icon.remove());
        return clone.textContent.trim();
      }
      return "";
    };
    const extractContent = (item) => {
      const panel = item.querySelector(".cmp-accordion__panel");
      if (!panel) return [];
      const body = panel.querySelector(".cmp-text") || panel;
      const out = [];
      body.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6, img").forEach((node) => {
        if (node.tagName === "IMG") {
          out.push(node);
          return;
        }
        if (node.querySelector && node.querySelector("img") && node.textContent.trim() === "") {
          node.querySelectorAll("img").forEach((im) => out.push(im));
          return;
        }
        if (node.textContent.replace(/ /g, " ").trim() === "" && !node.querySelector("img")) return;
        out.push(node);
      });
      return out;
    };
    const cells = [];
    items.forEach((item) => {
      const titleText = extractTitle(item);
      const content = extractContent(item);
      const titleCell = document.createElement("p");
      titleCell.textContent = titleText;
      cells.push([titleCell, content.length ? content : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
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

  // tools/importer/import-faq.js
  var parsers = {
    "hero-article": parse,
    "accordion-faq": parse2
  };
  var PAGE_TEMPLATE = {
    name: "faq",
    description: "FAQ page: hero banner followed by an accordion of expandable question/answer items.",
    urls: [
      "https://wknd.site/us/en/faqs.html"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: ["main.cmp-layout-container--fixed .image"]
      },
      {
        name: "accordion-faq",
        instances: [".accordion.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "FAQ Lead + Accordion",
        selector: ".cmp-layout-container--fixed > .cmp-container > .aem-Grid",
        style: null,
        blocks: ["hero-article", "accordion-faq"],
        defaultContent: [".cmp-layout-container--fixed h1", ".cmp-layout-container--fixed p"]
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
  var import_faq_default = {
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
  return __toCommonJS(import_faq_exports);
})();
