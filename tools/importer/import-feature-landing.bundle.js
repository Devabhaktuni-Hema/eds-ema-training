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

  // tools/importer/import-feature-landing.js
  var import_feature_landing_exports = {};
  __export(import_feature_landing_exports, {
    default: () => import_feature_landing_default
  });

  // tools/importer/parsers/cards-team.js
  var CONTRIBUTOR_SELECTOR = ".cmp-experience-fragment--contributor";
  function buildTextCell(card, document) {
    const textCell = [];
    const nameEl = card.querySelector("h3.cmp-title__text, .title:not(.cmp-title--black) .cmp-title__text, h3");
    if (nameEl && nameEl.textContent.trim()) {
      const heading = document.createElement("h3");
      heading.textContent = nameEl.textContent.trim();
      textCell.push(heading);
    }
    const roleEl = card.querySelector("h5.cmp-title__text, .cmp-title--black .cmp-title__text, h5");
    if (roleEl && roleEl.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = roleEl.textContent.trim();
      textCell.push(p);
    }
    let socialLinks = Array.from(card.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button"));
    if (!socialLinks.length) socialLinks = Array.from(card.querySelectorAll(".buildingblock a[href]"));
    if (!socialLinks.length) socialLinks = Array.from(card.querySelectorAll("a.cmp-button"));
    socialLinks = socialLinks.filter((a) => a.getAttribute("href"));
    if (socialLinks.length) {
      const list = document.createElement("ul");
      socialLinks.forEach((a) => {
        const href = a.getAttribute("href");
        const labelEl = a.querySelector(".cmp-button__text");
        const label = (labelEl ? labelEl.textContent : a.textContent).trim();
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = label || href;
        li.appendChild(link);
        list.appendChild(li);
      });
      textCell.push(list);
    }
    return textCell;
  }
  function buildCardRow(card, document) {
    const image = card.querySelector(".cmp-image img, .image img, img");
    if (!image) return null;
    const textCell = buildTextCell(card, document);
    return [image, textCell.length ? textCell : ""];
  }
  function parse(element, { document }) {
    if (!element.isConnected) return;
    const prev = element.previousElementSibling;
    if (prev && prev.matches && prev.matches(CONTRIBUTOR_SELECTOR)) return;
    const cardsInRun = [element];
    let next = element.nextElementSibling;
    while (next && next.matches && next.matches(CONTRIBUTOR_SELECTOR)) {
      cardsInRun.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    cardsInRun.forEach((card) => {
      const row = buildCardRow(card, document);
      if (row) cells.push(row);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-team", cells });
    element.replaceWith(block);
    cardsInRun.slice(1).forEach((card) => card.remove());
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
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

  // tools/importer/import-feature-landing.js
  var parsers = {
    "cards-team": parse,
    "cards": parse2
  };
  var PAGE_TEMPLATE = {
    name: "feature-landing",
    description: "Section landing page built from contributor/team card grids plus (on magazine) an articles cards grid.",
    urls: [
      "https://wknd.site/us/en/about-us.html",
      "https://wknd.site/us/en/magazine.html"
    ],
    blocks: [
      {
        name: "cards-team",
        instances: [".cmp-experience-fragment--contributor"]
      },
      {
        name: "cards",
        instances: [".image-list.list"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Contributor Grids",
        selector: "main.cmp-layout-container--fixed main.container.responsivegrid",
        style: null,
        blocks: ["cards-team", "cards"],
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
  var import_feature_landing_default = {
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
  return __toCommonJS(import_feature_landing_exports);
})();
