import React from 'react';
import { Icon } from 'semantic-ui-react';

import FacetDropdown from './FacetDropdown';
import FacetRange from './FacetRange';
import FacetText from './FacetText';
import FacetToggles from './FacetToggles';
import PanelLoader from './PanelLoader';

// Renders one facet with the widget matching its `type`; the backend decides
// the type, the frontend just maps it to a component.
const FacetField = ({ facet, draft, ...handlers }) => {
  const value = draft[facet.name];

  switch (facet.type) {
    case 'range':
      return <FacetRange facet={facet} value={value} {...handlers} />;
    case 'text':
      return <FacetText facet={facet} value={value} {...handlers} />;
    case 'toggles':
      return <FacetToggles facet={facet} selected={value} {...handlers} />;
    default:
      return <FacetDropdown facet={facet} selected={value} {...handlers} />;
  }
};

// The Filters section of the explorer: a responsive grid of facet widgets. The
// filters apply immediately, so there is no Apply button; only a Reset link.
// The first load shows a centered loader; later refetches (auto-apply) keep the
// grid in place and only spin a small icon in the header, so the widgets the
// user is interacting with are never covered or unmounted.
const FilterPanel = ({
  filters,
  draft,
  loading,
  onToggle,
  onReplace,
  onSelectAll,
  onClearFacet,
  onInvert,
  onReset,
}) => {
  return (
    <section className="msfd-panel msfd-filters">
      <div className="msfd-panel-header">
        <h2 className="msfd-panel-title">
          <Icon name="filter" />
          Filters
        </h2>

        <div className="msfd-panel-actions">
          {loading && filters.length > 0 && (
            <span className="msfd-refreshing" title="Updating filters">
              <Icon name="spinner" loading />
            </span>
          )}

          <button type="button" className="msfd-link" onClick={onReset}>
            <Icon name="undo" />
            Reset filters
          </button>
        </div>
      </div>

      {loading && !filters.length ? (
        <PanelLoader />
      ) : (
        <div className="msfd-filters-grid">
          {filters.map((facet) => (
            <FacetField
              key={facet.name}
              facet={facet}
              draft={draft}
              onChange={onReplace}
              onToggle={onToggle}
              onSelectAll={onSelectAll}
              onClearFacet={onClearFacet}
              onInvert={onInvert}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FilterPanel;
