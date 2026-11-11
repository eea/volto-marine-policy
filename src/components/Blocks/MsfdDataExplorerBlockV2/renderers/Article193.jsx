import React from 'react';
import LegacyView from '../LegacyView';
import Article193Explorer from './Article193Explorer';

// Information types that have a dedicated backend provider and share the new
// React explorer. Article 19.3 has no reporting cycle: the selector is an
// "Information type" and each value is served by its own provider; the API
// reuses the `cycle` query parameter for it, so the block view passes it down
// as `cycle`. Anything not listed here falls back to the legacy server
// rendered explorer.
const SUPPORTED_INFORMATION_TYPES = ['2012', '2018', '2020', '2024'];

// Article 19.3 (Datasets used) dispatcher.
const MsfdDataExplorerArticle193 = (props) => {
  const cycle = props.cycle || '2024';

  if (SUPPORTED_INFORMATION_TYPES.includes(cycle)) {
    // `key` remounts the explorer when the information type changes, so the
    // URL-derived initial state and the filter selections do not leak between
    // types.
    return <Article193Explorer key={cycle} {...props} cycle={cycle} />;
  }

  return <LegacyView {...props} />;
};

export default MsfdDataExplorerArticle193;
