import React from 'react';
import LegacyView from '../LegacyView';
import Article9Explorer from './Article9Explorer';

// Reporting periods that have a dedicated backend provider and share the new
// React explorer. Anything else falls back to the legacy server rendered
// explorer. The period is selected in the block view's sidebar and passed down
// as a prop.
const SUPPORTED_PERIODS = ['2012', '2018', '2024'];

// Article 9 dispatcher.
const MsfdDataExplorerArticle9 = (props) => {
  const cycle = props.cycle || '2024';

  if (SUPPORTED_PERIODS.includes(cycle)) {
    // `key` remounts the explorer when the period changes, so the URL-derived
    // initial state and the filter selections do not leak between periods.
    return <Article9Explorer key={cycle} {...props} cycle={cycle} />;
  }

  return <LegacyView {...props} />;
};

export default MsfdDataExplorerArticle9;
