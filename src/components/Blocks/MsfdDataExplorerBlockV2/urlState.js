const PREFIX = 'msfd_';
const RESERVED = ['article', 'cycle', 'page'];

const isExplorerKey = (key) => key.startsWith(PREFIX);

// Reads the explorer state (article, cycle, page and facet selections) from a
// location search string. Selections are stored as comma separated values.
export const readUrlState = (search) => {
  const params = new URLSearchParams(search || '');
  const state = { article: null, cycle: null, page: 0, selections: {} };

  params.forEach((value, key) => {
    if (!isExplorerKey(key)) return;

    const name = key.slice(PREFIX.length);

    if (name === 'article') state.article = value;
    else if (name === 'cycle') state.cycle = value;
    else if (name === 'page') state.page = parseInt(value, 10) || 0;
    else state.selections[name] = value.split(',').filter(Boolean);
  });

  return state;
};

// Merges the given patch into the current URL, leaving unrelated query params
// and unrelated explorer keys untouched.
export const writeUrlState = (history, location, patch) => {
  const params = new URLSearchParams(location.search || '');

  if (patch.article != null) {
    params.set(`${PREFIX}article`, patch.article);
  }

  if (patch.cycle != null) {
    params.set(`${PREFIX}cycle`, patch.cycle);
  }

  if (patch.page != null) {
    if (patch.page) params.set(`${PREFIX}page`, String(patch.page));
    else params.delete(`${PREFIX}page`);
  }

  if (patch.selections != null) {
    Array.from(params.keys())
      .filter(
        (key) =>
          isExplorerKey(key) && !RESERVED.includes(key.slice(PREFIX.length)),
      )
      .forEach((key) => params.delete(key));

    Object.entries(patch.selections).forEach(([name, values]) => {
      if (values && values.length)
        params.set(`${PREFIX}${name}`, values.join(','));
    });
  }

  const search = params.toString();

  history.replace({
    pathname: location.pathname,
    search: search ? `?${search}` : '',
    hash: location.hash,
  });
};
