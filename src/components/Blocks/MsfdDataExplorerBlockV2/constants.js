// Maps the block's `article_select` slug to the article identifier used by the
// `@msfd-explorer` API.
export const ARTICLE_IDS = {
  'marine-units': '4',
  'competent-authorities': '7',
  assessments: '8',
  'determination-of-good-environmental-status': '9',
  'establishment-of-environmental-targets': '10',
  'monitoring-programmes': '11',
  'programmes-of-measures-progress-of-pom': '13',
  exceptions: '14',
  'datasets-used': '19.3',
};

// Reverse of ARTICLE_IDS, so old/shareable URLs that stored the numeric article
// (msfd_article=4) still resolve to the slug used by the renderer registry.
export const ARTICLE_SLUGS = Object.keys(ARTICLE_IDS).reduce((acc, slug) => {
  acc[ARTICLE_IDS[slug]] = slug;
  return acc;
}, {});

// Reporting cycles of Article 4. Only `2024` has a React renderer; the others
// fall back to the legacy server rendered explorer.
export const ARTICLE4_CYCLES = [
  { value: '2024', text: '2024 - 2030' },
  { value: '2018', text: '2018 - 2024' },
  { value: '2012', text: '2012 - 2018' },
];

// Articles shown in the explorer sidebar (MSFD Articles section). The order and
// labels mirror the WISE Marine navigation. Only `article_select` values that
// have a registered React renderer get the new UI; the rest fall back to the
// legacy explorer.
export const MSFD_ARTICLES = [
  { slug: 'marine-units', number: '4', label: 'Marine Units' },
  { slug: 'assessments', number: '8', label: 'Assessment' },
  {
    slug: 'determination-of-good-environmental-status',
    number: '9',
    label: 'Good Environmental Status',
  },
  {
    slug: 'establishment-of-environmental-targets',
    number: '10',
    label: 'Environmental Targets',
  },
  {
    slug: 'monitoring-programmes',
    number: '11',
    label: 'Monitoring Programmes',
  },
  {
    slug: 'programmes-of-measures-progress-of-pom',
    number: '13',
    label: 'Programmes of Measures',
  },
  // The mockup labels this "Article 15", but the MSFD exceptions are reported
  // under Article 14 (see ARTICLE_IDS / schema.jsx).
  { slug: 'exceptions', number: '14', label: 'Exceptions' },
];

export const DEFAULT_PAGE_SIZE = 10;
