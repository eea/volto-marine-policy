import React from 'react';

import RangeSlider from './RangeSlider';

// Token the backend appends to the selection while rows without a value
// (e.g. no determination date) are part of the result: `2019,2024,null`.
const NULL_TOKEN = 'null';

const toNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

// Numeric range facet (e.g. Area). The selection is a two element array of
// stringified numbers, ``[min, max]``, matching the API encoding `area=0,500`.
//
// Some ranges are over a value many rows simply do not report (e.g. the
// Article 9 determination date). A range comparison silently drops those rows,
// so the facet may carry an extra toggle (`nullOption`) that keeps them; the
// backend enables it by default. While it is on, the selection carries one
// more token, ``null``.
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

  const nullOption = facet.nullOption;
  const hasNullOption = Boolean(nullOption);
  // No selection yet means the untouched, default state: the backend then
  // keeps the rows without a value, so the toggle starts checked.
  const includeNull = hasNullOption
    ? value
      ? value.includes(NULL_TOKEN)
      : Boolean(nullOption.selected)
    : false;

  const commit = (next, keepNull = includeNull) => {
    const values = [String(next[0]), String(next[1])];

    if (hasNullOption && keepNull) values.push(NULL_TOKEN);

    onChange(facet.name, values);
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

      {hasNullOption ? (
        <label className="msfd-range-null">
          <input
            type="checkbox"
            checked={includeNull}
            onChange={(event) => commit([low, high], event.target.checked)}
          />
          <span className="msfd-range-null-label">{nullOption.label}</span>
          {typeof nullOption.count === 'number' ? (
            <span className="msfd-range-null-count">({nullOption.count})</span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
};

export default FacetRange;
