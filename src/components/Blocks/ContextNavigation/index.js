import zoomSVG from '@plone/volto/icons/zoom.svg';
import Edit from './Edit';
import View from './View';

export default function installBlock(config) {
  const blocksConfig = config.blocks.blocksConfig;

  blocksConfig.contextNavigation = {
    id: 'contextNavigation',
    title: 'Context Navigation',
    icon: zoomSVG,
    group: 'site',
    view: View,
    edit: Edit,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    variations: [],
    restricted: false,
  };

  return config;
}
