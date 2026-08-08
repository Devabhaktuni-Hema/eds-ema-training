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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-teaser.js
  function parse(element, { document }) {
    let items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(".teaser, .cmp-teaser"));
    }
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      if (!image) return;
      const textCell = [];
      const heading = item.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not(.cmp-image)');
      if (heading && !heading.querySelector("img")) textCell.push(heading);
      const description = item.querySelector(".cmp-teaser__description");
      if (description && description.textContent.trim()) {
        textCell.push(description);
      }
      item.querySelectorAll(".cmp-teaser__action-link, a[href]").forEach((a) => {
        if (a.textContent.trim() && !textCell.includes(a)) textCell.push(a);
      });
      if (textCell.length > 0) {
        cells.push([image, textCell]);
      } else {
        cells.push([image]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse2(element, { document }) {
    const content = element.querySelector(":scope .cmp-teaser__content, .cmp-teaser__content");
    const imageWrap = element.querySelector(":scope .cmp-teaser__image, .cmp-teaser__image");
    const image = (imageWrap || element).querySelector(".cmp-image img, img");
    const scope = content || element;
    const pretitle = scope.querySelector(".cmp-teaser__pretitle");
    let heading = scope.querySelector(".cmp-teaser__title");
    if (!heading) heading = scope.querySelector("h1, h2, h3, h4");
    const description = scope.querySelector(".cmp-teaser__description, p:not(.cmp-teaser__pretitle)");
    const ctaLinks = Array.from(scope.querySelectorAll(".cmp-teaser__action-link, a[href]"));
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const contentCell = [];
    if (pretitle && pretitle.textContent.trim()) contentCell.push(pretitle);
    if (heading && !heading.querySelector("img")) contentCell.push(heading);
    if (description && description.textContent.trim() && description !== pretitle) {
      contentCell.push(description);
    }
    ctaLinks.forEach((a) => {
      if (a.textContent.trim() && !contentCell.includes(a)) contentCell.push(a);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document }) {
    let items = Array.from(element.querySelectorAll(".cmp-image-list__item"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(":scope > ul > li, li"));
    }
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      if (!image) return;
      const textCell = [];
      const titleEl = item.querySelector(".cmp-image-list__item-title");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      const href = titleLink ? titleLink.getAttribute("href") : (_b = (_a = item.querySelector(".cmp-image-list__item-image-link, a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href");
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
        textCell.push(heading);
      }
      const description = item.querySelector(".cmp-image-list__item-description");
      if (description && description.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textCell.push(p);
      }
      cells.push([image, textCell.length ? textCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
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

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-teaser": parse,
    "hero-banner": parse2,
    "cards": parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Site landing page: full-width carousel, alternating hero banners, and a cards feature grid.",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel-teaser",
        instances: [".carousel.cmp-carousel--hero", ".carousel.panelcontainer.cmp-carousel--hero"]
      },
      {
        name: "hero-banner",
        instances: [".teaser.cmp-teaser--featured", ".teaser.cmp-teaser--hero.cmp-teaser--imagebottom"]
      },
      {
        name: "cards",
        instances: [".image-list.list"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Hero Carousel",
        selector: ".carousel.panelcontainer.cmp-carousel--hero",
        style: null,
        blocks: ["carousel-teaser"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Featured Articles",
        selector: "#container-9c4899b718",
        style: null,
        blocks: ["hero-banner", "cards"],
        defaultContent: ["#container-9c4899b718 h2"]
      },
      {
        id: "rc3",
        name: "Climbing Hero Banner",
        selector: ".teaser.cmp-teaser--hero.cmp-teaser--imagebottom",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Adventures Grid",
        selector: "#container-4d3fed64ff",
        style: null,
        blocks: ["cards"],
        defaultContent: ["#container-4d3fed64ff h2"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
