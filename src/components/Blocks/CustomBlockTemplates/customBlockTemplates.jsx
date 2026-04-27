import {
  BlockStyleWrapperEdit,
  BlockStyleWrapperView,
} from '@eeacms/volto-block-style/BlockStyleWrapper';
import EditIframe from '@eeacms/volto-embed/Blocks/Maps/Edit';
import ViewIframe from '@eeacms/volto-embed/Blocks/Maps/View';

const customBlockTemplates = (config) => ({
  ...config.blocks.blocksConfig,

  maps: {
    ...config.blocks.blocksConfig.maps,
    view: (props) => (
      <BlockStyleWrapperView {...props}>
        <ViewIframe {...props} />
      </BlockStyleWrapperView>
    ),
    edit: (props) => (
      <BlockStyleWrapperEdit {...props}>
        <EditIframe {...props} />
      </BlockStyleWrapperEdit>
    ),
  },
});
export default customBlockTemplates;
