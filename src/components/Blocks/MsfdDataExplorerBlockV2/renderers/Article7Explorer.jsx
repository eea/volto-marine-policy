import DataExplorer from './DataExplorer';
import { SUMMARY_CYCLES } from '../constants';

// Article 7 (Competent Authorities) configuration. There is only one
// reporting period, the 2012 reporting exercise, so the cycle is fixed. The
// backend serves a count-based Summary & insights payload for it.
const ARTICLE = '7';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'Competent Authorities',
  csvName: () => 'article-7-competent-authorities-2012.csv',
  supportsSummary: (cycle) =>
    (SUMMARY_CYCLES[ARTICLE] || []).includes(String(cycle)),
};

const Article7Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article7Explorer;
