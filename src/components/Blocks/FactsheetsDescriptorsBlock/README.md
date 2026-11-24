# FactsheetsDescriptorsBlock

A grid of factsheet descriptors. Each **group** is one grid of descriptor
cards (icon, title, main text, sub text, optional link), all of them editable
from the block sidebar.

```
┌────────┬────────┬────────┬────────┬────────┐
│ Birds  │ Mammals│Reptiles│  Fish  │ Cephalo│
│ 0% ... │ 8% ... │22% ... │ 9% ... │ 4% ... │   ← one grid per group
├────────┼────────┼────────┼────────┼────────┤
│ Pelagic│ Seabed │ Food   │        │        │   ← cards wrap into more rows
│ ...    │ ...    │ webs   │        │        │
└────────┴────────┴────────┴────────┴────────┘
```

## Data model

```json
{
  "groups": [
    {
      "cards": [
        {
          "icon": "/marine/icons/fish.svg",
          "title": [ ...slate nodes, e.g. "Fish"... ],
          "text": [ ...slate nodes, e.g. "9% GES achieved"... ],
          "info": [ ...slate nodes, e.g. "52% reported area assessed"... ],
          "url": "/marine/state/birds",
          "background_color": "#FFFFFF"
        }
      ]
    }
  ]
}
```

A group is only a grid container: it holds nothing but its `cards` list. Older
block data may still carry the group-level `icon` / `title` / `description` /
`background_color` of the removed main card; those keys are ignored by the view
and no longer offered in the sidebar.

A newly inserted block already contains one (empty) group, so the editor can
start adding cards right away.

## Editing

- **Icons** use Volto's `image` widget: pick an existing `Image` or upload one.
  The image title becomes the `alt` text; an empty title renders a decorative
  `alt=""`.
- **Backgrounds** use `style_simple_color` limited to the EEA Design System
  palette (`EEA_COLORS` in `helpers.js`). The stored value is a hex string.
- **Text colour is derived, never edited**: `getTextColor()` picks white or
  `#3D5265` by WCAG contrast against the chosen background, and the same
  luminance test drives the icon inversion below.
- **Titles, main text and sub text are slate fields**, so they accept inline
  styling, footnotes and inline data entities. A title is rendered inside its
  `<h4>` with the slate paragraph unwrapped, since a heading may only hold
  phrasing content (`renderSlateInline` in `helpers.js`). Titles saved as plain
  strings before the field became rich text still render. The main text is styled as the statistic
  line (EEA green, large, bold); the muted suffix ("GES achieved") is applied
  with the inline style menu, which is why the whole line lives in one field.

## Links

A descriptor card with a `url` is rendered as a single link (`<a>`) wrapping
the whole card, so the entire surface is clickable and reachable with Tab; the
card keeps its structure and only gains the `factsheet-descriptor-card--link`
modifier, which drops the theme's link colour/underline and adds hover and
`:focus-visible` feedback on the border.

The `url` field uses Volto's `url` widget, so it holds whatever the editor
picked:

- internal paths (`/marine/state/birds`) are flattened with `flattenToAppURL()`
  and go through the client-side router;
- absolute URLs (`https://…`) open in a new tab with
  `rel="noopener noreferrer"`.

`helpers.getCardLink()` does the classification; a blank value means "not a
link" and the card stays an `<article>`.

In edit mode the anchor keeps its `href` but swallows the click, otherwise
clicking a card would navigate away from the editor instead of selecting the
block.

Keep the slate fields of a linked card free of inline links: the card itself is
already an anchor, and an anchor nested inside another one is invalid HTML
(browsers silently close the outer link, so part of the card would stop being
clickable).

## Icons

The source SVGs live in `SVG icons/` at the addon root (`factsheets` set: birds,
mammals, reptiles, fish, cephalopods, pelagic habitats, seabed, food webs, …).

They are **not bundled by the block** — they are meant to be uploaded once as
`Image` items and then picked through the icon widget. Two things to know:

1. The deployment must accept `image/svg+xml` on the `Image` content type,
   otherwise the upload path fails at the first icon.
2. The files are monochrome with a hardcoded `#004b7f` stroke and a `#fff`
   fill. On a dark card the block applies
   `filter: brightness(0) invert(1)` (`.factsheet-icon-inverted`) so the stroke
   reads white; multi-colour artwork would lose its colours there.

The field uses the `factsheet_icon` widget (`IconWidget.jsx`, registered in the
addon `src/index.js`): Volto's `image` widget plus an explicit **Remove icon**
button. The image widget's own clear control sits in an absolutely positioned
toolbar over the preview and is not reliably clickable once the field is nested
in the block's object lists, which left editors unable to unset a picked icon.

## The empty-array trap (why `initialValue` omits the slate fields)

Volto's slate widget (`RichTextWidget.getValue`) treats an **empty array** as a
valid value and hands it straight to Slate. Slate then normalizes `[]` into a
paragraph on every render, which re-fires `onChange`, which re-renders the
editor: the sidebar dies with _"Maximum update depth exceeded"_ as soon as the
field is clicked.

An **unset field** (`undefined`) is safe. Therefore:

- `initialValue` never seeds a slate field with `[]` — it leaves it out.
- `helpers.normalizeGroups()` drops empty `title` / `text` / `info` arrays from
  the descriptor cards, and `Edit` runs it once on mount so blocks saved while
  the trap existed heal themselves instead of looping.

Do not "tidy up" the schema by adding `default: []` to a slate field.

## Footnotes / citations

`index.js` registers the block in `config.settings.blocksWithFootnotesSupport`
with the nested paths the footnote collector walks:

```js
[BLOCK_TYPE]: [
  { groups: { cards: 'title' } },
  { groups: { cards: 'text' } },
  { groups: { cards: 'info' } },
]
```

## Layout

One CSS grid per group (`styles.less`), so a group always starts a new row.
Columns: 5 (≥1200px), 4 (992–1199), 3 (768–991), 2 (576–767), 1 (<576).

## Tests

`helpers.test.js` covers the colour maths, icon URL resolution, card link
resolution and slate detection; `View.test.jsx` covers the empty state,
card rendering, card links, inline colours and the dark-card icon inversion;
`IconWidget.test.jsx` covers clearing an icon and hiding the remove button when
there is none; `schema.test.js` asserts the block's fields and widgets.
