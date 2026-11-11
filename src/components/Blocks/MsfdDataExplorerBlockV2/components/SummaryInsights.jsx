import React from 'react';
import loadable from '@loadable/component';
import { Icon } from 'semantic-ui-react';

import PanelLoader from './PanelLoader';
import {
  BASE_CHART_HEIGHT,
  categoricalTicks,
  horizontalLayout,
  verticalLayout,
} from './chartLayout';

// Plotly is heavy; load it (bar-only build, see ./plotlyBars) only when the
// summary panel actually renders. It is loaded client-side only: plotly.js
// reaches for `window`, so rendering/importing it during SSR would block the
// first paint.
const Plot = loadable(() => import('./plotlyBars'), {
  ssr: false,
  fallback: <div className="msfd-summary-chart-loading" />,
});

// WISE Marine secondary colour (blue-3 of the EEA Design System palette).
const CHART_COLOR = '#0079CF';

// The backend sends raw numbers and the unit separately, so all formatting
// lives here (no decimals, thousands separators) in one place.
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const number = Number(value);

  if (Number.isNaN(number)) return null;

  return number.toLocaleString('en-GB', { maximumFractionDigits: 0 });
};

const valueText = (value, unit) => {
  const text = formatNumber(value);

  if (text === null) return '-';

  return unit ? `${text} ${unit}` : text;
};

const cardValue = (card) => {
  const base = valueText(card.value, card.unit);

  if (card.valueOf === null || card.valueOf === undefined) return base;

  return `${base} / ${formatNumber(card.valueOf)}`;
};

const InfoHint = ({ hint }) =>
  hint ? (
    <span className="msfd-summary-hint" title={hint}>
      <Icon name="info circle" />
    </span>
  ) : null;

// Charts share a grid row, so the shorter one is stretched by its neighbour and
// the card ends up taller than the chart it contains. Measure the plot box and
// hand the resulting pixel height to Plotly instead of a height computed from
// the number of categories: every chart then fills its `.msfd-summary-chart`
// card down to the bottom border. The CSS `min-height` keeps the box from
// collapsing before the first measurement (and is the chart's own height when
// the card is not stretched).
const useFillHeight = (minHeight) => {
  const plotRef = React.useRef(null);
  const [measured, setMeasured] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = plotRef.current;

    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => {
      const height = Math.round(node.clientHeight);

      if (height > 0) {
        setMeasured((current) => (current === height ? current : height));
      }
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return [plotRef, Math.max(minHeight, measured)];
};

// One bar chart. `orientation` is 'v' (size distribution: categories on x) or
// 'h' (per region: categories on y); the value axis gets integer ticks.
// `options` are the per-chart overrides returned by
// `config.summaryChartOptions(chart)`; `options.orientation` lets an article
// reverse the orientation the backend picked for one chart (the Article 7
// "by Country" chart wants countries on x).
const SummaryChart = ({ chart, options }) => {
  const points = chart.points || [];
  const labels = points.map((point) => point.label);
  const values = points.map((point) => point.value);
  const horizontal =
    ((options && options.orientation) || chart.orientation) === 'h';
  // Charts placed with categories on y keep every label, growing the height and
  // shrinking the font as the list gets longer. A vertical chart only does the
  // same when the article explicitly forces that orientation; the default
  // vertical charts (size bins) still thin their labels out.
  const forcedVertical = !horizontal && Boolean(options && options.orientation);
  const categoryStyle = horizontal
    ? horizontalLayout(labels.length)
    : forcedVertical
    ? verticalLayout(labels.length)
    : null;
  const ticks = categoryStyle ? {} : categoricalTicks(labels);
  const minHeight = categoryStyle ? categoryStyle.height : BASE_CHART_HEIGHT;
  const [plotRef, height] = useFillHeight(minHeight);
  // A chart forced from horizontal to vertical keeps the backend labels in
  // their roles: xLabel describes the counts, yLabel the categories.
  const flipped = !horizontal && chart.orientation === 'h';
  const valueLabel = horizontal || flipped ? chart.xLabel : chart.yLabel;
  const categoryLabel = horizontal || flipped ? chart.yLabel : chart.xLabel;

  const trace = {
    type: 'bar',
    orientation: horizontal ? 'h' : 'v',
    x: horizontal ? values : labels,
    y: horizontal ? labels : values,
    marker: { color: CHART_COLOR },
    hoverlabel: { bgcolor: '#004b7f', font: { color: '#ffffff' } },
  };

  // Exactly one axis is numeric (the value axis) and one is categorical. The
  // value axis gets a bounded number of comma-formatted integer ticks; without
  // an explicit bound Plotly (or a `dtick: 1`) can draw hundreds of tiny tick
  // labels. The categorical axis keeps its categories but only a styled chart
  // (see chartLayout) shows every one of them.
  const valueAxis = {
    title: {
      text: valueLabel || '',
      standoff: 8,
    },
    zeroline: false,
    gridcolor: '#e6ecf1',
    nticks: 10,
    tickformat: ',d',
  };

  const categoryAxis = {
    title: {
      text: categoryLabel || '',
      standoff: 8,
    },
    zeroline: false,
    gridcolor: 'rgba(0,0,0,0)',
    automargin: true,
    // Category labels shrink with their number; on x they may also rotate.
    ...(categoryStyle
      ? {
          tickfont: { size: categoryStyle.fontSize },
          tickangle: categoryStyle.tickangle,
        }
      : {}),
    ...ticks,
  };

  const layout = {
    margin: { t: 10, r: 12, b: 44, l: 54 },
    height,
    bargap: 0.42,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: "'Roboto', 'Helvetica Neue', Arial, Helvetica, sans-serif",
      size: 12,
      color: '#3d5265',
    },
    // Vertical bars put categories on x; horizontal bars put them on y.
    xaxis: horizontal ? valueAxis : categoryAxis,
    yaxis: horizontal ? categoryAxis : valueAxis,
  };

  return (
    <div className="msfd-summary-chart">
      <h3 className="msfd-summary-chart-title">
        <span>{chart.title}</span>
        <InfoHint hint={chart.hint} />
      </h3>
      <div
        className="msfd-summary-chart-plot"
        ref={plotRef}
        style={{ minHeight: `${minHeight}px` }}
      >
        <Plot
          data={[trace]}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
    </div>
  );
};

