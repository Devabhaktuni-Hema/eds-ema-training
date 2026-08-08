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

  // tools/importer/import-adventures-listing.js
  var import_adventures_listing_exports = {};
  __export(import_adventures_listing_exports, {
    default: () => import_adventures_listing_default
  });

  // tools/importer/parsers/hero-listing.js
  function parse(element, { document }) {
    const content = element.querySelector(":scope .cmp-teaser__content, .cmp-teaser__content");
    const imageWrap = element.querySelector(":scope .cmp-teaser__image, .cmp-teaser__image");
    const image = (imageWrap || element).querySelector(".cmp-image img, img");
    const scope = content || element;
    let heading = scope.querySelector(".cmp-teaser__title");
    if (!heading) heading = scope.querySelector("h1, h2, h3, h4");
    const description = scope.querySelector(".cmp-teaser__description, p");
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const contentCell = [];
    if (heading && !heading.querySelector("img")) contentCell.push(heading);
    if (description && description.textContent.trim() && description !== heading) {
      contentCell.push(description);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-listing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-listing.js
  function parse2(element, { document }) {
    const cmpTabs = element.querySelector(".cmp-tabs") || element;
    const labels = Array.from(cmpTabs.querySelectorAll(".cmp-tabs__tablist > li.cmp-tabs__tab"));
    let panels = Array.from(cmpTabs.querySelectorAll(":scope > .cmp-tabs__tabpanel"));
    if (panels.length === 0) {
      panels = Array.from(cmpTabs.querySelectorAll(".cmp-tabs__tabpanel"));
    }
    const extractCards = (panel) => {
      if (!panel) return [];
      const out = [];
      const items = Array.from(panel.querySelectorAll(".cmp-image-list__item"));
      items.forEach((item) => {
        var _a, _b;
        const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
        const titleEl = item.querySelector(".cmp-image-list__item-title");
        const titleLink = item.querySelector(".cmp-image-list__item-title-link");
        const href = titleLink ? titleLink.getAttribute("href") : (_b = (_a = item.querySelector(".cmp-image-list__item-image-link, a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href");
        const description = item.querySelector(".cmp-image-list__item-description");
        if (image) out.push(image);
        if (titleEl && titleEl.textContent.trim()) {
          const heading = document.createElement("h3");
          if (href) {
            const link = document.createElement("a");
            link.setAttribute("href", href);
            link.textContent = titleEl.textContent.trim();
            heading.appendChild(link);
          } else {
            heading.textContent = titleEl.textContent.trim();
          }
          out.push(heading);
        }
        if (description && description.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = description.textContent.trim();
          out.push(p);
        }
      });
      return out;
    };
    const cells = [];
    const count = Math.max(labels.length, panels.length);
    for (let i = 0; i < count; i += 1) {
      const label = labels[i];
      const panel = panels[i];
      const labelText = label ? label.textContent.trim() : "";
      const content = extractCards(panel);
      const labelCell = document.createElement("p");
      labelCell.textContent = labelText;
      cells.push([labelCell, content.length ? content : ""]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-listing", cells });
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

  // tools/importer/import-adventures-listing.js
  var parsers = {
    "hero-listing": parse,
    "tabs-listing": parse2
  };
  var PAGE_TEMPLATE = {
    name: "adventures-listing",
    description: "Adventures listing page: hero banner followed by tabbed/filterable listing of adventures.",
    urls: [
      "https://wknd.site/us/en/adventures.html"
    ],
    blocks: [
      {
        name: "hero-listing",
        instances: [".teaser.cmp-teaser--hero"]
      },
      {
        name: "tabs-listing",
        instances: [".tabs.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Page Title",
        selector: "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid",
        style: null,
        blocks: [],
        defaultContent: ["h1"]
      },
      {
        id: "rc2",
        name: "Intro Hero",
        selector: ".teaser.cmp-teaser--hero",
        style: null,
        blocks: ["hero-listing"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Current Adventures Listing",
        selector: ".tabs.panelcontainer",
        style: null,
        blocks: ["tabs-listing"],
        defaultContent: []
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
  var import_adventures_listing_default = {
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
  return __toCommonJS(import_adventures_listing_exports);
})();
