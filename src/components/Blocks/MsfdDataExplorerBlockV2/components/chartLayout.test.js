import {
  BASE_CHART_HEIGHT,
  categoricalTicks,
  horizontalLayout,
  verticalLayout,
} from './chartLayout';

describe('chartLayout', () => {
  describe('categoricalTicks', () => {
    it('keeps every label when there are at most 10 categories', () => {
      expect(categoricalTicks(['a', 'b', 'c'])).toEqual({});
    });

    it('thins labels down to 10 evenly spaced values', () => {
      const labels = Array.from({ length: 30 }, (_, i) => `label-${i}`);
      const ticks = categoricalTicks(labels);

      expect(ticks.tickmode).toBe('array');
      expect(ticks.tickvals).toHaveLength(10);
      expect(ticks.tickvals[0]).toBe('label-0');
      expect(ticks.tickvals[ticks.tickvals.length - 1]).toBe('label-29');
    });
  });

  describe('horizontalLayout', () => {
    it('uses the full font size and base height for short lists', () => {
      expect(horizontalLayout(4)).toEqual({
        fontSize: 12,
        tickangle: 0,
        height: BASE_CHART_HEIGHT,
      });
      expect(horizontalLayout(10)).toEqual({
        fontSize: 12,
        tickangle: 0,
        height: BASE_CHART_HEIGHT,
      });
    });

    it('shrinks the font as the number of categories grows', () => {
      const sizes = [10, 20, 30, 40, 60].map(
        (count) => horizontalLayout(count).fontSize,
      );

      expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
      expect(sizes[0]).toBeGreaterThan(sizes[sizes.length - 1]);
      expect(sizes[sizes.length - 1]).toBe(9);
    });

    it('grows the chart height so every label keeps its row', () => {
      const short = horizontalLayout(4);
      const long = horizontalLayout(34);

      expect(long.height).toBeGreaterThan(short.height);
      // ~1.7x the font size per row plus the surrounding padding.
      expect(long.height).toBeGreaterThan(34 * long.fontSize);
    });
  });

  describe('verticalLayout', () => {
    it('keeps short category lists horizontal and unrotated', () => {
      expect(verticalLayout(4)).toEqual({
        fontSize: 12,
        tickangle: 0,
        height: BASE_CHART_HEIGHT,
      });
    });

    it('shrinks and rotates the labels once there are many categories', () => {
      const layout = verticalLayout(34);

      expect(layout.fontSize).toBeLessThan(12);
      expect(layout.tickangle).toBe(-45);
      expect(layout.height).toBeGreaterThan(BASE_CHART_HEIGHT);
    });
  });
});
