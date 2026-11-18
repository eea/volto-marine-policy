import DataExplorer from './DataExplorer';
import { SUMMARY_CYCLES } from '../constants';

// Article 19.3 (Datasets used) configuration for the shared explorer. The
// article reports datasets per "Information type" instead of a reporting
// cycle; each value is served by its own backend provider. Every information
// type serves a Summary & insights panel, built by the backend from whatever
// that type reports (see Article19SummaryMixin).
const ARTICLE = '19.3';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'datasets',
  csvName: (cycle) => `article-19-3-datasets-${cycle}.csv`,
  supportsSummary: (cycle) =>
    (SUMMARY_CYCLES[ARTICLE] || []).includes(String(cycle)),
};

const Article193Explorer = (props) => (
  <DataExplorer {...props} config={CONFIG} />
);

export default Article193Explorer;
