import React from 'react';
import { Message } from 'semantic-ui-react';

import { getRenderer } from './renderers';
import LegacyView from './LegacyView';
import './styles.less';

// New data explorer block. The backend is a single generic endpoint; the
// frontend dispatches to a per-article renderer. Articles without a renderer
// fall back to the legacy explorer so that both versions stay available.
const MsfdDataExplorerBlockV2View = (props) => {
  const { editable } = props;
  const article = props.data && props.data.article_select;

  if (!article) {
    return editable ? <Message>Select article</Message> : null;
  }

  const Renderer = getRenderer(article);

  if (!Renderer) {
    return <LegacyView {...props} />;
  }

  return <Renderer {...props} />;
};

export default MsfdDataExplorerBlockV2View;
