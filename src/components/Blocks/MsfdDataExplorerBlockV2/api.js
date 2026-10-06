import axios from 'axios';
import qs from 'query-string';

export const getApiPath = () => {
  if (typeof window !== 'undefined' && window.env && window.env.apiPath) {
    return window.env.apiPath;
  }
  return '';
};

export const buildExplorerQuery = ({
  article,
  cycle,
  view,
  selections,
  page,
}) => {
  const params = { article, cycle, view };

  Object.entries(selections || {}).forEach(([name, values]) => {
    if (values && values.length) {
      params[name] = values;
    }
  });

  if (view === 'data' && page) {
    params.page = page;
  }

  // `arrayFormat: 'comma'` produces a single comma separated value per facet
  // (region_subregions=ANS,BAL), which the backend also accepts. This avoids
  // relying on however the server handles repeated query params.
  return qs.stringify(params, { arrayFormat: 'comma' });
};

export const fetchExplorer = (params) => {
  const query = buildExplorerQuery(params);

  return axios
    .get(`${getApiPath()}/++api++/@msfd-explorer?${query}`)
    .then((response) => response.data);
};
