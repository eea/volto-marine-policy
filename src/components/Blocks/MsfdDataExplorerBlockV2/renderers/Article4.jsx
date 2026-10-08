import React from 'react';
import LegacyView from '../LegacyView';
import Article4Explorer from './Article4Explorer';

// Reporting cycles that have a dedicated backend provider and share the new
// React explorer. Older cycles fall back to the legacy server rendered
// explorer. The reporting cycle is selected in the block view's sidebar and
// passed down as a prop. The 2012 cycle has its own provider too: its results
// are rendered grouped by country (see ExplorerTable).
const SUPPORTED_CYCLES = ['2012', '2018', '2024'];

// Article 4 dispatcher.
const MsfdDataExplorerArticle4 = (props) => {
  const cycle = props.cycle || '2024';

  if (SUPPORTED_CYCLES.includes(cycle)) {
    // `key` remounts the explorer when the cycle changes, so the URL-derived
    // initial state and the filter selections do not leak between cycles.
    return <Article4Explorer key={cycle} {...props} cycle={cycle} />;
  }

  return <LegacyView {...props} />;
};

export default MsfdDataExplorerArticle4;
