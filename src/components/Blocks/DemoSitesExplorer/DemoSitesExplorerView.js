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
  const { demoSitesIds } = props; // case studies from measure view
  const [selectedCase, onSelectedCase] = React.useState(null);
  const hideFilters = demoSitesIds ? true : false;

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
    const _filters = getFilters(cases);
    setFilters(_filters);
  }, [
    cases,
    activeFilters.objective_filter,
    activeFilters.indicator_filter,
    activeFilters.project_filter,
    activeFilters.country_filter,
    activeItems.length,
  ]);

  React.useEffect(() => {
    let activeItems = filterCases(
      cases,
      activeFilters,
      demoSitesIds,
    );

    setActiveItems(activeItems);
  }, [demoSitesIds, activeFilters, cases]);

  if (__SERVER__) return '';

  return (
    <div className="searchlib-block">
      <Grid.Row>
        {hideFilters ? null : (
          <ActiveFilters
            filters={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        )}
      </Grid.Row>
      <Grid.Row stretched={true} id="cse-filter">
        {hideFilters ? null : (
          <DemoSitesFilters
            filters={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            map={map}
          />
        )}
      </Grid.Row>
      <Grid.Row>
        {cases.length ? (
          <Grid columns={12}>
            <Grid.Column mobile={12} tablet={12} computer={12}>
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
          </Grid>
        ) : null}
      </Grid.Row>
    </div>
  );
}
