import worldSVG from '@plone/volto/icons/world.svg';

import MsfdDataExplorerBlockV2View from './View';
import MsfdDataExplorerBlockV2Edit from './Edit';

const config = (config) => {
  config.blocks.blocksConfig.msfdDataExplorerBlockV2 = {
    id: 'msfdDataExplorerBlockV2',
    title: 'MSFD Data explorer block (v2)',
    icon: worldSVG,
    group: 'marine_addons',
    view: MsfdDataExplorerBlockV2View,
    edit: MsfdDataExplorerBlockV2Edit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default config;
