import React, { useRef } from 'react';
import cx from 'classnames';
import loadable from '@loadable/component';
import { Grid } from 'semantic-ui-react'; // Dropdown,

import { objectivesCustomOrder } from './utils';

const Plot = loadable(() => import('react-plotly.js'));

const ObjectivesChart = ({
  items,
  activeItems,
  //   filters,
  activeFilters,
  setActiveFilters,
  //   hideFilters,
  //   map,
  highlightedIndex,
  setHighlightedIndex,
  initialized,
  setInitialized,
}) => {
  const chartRef = useRef(null);
  let objectiveCounts = {};

  // if (!items) return;

  items.forEach((item) => {
    const _obj = item.properties.objective;

    _obj.forEach((_o) => {
      if (!(_o in objectiveCounts)) {
        objectiveCounts[_o] = 0;
      }
    });
  });

  let itemsUsedForChart = [];

  if (initialized) {
    itemsUsedForChart = activeItems;
  } else {
    itemsUsedForChart = items;
  }

  for (const item of itemsUsedForChart) {
    item.properties.objective.map((obj) => {
      objectiveCounts[obj] = (objectiveCounts[obj] || 0) + 1;
      return [];
    });
  }
  const _sorted = Object.entries(objectiveCounts).sort(
    (a, b) =>
      objectivesCustomOrder.indexOf(a[0]) - objectivesCustomOrder.indexOf(b[0]),
  );
  const objectives = Object.fromEntries(_sorted);
  const objectivesLength = Object.keys(objectives).length;

  React.useEffect(() => {
    // set the objectives and the count
    if (!items) return;
    if (initialized) return;

    const interval = setInterval(() => {
      setHighlightedIndex((prevIndex) => {
        if (prevIndex + 1 >= objectivesLength) setInitialized(true);
        if (prevIndex + 1 >= objectivesLength + 1) {
          clearInterval(interval); // Stop after last item
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 2000);
    // console.log('init');
    return () => clearInterval(interval); // Cleanup on unmount
  }, [
    items,
    objectivesLength,
    highlightedIndex,
    setHighlightedIndex,
    initialized,
    setInitialized,
  ]);

  React.useEffect(() => {
    // set the objectives filter based on chartclick or list selection
    // if (!objectives) return;
    const filterKey = 'objective_filter';

    if (highlightedIndex === -1) {
      const newValue = [undefined];

      setActiveFilters((prev) => {
        const currentValues = prev[filterKey];
        // Don't update if no change
        const isSame =
          currentValues.length === newValue.length &&
          currentValues.every((v, i) => v === newValue[i]);

        if (isSame) return prev;

        return {
          ...prev,
          [filterKey]: newValue,
        };
      });
      return;
    }

    const currentObjective = Object.keys(objectives)[highlightedIndex];
    const newValue = currentObjective ? [currentObjective] : [];

    setActiveFilters((prev) => {
      const currentValues = prev[filterKey];
      // Don't update if no change
      const isSame =
        currentValues.length === newValue.length &&
        currentValues.every((v, i) => v === newValue[i]);

      if (isSame) return prev;

      return {
        ...prev,
        [filterKey]: newValue,
      };
    });
    // console.log(highlightedIndex, activeFilters);
  }, [objectives, activeFilters, setActiveFilters, highlightedIndex]);

  const handleClick = (event) => {
    let label = '';

    if (event.points) {
      const point = event.points[0];
      label = point.label;
      // const value = point.value;
    } else {
      label = event.target.textContent;
    }

    const tempFilters = JSON.parse(JSON.stringify(activeFilters));
    if (tempFilters['objective_filter'].includes(label)) {
      tempFilters['objective_filter'] = tempFilters['objective_filter'].filter(
        (i) => i !== label,
      );
      setHighlightedIndex(5);
    } else {
      tempFilters['objective_filter'] = [];
      tempFilters['objective_filter'].push(label);
      setHighlightedIndex(Object.keys(objectives).indexOf(label));
    }
    setActiveFilters(tempFilters);
  };

  const handleHover = () => {
    if (chartRef.current) {
      chartRef.current.style.cursor = 'pointer'; // Change cursor on hover
    }
  };

  const handleUnhover = () => {
    if (chartRef.current) {
      chartRef.current.style.cursor = 'default'; // Reset cursor
    }
  };

  const labels = Object.keys(objectives);
  const values = Object.values(objectives);
  const totalCount = values.reduce((acc, curr) => acc + curr, 0);
  const customColors = ['#007b6c', '#fdaf20', '#004b7f', '#f9eb8a', '#9e83b6']; // Adjust colors as needed
  const grayColor = '#d3d3d3';
  //   const pull = labels.map((_, i) => (i === highlightedIndex ? 0.1 : 0));
  const inactiveColors = labels.map((_, i) =>
    i === highlightedIndex ? customColors[i % customColors.length] : grayColor,
  );

  // console.log(highlightedIndex);
  // console.log(initialized);

  return highlightedIndex >= -1 ? (
    <div className="objectives-chart fade-in">
      <Grid.Row className="chart-title">
        Demo sites and Associated regions
      </Grid.Row>
      <Grid.Row className="chart-title">Objective/Enabler</Grid.Row>
      <Grid.Row className="chart-container">
        <div ref={chartRef}>
          <Plot
            useResizeHandler
            data={[
              {
                type: 'pie',
                labels: labels,
                values: values,
                textinfo: 'none',
                sort: false,
                // textinfo: highlightedIndex === 5 ? 'value' : 'none',
                hole: 0.4,
                insidetextorientation: 'radial',
                hoverinfo: 'label+value',
                marker: {
                  colors:
                    highlightedIndex === 5 ? customColors : inactiveColors, // Apply custom colors here
                  line: {
                    color: '#e0e0e0', // light gray
                    width: 1, // thin border
                  },
                },
                direction: 'clockwise',
                // pull,
              },
            ]}
            layout={{
              width: 300,
              height: 300,
              // title: 'Objectives Distribution',
              showlegend: false,
              margin: {
                t: 20, // Top margin
                b: 20, // Bottom margin
                l: 0, // Left margin
                r: 0, // Right margin
              },
              annotations: [
                {
                  text:
                    highlightedIndex === 5
                      ? `${totalCount}`
                      : values[highlightedIndex] || '', // Display total count in the center
                  font: {
                    family:
                      "'Roboto', 'Helvetica Neue', Arial, Helvetica, sans-serif",
                    size: 24, // Adjust font size as needed
                    weight: 'bold',
                  },
                  showarrow: false, // No arrow pointing to the center
                  x: 0.5, // Position in the center (horizontal)
                  y: 0.5, // Position in the center (vertical)
                  align: 'center',
                  valign: 'middle',
                  bgcolor: 'rgba(255, 255, 255, 0.6)', // Optional background color
                  borderpad: 10, // Padding around the text
                },
              ],
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ['toImage'], // Removes download button
              displaylogo: false, // Removes "Produced with Plotly.js"
            }}
            onClick={handleClick}
            onHover={handleHover}
            onUnhover={handleUnhover}
          />
        </div>
      </Grid.Row>
      <Grid.Row>
        <ul>
          {Object.entries(objectives).map(([item, count], index) => (
            <li
              key={item?.id || index}
              className={cx(
                index === highlightedIndex ? 'active' : '',
                customColors[index].replace('#', 'C'),
                count === 0 ? 'disabled' : '',
              )}
            >
              <div
                onClick={handleClick}
                onKeyDown={() => {}}
                tabIndex={index}
                role="button"
                key={item}
              >
                {item}
              </div>
            </li>
          ))}
        </ul>
      </Grid.Row>
    </div>
  ) : (
    ''
  );
};

export default ObjectivesChart;
