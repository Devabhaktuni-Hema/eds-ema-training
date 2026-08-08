# Site Scope Report Plan — wknd.site (/us/en)

## Objective
Produce a migration **site scope report** for `https://wknd.site/us/en.html`. The report discovers the site's URLs, analyzes representative pages, groups them into page templates, catalogs the blocks required, and summarizes the overall migration effort — the input needed to plan a full content migration to AEM Edge Delivery Services.

## Scope
- **Entry point:** `https://wknd.site/us/en.html` (WKND demo site, US/English locale)
- **Deliverable:** A scope report artifact under `.migration/` covering URL inventory, page templates, block catalog, and effort estimate.
- **Out of scope (this task):** Actual content import, block development, and design/styling migration. Those are follow-up phases informed by this report.

## Approach
This is a discovery/analysis task. It will:
1. Crawl the site (sitemap first, fall back to link crawling) to build the URL inventory.
2. Sample and analyze representative pages to detect structure.
3. Cluster similar pages into a small set of page templates.
4. Identify the blocks each template needs and build a consolidated block catalog.
5. Roll everything up into a single scope report with an effort estimate.

## Checklist

- [ ] **Discover URLs** — fetch `wknd.site` sitemap (or crawl from `/us/en.html`), collect the full URL list scoped to the `/us/en` locale
- [ ] **Group & sample URLs** — cluster URLs by path pattern (home, articles/adventures, category/landing, magazine, etc.) and pick representative samples per cluster
- [ ] **Analyze representative pages** — for each sample, capture rendered structure, sections, and content sequences
- [ ] **Catalog page templates** — define the distinct page templates with names, matching URL patterns, and descriptions
- [ ] **Build block catalog** — enumerate the blocks each template requires; flag which map to existing EDS blocks vs. new/custom variants
- [ ] **Estimate migration effort** — summarize page counts per template, block reuse vs. new work, and overall complexity
- [ ] **Generate the scope report** — assemble the findings into a single migration scope report artifact
- [ ] **Review with user** — present the report summary and confirm next steps (e.g., proceed to migration)

## Notes
- Execution of this plan requires **Execute mode** — plan mode is read-only. Once approved, I'll run the site scope analysis workflow against the WKND site and produce the report.
- If the crawl surfaces a very large URL set, I'll sample representative pages per template rather than analyzing every page, and note the sampling in the report.
