import React from 'react';

// Dual thumb range slider built on two native range inputs. This keeps the
// control dependency free and both thumbs keyboard accessible; the rail and the
// selected segment are plain elements styled in the block's LESS.
//
// The rail sits inside `.msfd-range-track`, which is inset by half a thumb: a
// native range input keeps its thumb that far from either end of the element, so
// a full width rail would disagree with the thumb positions at both bounds by
// half a thumb (the fill would stop short of the thumb at the min and overshoot
// it at the max). With the track inset, the fill edges land exactly under the
// thumb centres.
const decimalsOf = (step) =>
  Number.isInteger(step) ? 0 : (String(step).split('.')[1] || '').length;

const RangeSlider = ({ min, max, step, value, onChange }) => {
  const [low, high] = value;
  const span = max - min || 1;
  const percent = (number) =>
    Math.min(100, Math.max(0, ((number - min) / span) * 100));
  const lowPercent = percent(low);
  const highPercent = percent(high);

  // Years and counts must not pick up thousands separators ("2.019").
  const decimals = decimalsOf(step);
  const format = (number) =>
    decimals ? number.toFixed(decimals) : String(Math.round(number));

  const handleLow = (event) => {
    const next = Math.min(Number(event.target.value), high);

    onChange([next, high]);
  };

  const handleHigh = (event) => {
    const next = Math.max(Number(event.target.value), low);

    onChange([low, next]);
  };

  return (
    <div className="msfd-range">
      <div className="msfd-range-slider">
        <div className="msfd-range-track" aria-hidden="true">
          <div
            className="msfd-range-fill"
            style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
          />
        </div>
        <input
          type="range"
          className="msfd-range-input msfd-range-input-low"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLow}
          aria-label="Minimum"
        />
        <input
          type="range"
          className="msfd-range-input msfd-range-input-high"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHigh}
          aria-label="Maximum"
        />
      </div>

      {/* The slide bounds, so the scale of the control is readable at a glance.
          The inputs below carry the editable values. */}
      <div className="msfd-range-bounds" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
