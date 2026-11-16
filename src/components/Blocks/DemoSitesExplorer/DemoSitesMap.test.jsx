import React from 'react';
import { render } from '@testing-library/react';

import DemoSitesMap from './DemoSitesMap';

jest.mock('@eeacms/volto-openlayers-map/api', () => ({}), { virtual: true });
jest.mock('@eeacms/volto-openlayers-map', () => ({
  Map: () => <div>Map</div>,
  Layer: { Tile: () => null, Vector: () => null },
  Layers: ({ children }) => <div>{children}</div>,
  Controls: () => null,
  withOpenLayers: (Component) => Component,
}));
jest.mock('./InfoOverlay', () => () => null);
jest.mock('./FeatureInteraction', () => () => null);
jest.mock('./utils', () => ({
  BLUEPARKProjects: [],
  centerAndResetMapZoom: jest.fn(),
  clearFilters: jest.fn(),
  getFeatures: jest.fn(() => []),
}));

const makeSource = jest.fn(function Source() {});
// ol/source/TileArcGISRest always exposes a `tileUrlFunction` bound to the
// source; DemoSitesMap wraps it to lowercase the query-string keys.
const makeTileArcGISRestSource = jest.fn(function Source() {
  this.tileUrlFunction = jest.fn(() => '');
});
const ol = {
  source: {
    TileArcGISRest: makeTileArcGISRestSource,
    TileWMS: makeSource,
    Vector: makeSource,
    Cluster: makeSource,
  },
  proj: {
    fromLonLat: jest.fn(),
  },
};

describe('DemoSitesMap', () => {
  it('renders no map when there are no features to display', () => {
    const { container } = render(
      <DemoSitesMap items={[]} activeItems={[]} ol={ol} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
