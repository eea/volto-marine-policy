import React from 'react';
import { Icon } from 'semantic-ui-react';

import { RANGE_NULL_TOKEN } from '../constants';

const optionLabel = (facet, value) => {
  const option = (facet.options || []).find((item) => item.value === value);

  return option ? option.label : value;
};

// The current selection as one removable chip per chosen value, in the order
// the facets are displayed. A range facet is a single chip on its bounds
// ("2008 – 2025"); every other facet contributes one chip per selected value,
// because a value is what the user can remove. A range chip carries
// `value: null`, meaning "remove the whole facet selection".
export const buildChips = (filters = [], selections = {}) => {
  const chips = [];

  filters.forEach((facet) => {
    const selected = selections[facet.name];

    if (!selected || !selected.length) return;

    if (facet.type === 'range') {
      const bounds = selected.filter((value) => value !== RANGE_NULL_TOKEN);

      if (!bounds.length) return;

      chips.push({
        facet,
        value: null,
        key: facet.name,
        label: bounds.join(' – '),
        title: `${facet.label}: ${bounds.join(' – ')}`,
      });

      return;
    }

    selected.forEach((value) => {
      const label = optionLabel(facet, value);

      chips.push({
        facet,
        value,
        label,
        title: `${facet.label}: ${label}`,
        key: `${facet.name}:${value}`,
      });
    });
  });

  return chips;
};

// The Applied filters row at the bottom of the Filters panel: a chip per
// active value with its own remove button, plus one "Clear all". It is a
// summary of the widgets above (removing a chip runs the same toggle as
// unchecking the option), never a separate source of state.
const AppliedFilters = ({ chips, onToggle, onClearFacet, onReset }) => {
  if (!chips.length) return null;

  const remove = (chip) => {
    if (chip.value === null) {
      onClearFacet(chip.facet.name);

      return;
    }

    onToggle(chip.facet.name, chip.value);
  };

  return (
    <div className="msfd-applied">
      <span className="msfd-applied-label">
        <Icon name="info circle" />
        Active filters:
      </span>

      <ul className="msfd-applied-chips">
        {chips.map((chip) => (
          <li key={chip.key} className="msfd-applied-chip">
            <span className="msfd-applied-chip-text" title={chip.title}>
              {chip.label}
            </span>
            <button
              type="button"
              className="msfd-applied-chip-remove"
              aria-label={`Remove ${chip.title}`}
              onClick={() => remove(chip)}
            >
              <Icon name="close" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="msfd-link msfd-applied-clear"
        onClick={onReset}
      >
        Clear all
      </button>
    </div>
  );
};

export default AppliedFilters;
