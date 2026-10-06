import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';

import { ARTICLE4_CYCLES } from '../constants';
import { readUrlState, writeUrlState } from '../urlState';
import LegacyView from '../LegacyView';
import Article4Cycle2024 from './Article4Cycle2024';

// Article 4 wrapper: renders the reporting cycle selector and routes the
// selected cycle to the React renderer or to the legacy explorer.
const MsfdDataExplorerArticle4 = (props) => {
  const { editable } = props;
  const history = useHistory();
  const location = useLocation();

  const [cycle, setCycle] = React.useState(
    () => readUrlState(location.search).cycle || '2024',
  );

  React.useEffect(() => {
    if (editable) return;

    writeUrlState(history, location, { cycle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, editable]);

  return (
    <div className="msfd-explorer-v2-article4">
      <div className="controls cycle-selector">
        <label htmlFor="msfd-cycle-select">Reporting cycle</label>
        <Dropdown
          id="msfd-cycle-select"
          selection
          options={ARTICLE4_CYCLES}
          value={cycle}
          onChange={(event, data) => setCycle(data.value)}
        />
      </div>

      {cycle === '2024' ? (
        <Article4Cycle2024 {...props} />
      ) : (
        <LegacyView {...props} />
      )}
    </div>
  );
};

export default MsfdDataExplorerArticle4;
