import DataExplorer from './DataExplorer';

// Article 9 (GES determination) configuration for the shared explorer. The
// article reports three periods (2024, 2018 and 2012); only the data served by
// the backend differs between them. No Summary & insights panel is served.
const CONFIG = {
  articleId: '9',
  subject: 'GES determinations',
  csvName: (cycle) => `article-9-ges-determinations-${cycle}.csv`,
  supportsSummary: () => false,
};

const Article9Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article9Explorer;
