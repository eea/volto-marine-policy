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

// Reporting cycles of Article 4. Only `2024` has a React renderer; the others
// fall back to the legacy server rendered explorer.
export const ARTICLE4_CYCLES = [
  { value: '2024', text: '2024-2030 reporting cycle' },
  { value: '2018', text: '2018-2024 reporting cycle' },
  { value: '2012', text: '2012-2018 reporting cycle' },
];
