# FactsheetsDescriptorsBlock

A grid of factsheet descriptors. Each **group** opens with a coloured main card
(icon, title, description) followed by any number of descriptor cards (icon,
title, main text, sub text), all of them editable from the block sidebar.

```
┌──────────────┬────────┬────────┬────────┬────────┐
│ State        │ Birds  │ Mammals│Reptiles│  Fish  │
│ descriptors  │ 0% ... │ 8% ... │22% ... │ 9% ... │   ← one grid per group
├──────────────┼────────┼────────┼────────┼────────┤
│ Cephalopods  │ Pelagic│ Seabed │ Food   │        │   ← cards wrap, the main
│              │ ...    │ ...    │ webs   │        │     card is only in row 1
└──────────────┴────────┴────────┴────────┴────────┘
```

## Data model

```json
{
  "groups": [
    {
      "icon": "/marine/icons/state.svg",
      "title": [ ...slate nodes, e.g. "State descriptors"... ],
      "description": [ ...slate nodes... ],
      "background_color": "#004B7F",
      "cards": [
        {
          "icon": "/marine/icons/fish.svg",
          "title": [ ...slate nodes, e.g. "Fish"... ],
          "text": [ ...slate nodes, e.g. "9% GES achieved"... ],
          "info": [ ...slate nodes, e.g. "52% reported area assessed"... ],
          "background_color": "#FFFFFF"
        }
      ]
    }
  ]
}
```

A newly inserted block already contains one (empty) group, so the editor has a
main card to fill in.

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
  `<h3>` / `<h4>` with the slate paragraph unwrapped, since a heading may only
  hold phrasing content (`renderSlateInline` in `helpers.js`). Titles saved as
  plain strings before the field became rich text still render. The main text is styled as the statistic
  line (EEA green, large, bold); the muted suffix ("GES achieved") is applied
  with the inline style menu, which is why the whole line lives in one field.

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

## The empty-array trap (why `initialValue` omits `description`)

Volto's slate widget (`RichTextWidget.getValue`) treats an **empty array** as a
valid value and hands it straight to Slate. Slate then normalizes `[]` into a
paragraph on every render, which re-fires `onChange`, which re-renders the
editor: the sidebar dies with *"Maximum update depth exceeded"* as soon as the
field is clicked.

An **unset field** (`undefined`) is safe. Therefore:

- `initialValue` never seeds `description` with `[]` — it leaves it out.
- `helpers.normalizeGroups()` drops empty `description` / `text` / `info`
  arrays, and `Edit` runs it once on mount so blocks saved while the trap
  existed heal themselves instead of looping.

Do not "tidy up" the schema by adding `default: []` to a slate field.

## Footnotes / citations

`index.js` registers the block in `config.settings.blocksWithFootnotesSupport`
with the nested paths the footnote collector walks:

```js
[BLOCK_TYPE]: [
  { groups: 'title' },
  { groups: 'description' },
  { groups: { cards: 'title' } },
  { groups: { cards: 'text' } },
  { groups: { cards: 'info' } },
]
```

## Layout

One CSS grid per group (`styles.less`), so a group always starts a new row and
its main card occupies the first cell. Columns: 5 (≥1200px), 4 (992–1199),
3 (768–991), 2 (576–767), 1 (<576).

## Tests

`helpers.test.js` covers the colour maths, icon URL resolution and slate
detection; `View.test.jsx` covers the empty state, group/card rendering, inline
colours and the dark-card icon inversion.
