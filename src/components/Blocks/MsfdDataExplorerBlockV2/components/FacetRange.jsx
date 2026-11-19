import React from 'react';

import { RANGE_NULL_TOKEN } from '../constants';
import RangeSlider from './RangeSlider';

// Token the backend appends to the selection while rows without a value
// (e.g. no determination date) are part of the result: `2019,2024,null`.
const NULL_TOKEN = RANGE_NULL_TOKEN;

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

  // The unit is spelled out in the accessible name ("Min (year)") but is not
  // repeated next to the boxes when the field label already carries it
  // ("Area (km²)"), which would only say the same thing twice.
  const unit = facet.unit ? ` (${facet.unit})` : '';
  const trailingUnit =
    facet.unit && !String(facet.label).includes(facet.unit) ? facet.unit : null;
  // Number inputs do not size to their content, so the pill grows with the
  // value instead of leaving a wide box around four digits.
  const widthOf = (number) => `${Math.max(2, String(number).length)}ch`;

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
          <span className="msfd-range-value-label" aria-hidden="true">
            Min
          </span>
          <input
            type="number"
            aria-label={`Min${unit}`}
            style={{ width: widthOf(low) }}
            min={min}
            max={max}
            value={low}
            onChange={(event) => commit([event.target.value, high])}
          />
        </label>
        <span className="msfd-range-sep" aria-hidden="true">
          –
        </span>
        <label className="msfd-range-value">
          <span className="msfd-range-value-label" aria-hidden="true">
            Max
          </span>
          <input
            type="number"
            aria-label={`Max${unit}`}
            style={{ width: widthOf(high) }}
            min={min}
            max={max}
            value={high}
            onChange={(event) => commit([low, event.target.value])}
          />
        </label>
        {trailingUnit ? (
          <span className="msfd-range-unit" aria-hidden="true">
            {trailingUnit}
          </span>
        ) : null}
        {hasNullOption ? (
          <label className="msfd-range-null">
            <input
              type="checkbox"
              checked={includeNull}
              onChange={(event) => commit([low, high], event.target.checked)}
            />
            {/* One text block, so the count stays with the sentence it counts when
              the label wraps. */}
            <span className="msfd-range-null-text">
              <span className="msfd-range-null-label">{nullOption.label}</span>
              {/* {typeof nullOption.count === 'number' ? (
                <span className="msfd-range-null-count">
                  ({nullOption.count})
                </span>
              ) : null} */}
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
};

export default FacetRange;
