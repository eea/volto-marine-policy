import React from 'react';
import { Icon, Loader, Message } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';

import { fetchExplorer } from '../api';
import { readUrlState, writeUrlState } from '../urlState';
import { DEFAULT_PAGE_SIZE } from '../constants';
import FilterPanel from '../components/FilterPanel';
import ExplorerTable from '../components/ExplorerTable';
import Pagination from '../components/Pagination';
import { downloadCsv } from '../csv';

const ARTICLE = '4';
const FETCH_DEBOUNCE = 200;

// Main content of the Article 4 explorer: the Filters panel and the Results
// table. The sidebar (reporting cycle, MSFD articles) is rendered by the block
// view, so this renderer only owns the filter/result state. The reporting cycle
// is a prop, so every cycle (2018, 2024) shares the exact same layout and only
// differs in the data the backend serves.
//
// Filters apply immediately: any facet change updates `selections`, which
// refetches both the option counts and the results (debounced). There is no
// explicit Apply step.
const Article4Explorer = (props) => {
  const { editable, sidebar, cycle } = props;
  const history = useHistory();
  const location = useLocation();

  // Read the initial state from the URL exactly once.
  const initialRef = React.useRef(null);
  if (initialRef.current === null) {
    initialRef.current = readUrlState(location.search);
  }

  const [selections, setSelections] = React.useState(
    initialRef.current.selections,
  );
  const [page, setPage] = React.useState(initialRef.current.page || 0);
  const [sort, setSort] = React.useState(null);
  const [dir, setDir] = React.useState('asc');

  const [filters, setFilters] = React.useState([]);
  const [data, setData] = React.useState({
    columns: [],
    rows: [],
    pagination: null,
  });
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [downloading, setDownloading] = React.useState(false);

  const selectionsKey = JSON.stringify(selections);

  // Every facet change refetches both the option lists and the results. The
  // page is reset so a narrower selection does not leave the user past the last
  // page.
  const updateSelections = React.useCallback((updater) => {
    setSelections(updater);
    setPage(0);
  }, []);

  // Cross filtering: refresh the option lists and their counts whenever the
  // selection changes. Debounced so typing in a search field does not fire a
  // request per keystroke.
  React.useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      fetchExplorer({
        article: ARTICLE,
        cycle,
        view: 'filters',
        selections: JSON.parse(selectionsKey),
      })
        .then((response) => {
          if (!cancelled) setFilters(response.filters || []);
        })
        .catch(() => {
          if (!cancelled) setFilters([]);
        });
    }, FETCH_DEBOUNCE);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cycle, selectionsKey]);

  // Results follow the selection, the page and the sort order.
  React.useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoadingData(true);
      setError(null);

      fetchExplorer({
        article: ARTICLE,
        cycle,
        view: 'data',
        selections: JSON.parse(selectionsKey),
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        sort,
        dir,
      })
        .then((response) => {
          if (!cancelled) setData(response);
        })
        .catch((err) => {
          if (cancelled) return;

          if (err && err.response && err.response.status === 503) {
            setError(
              'The MSFD database is not available, please try again later.',
            );
          } else {
            setError('Something went wrong.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingData(false);
        });
    }, FETCH_DEBOUNCE);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cycle, selectionsKey, page, sort, dir]);

  // Keep the shareable URL in sync with the selection and page. The article and
  // cycle are owned by the block view.
  React.useEffect(() => {
    if (editable) return;

    writeUrlState(history, location, {
      selections: JSON.parse(selectionsKey),
      page,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionsKey, page, editable]);

  const handleReplace = React.useCallback(
    (name, values) => {
      updateSelections((previous) => ({ ...previous, [name]: values }));
    },
    [updateSelections],
  );

  const handleToggle = React.useCallback(
    (name, value) => {
      updateSelections((previous) => {
        const values = new Set(previous[name] || []);

        if (values.has(value)) values.delete(value);
        else values.add(value);

        return { ...previous, [name]: Array.from(values) };
      });
    },
    [updateSelections],
  );

  const handleClearFacet = React.useCallback(
    (name) => {
      updateSelections((previous) => ({ ...previous, [name]: [] }));
    },
    [updateSelections],
  );

  const handleSelectAll = React.useCallback(
    (name, values) => {
      updateSelections((previous) => ({ ...previous, [name]: values }));
    },
    [updateSelections],
  );

  const handleInvert = React.useCallback(
    (name, values) => {
      updateSelections((previous) => {
        const selected = new Set(previous[name] || []);

        return {
          ...previous,
          [name]: values.filter((value) => !selected.has(value)),
        };
      });
    },
    [updateSelections],
  );

  const handleReset = React.useCallback(
    () => updateSelections({}),
    [updateSelections],
  );

  const handleSort = (key) => {
    if (sort === key) {
      setDir((value) => (value === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(key);
      setDir('asc');
    }

    setPage(0);
  };

  const handleDownload = () => {
    setDownloading(true);

    fetchExplorer({
      article: ARTICLE,
      cycle,
      view: 'data',
      selections: JSON.parse(selectionsKey),
      sort,
      dir,
      all: true,
    })
      .then((response) => {
        downloadCsv(
          response.columns,
          response.rows,
          `article-4-marine-units-${cycle}.csv`,
        );
      })
      .finally(() => setDownloading(false));
  };

  const hasRows = data.rows && data.rows.length;
  const total = data.pagination ? data.pagination.total : null;

  return (
    <div className="msfd-explorer-content">
      <div className="msfd-explorer-top">
        <FilterPanel
          filters={filters}
          draft={selections}
          onToggle={handleToggle}
          onReplace={handleReplace}
          onSelectAll={handleSelectAll}
          onClearFacet={handleClearFacet}
          onInvert={handleInvert}
          onReset={handleReset}
        />

        {sidebar}
      </div>

      <section className="msfd-panel msfd-results">
        <div className="msfd-panel-header msfd-results-header">
          <h2 className="msfd-panel-title">
            {total != null
              ? `${total} Marine Reporting Units found`
              : 'Marine Reporting Units'}
          </h2>

          <button
            type="button"
            className="msfd-download"
            disabled={downloading || !hasRows}
            onClick={handleDownload}
          >
            <Icon name="download" />
            Download results
          </button>
        </div>

        <div className="msfd-results-body">
          {error && !loadingData ? (
            <Message negative>{error}</Message>
          ) : loadingData ? (
            <Loader active inline="centered">
              Loading
            </Loader>
          ) : hasRows ? (
            <>
              <ExplorerTable
                columns={data.columns}
                rows={data.rows}
                groups={data.groups}
                groupBy={data.groupBy}
                sort={sort}
                dir={dir}
                onSort={handleSort}
                onView={() => {
                  // TODO: wire the per MRU detail view once a route exists.
                }}
              />
              <Pagination
                pagination={data.pagination}
                onPage={setPage}
                position="bottom"
              />
            </>
          ) : (
            <p className="msfd-no-data">No data reported</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Article4Explorer;
