import DataExplorer from './DataExplorer';
import { SUMMARY_CYCLES } from '../constants';

// Article 9 (GES determination) configuration for the shared explorer. The
// article reports three periods (2024, 2018 and 2012); only the data served by
// the backend differs between them. Every period serves a Summary & insights
// panel.
const ARTICLE = '9';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'GES determinations',
  csvName: (cycle) => `article-9-ges-determinations-${cycle}.csv`,
  supportsSummary: (cycle) =>
    (SUMMARY_CYCLES[ARTICLE] || []).includes(String(cycle)),
};

const Article9Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article9Explorer;
