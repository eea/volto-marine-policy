import DataExplorer from './DataExplorer';
import { SUMMARY_CYCLES } from '../constants';

// Article 4 (Marine Units) configuration for the shared explorer. The
// reporting cycle is a prop (2012, 2018 or 2024) and only the data served by
// the backend differs between cycles.
const ARTICLE = '4';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'Marine Reporting Units',
  csvName: (cycle) => `article-4-marine-units-${cycle}.csv`,
  supportsSummary: (cycle) =>
    (SUMMARY_CYCLES[ARTICLE] || []).includes(String(cycle)),
};

const Article4Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article4Explorer;
