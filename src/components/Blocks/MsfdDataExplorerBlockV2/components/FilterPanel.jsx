import React from 'react';
import { Icon } from 'semantic-ui-react';

// import AppliedFilters, { buildChips } from './AppliedFilters';
import FacetDropdown from './FacetDropdown';
import FacetRange from './FacetRange';
import FacetText from './FacetText';
import FacetToggles from './FacetToggles';
import PanelLoader from './PanelLoader';

// Facets the backend did not put in a group (or put in one this build does not
// know) still render, in a trailing band, so a new facet is never lost.
const FALLBACK_GROUP = { key: 'other', label: 'Other filters', order: 1000 };

// One icon per group key. The backend owns the grouping (it knows what a facet
// means); the frontend only owns how a group looks, so an unknown key falls
// back to a generic icon instead of breaking the band.
const GROUP_ICONS = {
  location: 'globe',
  assessment: 'bar chart',
  unit: 'tint',
  legislation: 'balance scale',
  time: 'calendar',
};
const DEFAULT_GROUP_ICON = 'filter';

// Buckets the facets into the groups the backend assigned, keeping the facet
// order within a group and sorting the groups by their `order`. Facets sharing
// a group need not be adjacent in the payload.
export const groupFacets = (filters = []) => {
  const groups = new Map();

  filters.forEach((facet) => {
    const group = facet.group || FALLBACK_GROUP;
    const key = group.key || FALLBACK_GROUP.key;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: group.label || FALLBACK_GROUP.label,
        order:
          typeof group.order === 'number' ? group.order : FALLBACK_GROUP.order,
        facets: [],
      });
    }

    groups.get(key).facets.push(facet);
  });

  return [...groups.values()].sort((a, b) => a.order - b.order);
};

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

// The Filters section of the explorer: the facets grouped in titled bands
// (Geographical, Assessment, Marine reporting unit, Legislation, Time - the
// grouping comes from the API, see `providers/groups.py`), one band per group
// and a responsive grid of widgets inside it. The Applied filters row at the
// bottom summarises the selection as removable chips.
//
// The filters apply immediately, so there is no Apply button; only a Reset
// link. The first load shows a centered loader; later refetches (auto-apply)
// keep the grid in place and only spin a small icon in the header, so the
// widgets the user is interacting with are never covered or unmounted.
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
  const groups = React.useMemo(() => groupFacets(filters), [filters]);
  // One chip per removable value, so the badge counts what the user can see
  // and undo in the Applied filters row.
  // const chips = React.useMemo(
  //   () => buildChips(filters, draft),
  //   [filters, draft],
  // );

  return (
    <section className="msfd-panel msfd-filters">
      <div className="msfd-panel-header">
        <h2 className="msfd-panel-title">
          <Icon name="filter" />
          Filters
          {/* {chips.length ? (
            <span className="msfd-filters-badge">{chips.length} active</span>
          ) : null} */}
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
        <div className="msfd-filters-body">
          {groups.map((group) => (
            <section
              key={group.key}
              className="msfd-filter-group"
              aria-labelledby={`msfd-filter-group-${group.key}`}
            >
              <h3
                className="msfd-filter-group-title"
                id={`msfd-filter-group-${group.key}`}
              >
                <Icon name={GROUP_ICONS[group.key] || DEFAULT_GROUP_ICON} />
                {group.label}
              </h3>

              <div
                className={`msfd-filters-grid${
                  group.facets.length === 1 && group.facets[0].type === 'range'
                    ? ' is-wide'
                    : ''
                }`}
              >
                {group.facets.map((facet) => (
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
          ))}
        </div>
      )}

      {/* <AppliedFilters
        chips={chips}
        onToggle={onToggle}
        onClearFacet={onClearFacet}
        onReset={onReset}
      /> */}
    </section>
  );
};

export default FilterPanel;
