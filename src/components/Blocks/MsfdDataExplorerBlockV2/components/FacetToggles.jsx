import React from 'react';

// Checkbox facet rendered as a group of toggle buttons (e.g. the legislation
// short name). Same selection semantics as the dropdown facet but always
// visible, so a short option list needs no extra click.
const FacetToggles = ({ facet, selected, onToggle }) => {
  const selectedSet = new Set(selected || []);

  return (
    <div className="msfd-field">
      <span className="msfd-field-label">{facet.label}</span>

      <div className="msfd-toggles">
        {facet.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`msfd-toggle ${
              selectedSet.has(option.value) ? 'is-selected' : ''
            }`}
            aria-pressed={selectedSet.has(option.value)}
            title={`${option.label} (${option.count})`}
            onClick={() => onToggle(facet.name, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FacetToggles;
