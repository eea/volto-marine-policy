import {
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_GROUP_BACKGROUND,
  EEA_COLORS,
} from './helpers';

// Palette offered by the `style_simple_color` widgets. It is passed per field
// instead of through `config.settings.available_colors` so the block's palette
// stays its own decision.
const colorPalette = {
  widget: 'style_simple_color',
  available_colors: EEA_COLORS,
};

const iconField = {
  title: 'Icon',
  widget: 'image',
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
      fields: ['icon', 'title', 'text', 'info', 'background_color'],
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
      fields: ['icon', 'title', 'description', 'background_color', 'cards'],
    },
  ],
  properties: {
    icon: iconField,
    title: {
      title: 'Title',
      widget: 'slate_richtext',
    },
    description: {
      title: 'Description',
      widget: 'slate_richtext',
    },
    background_color: {
      ...colorPalette,
      title: 'Background colour',
      default: DEFAULT_GROUP_BACKGROUND,
    },
    cards: {
      title: 'Descriptor cards',
      widget: 'object_list',
      description: 'Cards shown after the main card, in this order.',
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
      description:
        'Each group renders a main card followed by its descriptor cards.',
      schema: groupSchema(),
    },
  },
  required: [],
};

export default schema;
