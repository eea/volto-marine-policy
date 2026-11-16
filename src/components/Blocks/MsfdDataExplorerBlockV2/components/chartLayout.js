// Layout helpers for the Summary & insights bar charts.
//
// Plotly labels every category on a categorical axis by default, which is
// unreadable once there are many MRU size bins or regions. The treatment
// depends on where the categories sit:
//
//   x (vertical bars)  labels run into each other horizontally, so the default
//                      charts keep every bar but show only MAX_TICKS evenly
//                      spaced labels. An article that forces a country chart
//                      onto x keeps all labels, shrinking and rotating them.
//   y (horizontal bars) show every label, shrink the font as the list grows
//                      and grow the chart so the rows never overlap.
import { scaleLinear } from 'd3-scale';

const MAX_TICKS = 10;

export const BASE_CHART_HEIGHT = 260;

const MIN_AXIS_FONT = 9;
const MAX_AXIS_FONT = 12;
// Space between two category labels, expressed in multiples of the font size.
const ROW_HEIGHT_RATIO = 1.7;
// Room for the chart margins (title area is outside the plot, axis labels are
// inside the grid) around the category rows.
const VERTICAL_PADDING = 56;

export const categoricalTicks = (labels) => {
  if (labels.length <= MAX_TICKS) return {};

  const values = [];
  const seen = new Set();

  for (let i = 0; i < MAX_TICKS; i += 1) {
    const index = Math.round((i * (labels.length - 1)) / (MAX_TICKS - 1));
    const label = labels[index];

    if (!seen.has(label)) {
      seen.add(label);
      values.push(label);
    }
  }

  return { tickmode: 'array', tickvals: values, ticktext: values };
};

// Full size up to MAX_TICKS categories, then a gentle decrease down to
// MIN_AXIS_FONT for long lists (all MSFD countries plus the regional seas).
export const categoryAxisFont = scaleLinear()
  .domain([MAX_TICKS, 40])
  .range([MAX_AXIS_FONT, MIN_AXIS_FONT])
  .clamp(true);

const roundFont = (count) => Math.round(categoryAxisFont(count) * 10) / 10;

// Font size and height for a horizontal (categories on y) chart with `count`
// rows. The height follows the font so labels keep their spacing. The height is
// a minimum: the chart is stretched to the card it sits in (see
// SummaryInsights' useFillHeight).
export const horizontalLayout = (count) => {
  const fontSize = roundFont(count);

  return {
    fontSize,
    tickangle: 0,
    height: Math.max(
      BASE_CHART_HEIGHT,
      Math.round(count * fontSize * ROW_HEIGHT_RATIO + VERTICAL_PADDING),
    ),
  };
};

// Font size, rotation and height for a vertical chart whose categories sit on
// x (e.g. countries). Every label is kept; once there are more than MAX_TICKS
// of them the font shrinks and the labels rotate so they do not overlap.
export const verticalLayout = (count) => {
  const rotated = count > MAX_TICKS;

  return {
    fontSize: roundFont(count),
    tickangle: rotated ? -45 : 0,
    // Extra height so the rotated labels do not eat into the plot area.
    height: rotated ? BASE_CHART_HEIGHT + 80 : BASE_CHART_HEIGHT,
  };
};
