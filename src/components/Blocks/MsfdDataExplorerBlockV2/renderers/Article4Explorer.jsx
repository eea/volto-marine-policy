import DataExplorer from './DataExplorer';
import { SUMMARY_CYCLES } from '../constants';

// Article 4 (Marine Units) configuration for the shared explorer. The
// reporting cycle is a prop (2012, 2018 or 2024) and only the data served by
// the backend differs between cycles.
const ARTICLE = '4';

// Public Discodata view of the 2024 Article 4 geographical boundaries. The
// explorer reads the same reporting table, so the two stay comparable.
const DISCODATA_2024_URL =
  'https://discomap.eea.europa.eu/App/DiscodataViewer/?fqn=' +
  '[WISE_Marine].[v6r1].[MSFD2024_ART4_GEO_GeographicalBoundaries]';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'Marine Reporting Units',
  csvName: (cycle) => `article-4-marine-units-${cycle}.csv`,
  supportsSummary: (cycle) =>
    (SUMMARY_CYCLES[ARTICLE] || []).includes(String(cycle)),
  // The Discodata view only exists for the 2024 cycle; the older cycles keep
  // just the CSV download.
  discodataUrl: (cycle) =>
    String(cycle) === '2024' ? DISCODATA_2024_URL : null,
};

const Article4Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article4Explorer;
