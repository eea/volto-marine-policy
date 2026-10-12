import DataExplorer from './DataExplorer';

// Article 19.3 (Datasets used) configuration for the shared explorer. The
// article reports datasets per "Information type" instead of a reporting
// cycle; each value is served by its own backend provider. No Summary &
// insights panel yet.
const ARTICLE = '19.3';

const CONFIG = {
  articleId: ARTICLE,
  subject: 'datasets',
  csvName: (cycle) => `article-19-3-datasets-${cycle}.csv`,
};

const Article193Explorer = (props) => (
  <DataExplorer {...props} config={CONFIG} />
);

export default Article193Explorer;
