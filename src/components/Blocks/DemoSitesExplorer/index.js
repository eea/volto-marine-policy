import worldSVG from '@plone/volto/icons/world.svg';
import DemoSitesExplorerEdit from './DemoSitesExplorerEdit';
import DemoSitesExplorerView from './DemoSitesExplorerView';

export default function installDemoSitesExplorerBlock(config) {
  config.blocks.blocksConfig.demoSitesExplorer = {
    id: 'demoSitesExplorer',
    title: 'Demo Sites Explorer',
    icon: worldSVG,
    group: 'marine_addons',
    edit: DemoSitesExplorerEdit,
    view: DemoSitesExplorerView,
  };

  return config;
}
