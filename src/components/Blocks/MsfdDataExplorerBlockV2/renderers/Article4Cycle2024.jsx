import React from 'react';
import { Button, Loader, Message } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';

import { fetchExplorer } from '../api';
import { readUrlState, writeUrlState } from '../urlState';
import FacetPanel from '../components/FacetPanel';
import ExplorerTable from '../components/ExplorerTable';
import Pagination from '../components/Pagination';

const ARTICLE = '4';
const CYCLE = '2024';

const MsfdDataExplorerArticle4Cycle2024 = (props) => {
  const { editable } = props;
  const history = useHistory();
  const location = useLocation();

  // Read the initial state from the URL exactly once.
  const initialRef = React.useRef(null);
  if (initialRef.current === null) {
    initialRef.current = readUrlState(location.search);
  }

  // `draft` is what the checkboxes show, `applied` is what the table shows.
  const [draft, setDraft] = React.useState(initialRef.current.selections);
  const [applied, setApplied] = React.useState(initialRef.current.selections);
  const [page, setPage] = React.useState(initialRef.current.page || 0);

  const [filters, setFilters] = React.useState([]);
  const [data, setData] = React.useState({
    columns: [],
    rows: [],
    pagination: null,
    meta: {},
  });
  const [loadingFilters, setLoadingFilters] = React.useState(true);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  const draftKey = JSON.stringify(draft);
  const appliedKey = JSON.stringify(applied);

  // Cross filtering: refresh the option lists and their counts whenever the
  // draft selection changes.
  React.useEffect(() => {
    let cancelled = false;
    setLoadingFilters(true);

    fetchExplorer({
      article: ARTICLE,
      cycle: CYCLE,
      view: 'filters',
      selections: JSON.parse(draftKey),
    })
      .then((response) => {
        if (!cancelled) setFilters(response.filters || []);
      })
      .catch(() => {
        if (!cancelled) setFilters([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFilters(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  // Data is only fetched on Apply or when paging.
  React.useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    setError(null);

    fetchExplorer({
      article: ARTICLE,
      cycle: CYCLE,
      view: 'data',
      selections: JSON.parse(appliedKey),
      page,
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

    return () => {
      cancelled = true;
    };
  }, [appliedKey, page]);

  // Keep the shareable URL in sync with the applied state.
  React.useEffect(() => {
    if (editable) return;

    writeUrlState(history, location, {
      article: ARTICLE,
      selections: JSON.parse(appliedKey),
      page,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKey, page, editable]);

  const handleToggle = React.useCallback((name, value) => {
    setDraft((previous) => {
      const values = new Set(previous[name] || []);

      if (values.has(value)) values.delete(value);
      else values.add(value);

      return { ...previous, [name]: Array.from(values) };
    });
  }, []);

  const handleSelect = React.useCallback((name, values) => {
    setDraft((previous) => ({ ...previous, [name]: values || [] }));
  }, []);

  const handleApply = () => {
    setApplied(draft);
    setPage(0);
  };

  if (error && !loadingData) {
    return <Message negative>{error}</Message>;
  }

  const hasRows = data.rows && data.rows.length;

  return (
    <div className="msfd-explorer-v2-cycle">
      <div className="controls">
        <div className="msfd-facets">
          {filters.map((facet) => (
            <FacetPanel
              key={facet.name}
              facet={facet}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <Button
          primary
          className="apply-filters"
          disabled={loadingFilters}
          onClick={handleApply}
        >
          Apply filters
        </Button>
      </div>

      {loadingData ? (
        <Loader active inline="centered">
          Loading
        </Loader>
      ) : (
        <div className="item-subform subform">
          <Pagination
            pagination={data.pagination}
            onPage={setPage}
            position="top"
          />

          {hasRows ? (
            <>
              <div id="item-title-wrapper">
                <h3 id="article-id">
                  <span className="article-id-country">
                    {data.meta ? data.meta.country : ''}
                  </span>
                  <span className="article-id-article">
                    {(data.meta && data.meta.recordTitle) ||
                      'Article 4 (Marine Units)'}
                  </span>
                </h3>
                <div className="reported-date">
                  <b>Reported on </b>
                  <span>{data.meta ? data.meta.reportedDate : ''}</span>
                </div>
              </div>

              <div id="form-data-primary">
                <ExplorerTable columns={data.columns} rows={data.rows} />
              </div>
            </>
          ) : (
            <h4>No data reported</h4>
          )}

          <Pagination
            pagination={data.pagination}
            onPage={setPage}
            position="bottom"
          />
        </div>
      )}
    </div>
  );
};

export default MsfdDataExplorerArticle4Cycle2024;
