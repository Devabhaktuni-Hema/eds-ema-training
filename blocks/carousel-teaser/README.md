# Carousel Teaser

The full-width rotating hero at the top of the WKND homepage. Each slide is a
full-bleed image with a white content card (heading + description + yellow CTA)
overlapping the image bottom, plus centered dot indicators and bottom-right
prev/next chevrons.

## How to add a carousel item (in Document Authoring)

**Each row of the block = one slide.** Adding a slide is just adding a row — no
code change is needed. Order and removal are simply row order: the first row is
the first slide, and deleting a row removes that slide.

Author the block as a two-column table. The first row is the block name
(`Carousel Teaser`); every row after it is one slide:

| Carousel Teaser |                                                          |
| --------------- | -------------------------------------------------------- |
| *(image)*       | ## Heading<br>Short description sentence.<br>[CTA label](/target/path) |
| *(image)*       | ## Another Heading<br>Another description.<br>[Read More](/us/en/magazine/some-article) |

- **Left cell — image.** Place (or paste) the slide image. This becomes the
  full-width hero image.
- **Right cell — content.** A heading (renders as the large serif title), a
  description paragraph, and a link on its own line (renders as the yellow
  uppercase CTA button).

### Copy-paste row template

Add one new row like this to the block for each new slide:

| *(image)* | ## Your Slide Heading<br>One or two sentences of supporting copy.<br>[Button Label](/us/en/your-target) |
| --------- | ------------------------------------------------------------------------------------------------------- |

### Field notes

- **Heading, description, and CTA are all optional.** A row with just an image
  renders as an image-only slide; a row with no CTA or no description still lays
  out correctly.
- **Indicators and prev/next arrows appear automatically** once there are 2+
  slides, and the "Show Slide X of N" labels update to the live slide count.
  Paging wraps around (next from the last slide returns to the first).
- **First slide loads eagerly** for performance (LCP); keep the most important
  slide first.
- There is **no autoplay** — slides advance only when the visitor clicks a dot
  or a chevron. (This is intentional and matches the source site.)

## Publishing (the timely-update path)

Changes go live through the normal author flow — **no deploy required**:

1. Edit the homepage document in Document Authoring (add/remove/reorder rows).
2. **Preview** the page, then **Publish** it.

The new slide is live as soon as the page is published. Because slides are
authored content (not code), the carousel can be updated on any cadence
entirely from Document Authoring.

## Authored structure (for developers)

After decoration each authored row becomes a `<li class="carousel-teaser-slide">`
whose cells are classified by content: the cell containing the picture becomes
`.carousel-teaser-slide-image`, the other becomes `.carousel-teaser-slide-content`
(so cell order is forgiving). See `carousel-teaser.js`.
