import React from 'react';
import { Icon } from 'semantic-ui-react';

import FacetDropdown from './FacetDropdown';
import FacetRange from './FacetRange';
import FacetText from './FacetText';
import FacetToggles from './FacetToggles';

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
const FilterPanel = ({
  filters,
  draft,
  onToggle,
  onReplace,
  onSelectAll,
  onClearFacet,
  onInvert,
  onReset,
}) => {
  if (!filters.length) return null;

  return (
    <section className="msfd-panel msfd-filters">
      <div className="msfd-panel-header">
        <h2 className="msfd-panel-title">
          <Icon name="filter" />
          Filters
        </h2>

        <button type="button" className="msfd-link" onClick={onReset}>
          <Icon name="undo" />
          Reset filters
        </button>
      </div>

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
    </section>
  );
};

export default FilterPanel;
