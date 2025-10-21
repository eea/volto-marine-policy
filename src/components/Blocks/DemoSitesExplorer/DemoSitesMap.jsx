import React from 'react';

import cx from 'classnames';

import {
  Map,
  Layer,
  Layers,
  Controls,
  useMapContext,
} from '@eeacms/volto-openlayers-map/api';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';

import InfoOverlay from './InfoOverlay';
import FeatureInteraction from './FeatureInteraction';

import {
  centerAndResetMapZoom,
  clearFilters,
  getFeatures,
  // zoomMapToFeatures,
} from './utils';

const styleCache = {};
const MapContextGateway = ({ setMap }) => {
  const { map } = useMapContext();
  React.useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
};

function DemoSitesMap(props) {
  const {
    items,
    activeItems,
    setActiveFilters,
    hideFilters,
    selectedCase,
    onSelectedCase,
    map,
    setMap,
    highlightedIndex,
    setHighlightedIndex,
    enableMarineMO,
    ol,
  } = props;
  const features = getFeatures({ cases: items, ol });
  const [resetMapButtonClass, setResetMapButtonClass] =
    React.useState('inactive');

  const arcgisSource = React.useMemo(() => {
    return new ol.source.TileArcGISRest({
      url: 'https://water.discomap.eea.europa.eu/arcgis/rest/services/Marine/MPA_networks_in_EEA_marine_assessment_areas_2021/MapServer',
    });
  }, []);

  const [tileWMSSources] = React.useState([
    new ol.source.TileWMS({
      url: 'https://gisco-services.ec.europa.eu/maps/service',
      params: {
        // LAYERS: 'OSMBlossomComposite', OSMCartoComposite, OSMPositronComposite
        LAYERS: 'OSMPositronComposite',
        TILED: true,
        DPI: 192,
      },
      serverType: 'geoserver',
      transition: 0,
    }),
  ]);
  const [pointsSource] = React.useState(
    new ol.source.Vector({
      features,
    }),
  );

  const [clusterSource] = React.useState(
    new ol.source.Cluster({
      distance: 0,
      source: pointsSource,
    }),
  );

  React.useEffect(() => {
    if (!map) return null;

    if (activeItems) {
      pointsSource.clear();
      pointsSource.addFeatures(getFeatures({ cases: activeItems, ol }));
      // hideFilters && zoomMapToFeatures(map, getFeatures(activeItems));
      // zoomMapToFeatures(map, getFeatures(activeItems));
    }
  }, [map, activeItems, pointsSource, hideFilters, ol]);

  React.useEffect(() => {
    if (!map) return null;

    const moveendListener = (e) => {
      // console.log('map.getView()', map.getView());
      // console.log('selectedCase', selectedCase);
      const mapZoom = Math.round(map.getView().getZoom() * 10) / 10;
      const mapCenter = map.getView().getCenter();

      if (selectedCase) {
        const coords = selectedCase.geometry.flatCoordinates;
        const pixel = map.getPixelFromCoordinate(coords);
        map.getInteractions().array_[9].getFeatures().clear();
        try {
          map
            .getInteractions()
            .array_[9].getFeatures()
            .push(map.getFeaturesAtPixel(pixel)[0]);
        } catch (e) {
          // console.error(e);
        }
      } else {
        map.getInteractions().array_[9].getFeatures().clear();
      }

      if (
        mapZoom === 4 &&
        JSON.stringify(mapCenter) ===
          JSON.stringify(ol.proj.transform([10, 49], 'EPSG:4326', 'EPSG:3857'))
      ) {
        setResetMapButtonClass('inactive');
      } else {
        setResetMapButtonClass('active');
      }
    };

    map.on('moveend', moveendListener);

    return () => {
      map.un('moveend', moveendListener);
    };
  }, [map, selectedCase, resetMapButtonClass, setResetMapButtonClass, ol]);

  const clusterStyle = React.useMemo(
    () => selectedClusterStyle({ selectedCase, ol }),
    [selectedCase, ol],
  );

  const MapWithSelection = React.useMemo(() => Map, []);
  // console.log('render');

  return features.length > 0 ? (
    <div id="ol-map-container">
      <MapWithSelection
        view={{
          center: ol.proj.fromLonLat([10, 54]),
          showFullExtent: true,
          zoom: 3.4,
        }}
        // pixelRatio={window.devicePixelRatio || 1}
        // controls={ol.control.defaults({ attribution: false })}
      >
        <Controls attribution={false} />
        <Layers>
          {highlightedIndex > 0 && !activeItems.length && (
            <div className="no-results-message">
              No results found. Please refine your filters.
            </div>
          )}
          <button
            className={cx(
              'reset-map-button ui button secondary',
              String(resetMapButtonClass),
            )}
            onClick={() => {
              // scrollToElement('search-input');
              onSelectedCase(null);
              clearFilters(setActiveFilters);
              setHighlightedIndex(5);
              if (hideFilters) {
                // zoomMapToFeatures(map, getFeatures(activeItems));
                centerAndResetMapZoom({ map, ol });
              } else {
                centerAndResetMapZoom({ map, ol });
                // zoomMapToFeatures(map, getFeatures(activeItems));
              }
              map.getInteractions().array_[9].getFeatures().clear();
            }}
          >
            <span className="result-info-title">Reset map</span>
            <i className="icon ri-map-2-line"></i>
          </button>
          <InfoOverlay
            selectedFeature={selectedCase}
            onFeatureSelect={onSelectedCase}
            layerId={tileWMSSources[0]}
            hideFilters={hideFilters}
          />
          <FeatureInteraction
            onFeatureSelect={onSelectedCase}
            // hideFilters={hideFilters}
            // selectedCase={selectedCase}
          />
          <Layer.Tile source={tileWMSSources[0]} zIndex={0} />
          {enableMarineMO && <Layer.Tile source={arcgisSource} zIndex={0} />}
          <Layer.Vector
            style={clusterStyle}
            source={clusterSource}
            zIndex={1}
          />
          <MapContextGateway setMap={setMap} />
        </Layers>
      </MapWithSelection>
    </div>
  ) : null;
}

const selectedClusterStyle = ({ selectedFeature, ol }) => {
  function _clusterStyle(feature, selectedFeature) {
    const size = feature.get('features').length;
    let clusterStyle = styleCache[size];

    if (!clusterStyle) {
      clusterStyle = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12 + Math.min(Math.floor(size / 3), 10),
          stroke: new ol.style.Stroke({
            color: '#fff',
          }),
          fill: new ol.style.Fill({
            // 309ebc blue 3 + green 3 mix
            color: '#006BB8', // #006BB8 #309ebc
          }),
        }),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: '#fff',
          }),
        }),
      });
      styleCache[size] = clusterStyle;
    }
    // set size === 1 to enable clusterization
    if (size) {
      // let color = feature.values_.features[0].values_['color'];
      let color = '#0179cf';
      let width = feature.values_.features[0].values_['width'];
      let radius = feature.values_.features[0].values_['radius'];
      // console.log(color)
      // let color = '#0083E0'; // #0083E0 #50B0A4

      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({
            color: '#fff',
          }),
          stroke: new ol.style.Stroke({
            color: color,
            width: width,
          }),
        }),
      });
    } else {
      return clusterStyle;
    }
  }
  return _clusterStyle;
};

export default withOpenLayers(DemoSitesMap);
