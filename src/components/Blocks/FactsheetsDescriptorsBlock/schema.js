import { DEFAULT_CARD_BACKGROUND, EEA_COLORS } from './helpers';

// Palette offered by the `style_simple_color` widgets. It is passed per field
// instead of through `config.settings.available_colors` so the block's palette
// stays its own decision.
const colorPalette = {
  widget: 'style_simple_color',
  available_colors: EEA_COLORS,
};

// `factsheet_icon` wraps Volto's `image` widget and adds an explicit remove
// button: the widget's own clear control is not clickable once it is nested in
// the block's object lists (see IconWidget.jsx).
const iconField = {
  title: 'Icon',
  widget: 'factsheet_icon',
  description:
    'Image used as the card icon. Upload an SVG or pick an existing Image; ' +
    'the image title becomes the alt text.',
};

export const cardSchema = () => ({
  title: 'Descriptor card',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['icon', 'title', 'text', 'info', 'url', 'background_color'],
    },
  ],
  properties: {
    icon: iconField,
    title: {
      title: 'Title',
      widget: 'slate_richtext',
    },
    text: {
      title: 'Main text',
      widget: 'slate_richtext',
      description: 'The prominent line, e.g. "75% GES achieved".',
    },
    info: {
      title: 'Sub text',
      widget: 'slate_richtext',
      description:
        'The line under the main text, e.g. "75% reported area assessed".',
    },
    url: {
      title: 'Link',
      widget: 'url',
      description:
        'Where the card links to. Internal and external URLs are both ' +
        'accepted; leave it empty to render the card as plain text.',
    },
    background_color: {
      ...colorPalette,
      title: 'Background colour',
      default: DEFAULT_CARD_BACKGROUND,
    },
  },
  required: [],
});

export const groupSchema = () => ({
  title: 'Descriptor group',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['cards'],
    },
  ],
  properties: {
    cards: {
      title: 'Descriptor cards',
      widget: 'object_list',
      description: 'Cards shown in this group, in this order.',
      schema: cardSchema(),
    },
  },
  required: [],
});

const schema = {
  title: 'Factsheets descriptors block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['groups'],
    },
  ],
  properties: {
    groups: {
      title: 'Descriptor groups',
      widget: 'object_list',
      description: 'Each group renders its own grid of descriptor cards.',
      schema: groupSchema(),
    },
  },
  required: [],
};

export default schema;
