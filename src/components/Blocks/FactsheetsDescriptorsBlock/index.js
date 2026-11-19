import { v4 as uuid } from 'uuid';
import cardsSVG from '@plone/volto/icons/cards.svg';

import View from './View';
import Edit from './Edit';
import { DEFAULT_GROUP_BACKGROUND } from './helpers';

export const BLOCK_TYPE = 'factsheetsDescriptorsBlock';

// An empty block would leave the editor with nothing to fill in the sidebar, so
// the block is inserted with a single main card; its descriptor cards are added
// through the object list widget.
const initialValue = ({ value }) => ({
  ...value,
  groups: [
    {
      '@id': uuid(),
      icon: null,
      background_color: DEFAULT_GROUP_BACKGROUND,
      cards: [],
    },
  ],
});

const installFactsheetsDescriptorsBlock = (config) => {
  config.blocks.blocksConfig[BLOCK_TYPE] = {
    id: BLOCK_TYPE,
    title: 'Factsheets descriptors',
    icon: cardsSVG,
    group: 'marine_addons',
    view: View,
    edit: Edit,
    initialValue,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  // Footnotes and citations are collected from the slate fields of a block only
  // if the block declares where they live. The mapping values are paths walked
  // by `retriveValuesOfSlateFromNestedPath`, which recurses through both arrays
  // and nested path objects.
  config.settings.blocksWithFootnotesSupport = {
    ...(config.settings.blocksWithFootnotesSupport || {}),
    [BLOCK_TYPE]: [
      { groups: 'title' },
      { groups: 'description' },
      { groups: { cards: 'title' } },
      { groups: { cards: 'text' } },
      { groups: { cards: 'info' } },
    ],
  };

  return config;
};

export default installFactsheetsDescriptorsBlock;
