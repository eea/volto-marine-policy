import React from 'react';
import { Message } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';

import { getRenderer } from './renderers';
import LegacyView from './LegacyView';
import Sidebar from './components/Sidebar';
import { ARTICLE_SLUGS } from './constants';
import { readUrlState, writeUrlState } from './urlState';
import './styles.less';

// New data explorer block. The backend is a single generic endpoint; the
// frontend dispatches to a per-article renderer. Articles without a renderer
// fall back to the legacy explorer so that both versions stay available.
//
// The layout (sidebar + main content) lives here, so the reporting cycle and
// the MSFD Articles navigation stay visible while switching articles. Only the
// main content is provided by the per-article renderer.
const MsfdDataExplorerBlockV2View = (props) => {
  const { editable, data = {}, block, onChangeBlock } = props;
  const history = useHistory();
  const location = useLocation();

  const urlState = readUrlState(location.search);
  const defaultArticle = data.article_select;
  // In edit mode the block data is the source of truth; in view mode a URL
  // override lets the sidebar switch articles without editing the block.
  const articleValue = editable
    ? defaultArticle
    : urlState.article || defaultArticle;
  const article = ARTICLE_SLUGS[articleValue] || articleValue;
  const cycle = urlState.cycle || '2024';

  if (!article) {
    return editable ? <Message>Select article</Message> : null;
  }

  const handleSelectArticle = (slug) => {
    if (editable && onChangeBlock && block) {
      onChangeBlock(block, { ...data, article_select: slug });
      return;
    }

    writeUrlState(history, location, { article: slug });
  };

  const handleSelectCycle = (value) => {
    writeUrlState(history, location, { cycle: value });
  };

  const Renderer = getRenderer(article);

  const sidebar = (
    <Sidebar
      article={article}
      cycle={cycle}
      onSelectArticle={handleSelectArticle}
      onSelectCycle={handleSelectCycle}
    />
  );

  // React renderers place the sidebar next to their Filters panel and keep the
  // Results table in a separate, wider row (see the renderer). The legacy
  // explorer has no such split, so it keeps the two column layout.
  if (Renderer) {
    return (
      <div className="msfd-explorer-v2">
        <Renderer
          {...props}
          article={article}
          cycle={cycle}
          sidebar={sidebar}
        />
      </div>
    );
  }

  return (
    <div className="msfd-explorer-v2">
      <div className="msfd-explorer-layout">
        <main className="msfd-explorer-main">
          <LegacyView {...props} data={{ ...data, article_select: article }} />
        </main>

        {sidebar}
      </div>
    </div>
  );
};

export default MsfdDataExplorerBlockV2View;
