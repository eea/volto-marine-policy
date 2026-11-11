import React from 'react';
import LegacyView from '../LegacyView';
import Article7Explorer from './Article7Explorer';

// Reporting periods that have a dedicated backend provider. Article 7 has a
// single one (the 2012 reporting exercise); anything else falls back to the
// legacy server rendered explorer. The period is a prop so the explorer layout
// stays identical to the other articles.
const SUPPORTED_CYCLES = ['2012'];

// Article 7 dispatcher.
const MsfdDataExplorerArticle7 = (props) => {
  const cycle = props.cycle || '2012';

  if (SUPPORTED_CYCLES.includes(cycle)) {
    // `key` remounts the explorer when the period changes, so the URL-derived
    // initial state and the filter selections do not leak between periods.
    return <Article7Explorer key={cycle} {...props} cycle={cycle} />;
  }

  return <LegacyView {...props} />;
};

export default MsfdDataExplorerArticle7;
