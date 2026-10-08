import React from 'react';

import RangeSlider from './RangeSlider';

const toNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

// Numeric range facet (e.g. Area). The selection is a two element array of
// stringified numbers, ``[min, max]``, matching the API encoding `area=0,500`.
const FacetRange = ({ facet, value, onChange }) => {
  const min = toNumber(facet.min, 0);
  const max = toNumber(facet.max, 0);
  const low =
    value && value[0] !== undefined && value[0] !== ''
      ? toNumber(value[0], min)
      : min;
  const high =
    value && value[1] !== undefined && value[1] !== ''
      ? toNumber(value[1], max)
      : max;
  const step = facet.step || Math.max(1, Math.round((max - min) / 100));

  const commit = (next) => {
    onChange(facet.name, [String(next[0]), String(next[1])]);
  };

  const unit = facet.unit ? ` (${facet.unit})` : '';

  return (
    <div className="msfd-field msfd-field-range">
      <span className="msfd-field-label">{facet.label}</span>

      <RangeSlider
        min={min}
        max={max}
        step={step}
        value={[low, high]}
        onChange={commit}
      />

      <div className="msfd-range-values">
        <label className="msfd-range-value">
          <span>Min{unit}</span>
          <input
            type="number"
            min={min}
            max={max}
            value={low}
            onChange={(event) => commit([event.target.value, high])}
          />
        </label>
        <label className="msfd-range-value">
          <span>Max{unit}</span>
          <input
            type="number"
            min={min}
            max={max}
            value={high}
            onChange={(event) => commit([low, event.target.value])}
          />
        </label>
      </div>
    </div>
  );
};

export default FacetRange;
