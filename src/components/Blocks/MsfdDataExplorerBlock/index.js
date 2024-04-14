import worldSVG from '@plone/volto/icons/world.svg';
import MsfdDataExplorerBlockView from './View';
import MsfdDataExplorerBlockEdit from './Edit';

export default (config) => {
  config.blocks.blocksConfig.msfdDataExplorerBlock = {
    id: 'msfdDataExplorerBlock',
    title: 'MSFD Data explorer block',
    icon: worldSVG,
    group: 'marine_addons',
    view: MsfdDataExplorerBlockView,
    edit: MsfdDataExplorerBlockEdit,
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
