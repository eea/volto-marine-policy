import React from 'react';
import LegacyView from '../LegacyView';
import Article4Cycle2024 from './Article4Cycle2024';

// Article 4 dispatcher: the 2024-2030 cycle uses the new React explorer, the
// older cycles fall back to the legacy server rendered explorer. The reporting
// cycle is selected in the block view's sidebar and passed down as a prop.
const MsfdDataExplorerArticle4 = (props) => {
  const cycle = props.cycle || '2024';

  if (cycle === '2024') {
    return <Article4Cycle2024 {...props} />;
  }

  return <LegacyView {...props} />;
};

export default MsfdDataExplorerArticle4;
