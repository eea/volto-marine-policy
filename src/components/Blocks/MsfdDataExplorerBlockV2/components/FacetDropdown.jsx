import React from 'react';
import { Icon, Input } from 'semantic-ui-react';

const INITIAL_VISIBLE = 10;
const SEARCH_THRESHOLD = 7;

// One multi-select facet, rendered as a dropdown with the current selection as
// removable chips inside the trigger. The option list shows cross-filtered
// counts and offers bulk actions. The visual matches the mockup's combobox.
const FacetDropdown = ({
  facet,
  selected,
  onToggle,
  onClearFacet,
  onSelectAll,
  onInvert,
}) => {
  const { name, label, options } = facet;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selectedValues = selected || [];
  const selectedSet = new Set(selectedValues);
  const allValues = options.map((option) => option.value);
  const searching = query.trim().length > 0;

  const labelFor = (value) => {
    const option = options.find((item) => item.value === value);

    return option ? option.label : value;
  };

  const ordered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? options.filter((option) =>
          (option.label || '').toLowerCase().includes(needle),
        )
      : options;

    return [...matching].sort((a, b) => {
      const aSelected = selectedSet.has(a.value);
      const bSelected = selectedSet.has(b.value);

      if (aSelected !== bSelected) return aSelected ? -1 : 1;

      return (a.label || '').localeCompare(b.label || '');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query, selectedValues.join('|')]);

  const visible =
    searching || expanded ? ordered : ordered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = ordered.length - visible.length;

  return (
    <div className="msfd-field">
      <span className="msfd-field-label">{label}</span>

      <div className="msfd-multiselect" ref={ref}>
        <div
          className={`msfd-multiselect-trigger ${open ? 'is-open' : ''}`}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen((value) => !value);
            }
          }}
        >
          {selectedValues.length ? (
            <span className="msfd-chips">
              {selectedValues.map((value) => (
                <span className="msfd-chip" key={value}>
                  <span className="msfd-chip-text">{labelFor(value)}</span>
                  <button
                    type="button"
                    className="msfd-chip-remove"
                    aria-label={`Remove ${labelFor(value)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggle(name, value);
                    }}
                  >
                    <Icon name="close" />
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className="msfd-multiselect-placeholder">All</span>
          )}

          <Icon name={open ? 'chevron up' : 'chevron down'} />
        </div>

        {open ? (
          <div className="msfd-multiselect-panel">
            <div className="msfd-multiselect-controls">
              <button
                type="button"
                className="msfd-inline-action"
                onClick={() => onSelectAll(name, allValues)}
              >
                All
              </button>
              <button
                type="button"
                className="msfd-inline-action"
                onClick={() => onClearFacet(name)}
              >
                Clear
              </button>
              <button
                type="button"
                className="msfd-inline-action"
                onClick={() => onInvert(name, allValues)}
              >
                Invert
              </button>
            </div>

            {options.length > SEARCH_THRESHOLD ? (
              <Input
                className="msfd-multiselect-search"
                size="small"
                icon="search"
                placeholder="Quick search"
                value={query}
                onChange={(event, data) => setQuery(data.value)}
              />
            ) : null}

            <ul className="msfd-multiselect-options">
              {visible.map((option) => (
                <li
                  key={option.value}
                  className={`msfd-multiselect-option ${
                    selectedSet.has(option.value) ? 'is-selected' : ''
                  }`}
                >
                  <label className="msfd-multiselect-option-row">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(option.value)}
                      onChange={() => onToggle(name, option.value)}
                    />
                    <span className="msfd-multiselect-option-text">
                      {option.label}
                    </span>
                    <span className="msfd-multiselect-option-count">
                      {option.count}
                    </span>
                  </label>
                </li>
              ))}

              {!visible.length ? (
                <li className="msfd-multiselect-empty">No matching options</li>
              ) : null}
            </ul>

            {hiddenCount > 0 ? (
              <button
                type="button"
                className="msfd-multiselect-more"
                onClick={() => setExpanded(true)}
              >
                Show {hiddenCount} more
              </button>
            ) : null}

            {expanded && !searching && ordered.length > INITIAL_VISIBLE ? (
              <button
                type="button"
                className="msfd-multiselect-more"
                onClick={() => setExpanded(false)}
              >
                Show less
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FacetDropdown;
