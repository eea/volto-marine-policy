import React from 'react';

// Dual thumb range slider built on two native range inputs. This keeps the
// control dependency free and both thumbs keyboard accessible; the visual rail
// is drawn with plain elements and styled in the block's LESS.
const RangeSlider = ({ min, max, step, value, onChange }) => {
  const [low, high] = value;
  const span = max - min || 1;
  const lowPercent = Math.min(100, Math.max(0, ((low - min) / span) * 100));
  const highPercent = Math.min(100, Math.max(0, ((high - min) / span) * 100));

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
      <div className="msfd-range-rail" />
      <div
        className="msfd-range-fill"
        style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
      />
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
  );
};

export default RangeSlider;
