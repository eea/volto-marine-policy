import React from 'react';
import loadable from '@loadable/component';
import { Icon } from 'semantic-ui-react';

import PanelLoader from './PanelLoader';

// Plotly is heavy; load it (bar-only build, see ./plotlyBars) only when the
// summary panel actually renders. It is loaded client-side only: plotly.js
// reaches for `window`, so rendering/importing it during SSR would block the
// first paint.
const Plot = loadable(() => import('./plotlyBars'), {
  ssr: false,
  fallback: <div className="msfd-summary-chart-loading" />,
});

const CHART_COLOR = '#4a7fbf';

// Plotly labels every category on the categorical axis by default, which is
// unreadable once there are many MRU size bins or regions. Show at most this
// many evenly spaced tick labels (the bars themselves all remain).
const MAX_TICKS = 10;

const categoricalTicks = (labels) => {
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

  if (text === null) return '—';

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

// One bar chart. `orientation` is 'v' (size distribution: categories on x) or
// 'h' (per region: categories on y); the value axis gets integer ticks.
const SummaryChart = ({ chart }) => {
  const points = chart.points || [];
  const labels = points.map((point) => point.label);
  const values = points.map((point) => point.value);
  const horizontal = chart.orientation === 'h';
  const ticks = categoricalTicks(labels);

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
  // labels. The categorical axis keeps its categories but shows at most
  // MAX_TICKS of them (`ticks`).
  const valueAxis = {
    title: {
      text: (horizontal ? chart.xLabel : chart.yLabel) || '',
      standoff: 8,
    },
    zeroline: false,
    gridcolor: '#e6ecf1',
    nticks: 10,
    tickformat: ',d',
  };

  const categoryAxis = {
    title: {
      text: (horizontal ? chart.yLabel : chart.xLabel) || '',
      standoff: 8,
    },
    zeroline: false,
    gridcolor: 'rgba(0,0,0,0)',
    automargin: true,
    ...ticks,
  };

  const layout = {
    margin: { t: 10, r: 12, b: 44, l: 54 },
    height: 260,
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
      <Plot
        data={[trace]}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: '100%', height: '260px' }}
      />
    </div>
  );
};

// The Summary & insights panel. Fully driven by the backend `summary` payload
// ({cards, charts}), so a different article/cycle can show different data
// without touching this component. The Hide toggle is local UI state. While the
// summary request is in flight the panel renders with a loader.
const SummaryInsights = ({ summary, loading }) => {
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
                <SummaryChart key={chart.key} chart={chart} />
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
