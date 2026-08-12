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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    let items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(".cmp-image")).map((i) => i.closest("div") || i);
    }
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector("img");
      if (!image) return;
      const textCell = [];
      const heading = item.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]:not(.cmp-image)');
      if (heading && !heading.querySelector("img")) textCell.push(heading);
      item.querySelectorAll(":scope p, :scope .cmp-text p").forEach((p) => {
        if (p.textContent.trim()) textCell.push(p);
      });
      item.querySelectorAll("a[href]").forEach((a) => {
        if (a.textContent.trim()) textCell.push(a);
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
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-specs.js
  function parse2(element, { document }) {
    const cells = [];
    let specRows = Array.from(element.querySelectorAll(".cmp-contentfragment__element"));
    if (specRows.length > 0) {
      specRows.forEach((row) => {
        const label = row.querySelector(".cmp-contentfragment__element-title, dt");
        const value = row.querySelector(".cmp-contentfragment__element-value, dd");
        if (!label && !value) return;
        const labelText = label ? label.textContent.trim() : "";
        const valueText = value ? value.textContent.trim() : "";
        const labelCell = document.createElement("strong");
        labelCell.textContent = labelText;
        cells.push([labelCell, valueText]);
      });
    } else {
      const dts = Array.from(element.querySelectorAll("dt"));
      dts.forEach((dt) => {
        const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === "DD" ? dt.nextElementSibling : null;
        const labelCell = document.createElement("strong");
        labelCell.textContent = dt.textContent.trim();
        cells.push([labelCell, dd ? dd.textContent.trim() : ""]);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-detail.js
  function parse3(element, { document }) {
    const cmpTabs = element.querySelector(".cmp-tabs") || element;
    const labels = Array.from(cmpTabs.querySelectorAll(".cmp-tabs__tablist > li.cmp-tabs__tab"));
    let panels = Array.from(cmpTabs.querySelectorAll(":scope > .cmp-tabs__tabpanel"));
    if (panels.length === 0) {
      panels = Array.from(cmpTabs.querySelectorAll(".cmp-tabs__tabpanel"));
    }
    const extractContent = (panel) => {
      if (!panel) return [];
      const body = panel.querySelector(".cmp-contentfragment__elements") || panel;
      const out = [];
      const isEmptyGrid = (el) => el.classList && (el.classList.contains("aem-Grid") || el.classList.contains("aem-GridColumn")) && el.textContent.trim() === "" && !el.querySelector("img");
      body.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6, img").forEach((node) => {
        if (node.classList && node.classList.contains("cmp-contentfragment__title")) return;
        if (node.tagName === "IMG") {
          out.push(node);
          return;
        }
        if (node.querySelector && node.querySelector("img") && node.textContent.trim() === "") {
          node.querySelectorAll("img").forEach((im) => out.push(im));
          return;
        }
        if (node.textContent.trim() === "" && !node.querySelector("img")) return;
        out.push(node);
      });
      const unique = [];
      out.forEach((n) => {
        if (n.tagName === "IMG") {
          if (!unique.some((u) => u.tagName === "IMG" && u.getAttribute("src") === n.getAttribute("src"))) {
            unique.push(n);
          }
        } else {
          unique.push(n);
        }
      });
      return unique;
    };
    const cells = [];
    const count = Math.max(labels.length, panels.length);
    for (let i = 0; i < count; i += 1) {
      const label = labels[i];
      const panel = panels[i];
      const labelText = label ? label.textContent.trim() : "";
      const content = extractContent(panel);
      const labelCell = document.createElement("p");
      labelCell.textContent = labelText;
      cells.push([labelCell, content.length ? content : ""]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-detail", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "carousel-hero": parse,
    "table-specs": parse2,
    "tabs-detail": parse3
  };
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "Adventure detail page: breadcrumbs, image carousel, and tabbed detail/itinerary content.",
    urls: [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html",
      "https://wknd.site/us/en/adventures/beervana-portland.html",
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/us/en/adventures/cycling-tuscany.html",
      "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/us/en/adventures/tahoe-skiing.html",
      "https://wknd.site/us/en/adventures/west-coast-cycling.html",
      "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".carousel.cmp-carousel--mini", ".carousel.panelcontainer"]
      },
      {
        name: "table-specs",
        instances: [".contentfragment.cmp-contentfragment--elements"]
      },
      {
        name: "tabs-detail",
        instances: [".tabs.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Breadcrumb",
        selector: ".breadcrumb.cmp-breadcrumb--fixed",
        style: null,
        blocks: [],
        defaultContent: [".breadcrumb.cmp-breadcrumb--fixed"]
      },
      {
        id: "rc2",
        name: "Image Carousel",
        selector: ".carousel.panelcontainer.cmp-carousel--mini",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Adventure Detail",
        selector: "main.container.responsivegrid.cmp-layout-container--fixed",
        style: null,
        blocks: ["table-specs", "tabs-detail"],
        defaultContent: ["main.container.responsivegrid.cmp-layout-container--fixed h1"]
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
