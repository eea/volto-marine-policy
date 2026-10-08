import DataExplorer from './DataExplorer';

// Article 7 (Competent Authorities) configuration. There is only one
// reporting period, the 2012 reporting exercise, so the cycle is fixed and no
// Summary & insights panel is served for this article.
const CONFIG = {
  articleId: '7',
  subject: 'Competent Authorities',
  csvName: () => 'article-7-competent-authorities-2012.csv',
  supportsSummary: () => false,
};

const Article7Explorer = (props) => <DataExplorer {...props} config={CONFIG} />;

export default Article7Explorer;
