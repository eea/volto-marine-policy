import React from 'react';
import { Grid } from 'semantic-ui-react'; // Dropdown,
import { addAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import DemoSitesMap from './DemoSitesMap';
import { ActiveFilters, DemoSitesFilters } from './DemoSitesFilters';

import { filterCases, getFilters } from './utils';
import { useCases } from './hooks';

import './styles.less';

export default function DemoSitesExplorerView(props) {
  const cases_url = config.settings.prefixPath
    ? '/@@demo-sites-map.arcgis.json'
    : '/marine/@@demo-sites-map.arcgis.json';
  let cases = useCases(addAppURL(cases_url));
  const [selectedCase, onSelectedCase] = React.useState(null);

  const { properties } = props;
  const hideFilters = properties['@type'] === 'indicator_mo' ? true : false;
  const indicatorOnly = hideFilters ? properties['title'] : null;

  const [activeFilters, setActiveFilters] = React.useState({
    objective_filter: [],
    indicator_filter: [],
    project_filter: [],
    country_filter: [],
  });

  const [activeItems, setActiveItems] = React.useState(cases);
  const [filters, setFilters] = React.useState([]);
  const [map, setMap] = React.useState();

  React.useEffect(() => {
    const _filters = getFilters(cases, indicatorOnly);
    setFilters(_filters);
  }, [
    cases,
    activeFilters.objective_filter,
    activeFilters.indicator_filter,
    activeFilters.project_filter,
    activeFilters.country_filter,
    activeItems.length,
    indicatorOnly,
  ]);

  React.useEffect(() => {
    let activeItems = filterCases(cases, activeFilters, indicatorOnly);

    setActiveItems(activeItems);
  }, [activeFilters, cases, indicatorOnly]);

  if (__SERVER__) return '';

  return (
    <div className="searchlib-block">
      <Grid.Row>
        <ActiveFilters
          filters={filters}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />
      </Grid.Row>
      <Grid.Row stretched={true} id="cse-filter">
        <DemoSitesFilters
          filters={filters}
          activeFilters={activeFilters}
          hideFilters={hideFilters}
          setActiveFilters={setActiveFilters}
          map={map}
        />
      </Grid.Row>
      <Grid.Row>
        {cases.length ? (
          <Grid columns={12}>
            <Grid.Column mobile={10} tablet={10} computer={10}>
              <DemoSitesMap
                items={cases}
                activeItems={activeItems}
                hideFilters={hideFilters}
                selectedCase={selectedCase}
                onSelectedCase={onSelectedCase}
                map={map}
                setMap={setMap}
              />
            </Grid.Column>
            <Grid.Column mobile={2} tablet={2} computer={2}>
              <div className="legend">
                <div className="legend-row legend-subtitle">Legend</div>
                <div className="legend-row">
                  <div className="circle">
                    <div className="dot-demosite"></div>
                  </div>
                  <div>Demo site</div>
                </div>
                <div className="legend-row">
                  <div className="circle">
                    <div className="dot-region"></div>
                  </div>
                  <div>Associated region</div>
                </div>
              </div>
            </Grid.Column>
          </Grid>
        ) : null}
      </Grid.Row>
    </div>
  );
}