// The Summary & insights panel. Fully driven by the backend `summary` payload
// ({cards, charts}), so a different article/cycle can show different data
// without touching this component. `chartOptions(chart)` may return per-chart
// display overrides; the Hide toggle is local UI state. While the summary
// request is in flight the panel renders with a loader.
const SummaryInsights = ({ summary, loading, chartOptions }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  // Nothing to show once the request finished without data (e.g. an error).
  if (!loading && !summary) return null;

  const cards = (summary && summary.cards) || [];
  const charts = (summary && summary.charts) || [];

  return (
    <section className="msfd-panel msfd-summary">
      <div className="msfd-panel-header">
        <h2 className="msfd-panel-title">
          <Icon name="chart bar" />
          Summary &amp; insights
        </h2>

        {!loading && summary && (
          <button
            type="button"
            className="msfd-link msfd-summary-toggle"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? 'Show' : 'Hide'}
            <Icon name={collapsed ? 'chevron down' : 'chevron up'} />
          </button>
        )}
      </div>

      <div className="msfd-panel-body">
        {summary && !collapsed ? (
          <div className="msfd-summary-body">
            <div className="msfd-summary-cards">
              {cards.map((card) => (
                <div className="msfd-summary-card" key={card.key}>
                  <span className="msfd-summary-card-icon">
                    <Icon name={card.icon} />
                  </span>

                  <div className="msfd-summary-card-content">
                    <span className="msfd-summary-card-label">
                      <span>{card.label}</span>
                      <InfoHint hint={card.hint} />
                    </span>

                    <span className="msfd-summary-card-value">
                      {cardValue(card)}
                    </span>

                    {card.details && card.details.length > 0 && (
                      <span className="msfd-summary-card-details">
                        {card.details.map((detail, index) => (
                          <React.Fragment key={detail.label}>
                            {index > 0 && (
                              <span className="msfd-summary-card-sep">|</span>
                            )}
                            <span>
                              {detail.label}:{' '}
                              {valueText(detail.value, detail.unit)}
                            </span>
                          </React.Fragment>
                        ))}
                      </span>
                    )}

                    {card.caption && (
                      <span className="msfd-summary-card-caption">
                        {card.caption}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="msfd-summary-charts">
              {charts.map((chart) => (
                <SummaryChart
                  key={chart.key}
                  chart={chart}
                  options={chartOptions ? chartOptions(chart) : null}
                />
              ))}
            </div>
          </div>
        ) : null}

        {loading &&
          (summary && !collapsed ? <PanelLoader overlay /> : <PanelLoader />)}
      </div>
    </section>
  );
};

export default SummaryInsights;
