import React from 'react';
import { useMapContext } from '@eeacms/volto-openlayers-map/api';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import FeatureDisplay from './FeatureDisplay';
import { usePrevious } from '@plone/volto/helpers/Utils/usePrevious';

function InfoOverlay({ selectedFeature, onFeatureSelect, layerId, ol }) {
  const { map } = useMapContext();
  const [tooltip, setTooltipRef] = React.useState(null);
  const overlayRef = React.useRef();
  const prevLayerId = usePrevious(layerId);
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (prevLayerId && layerId !== prevLayerId) {
      setShowTooltip(false);
    }
  }, [layerId, prevLayerId]);

  React.useEffect(() => {
    if (!(map && tooltip && ol.Overlay)) return;

    overlayRef.current = new ol.Overlay({
      element: tooltip,
      positioning: 'bottom-left',
      offset: [0, 0],
      stopEvent: false,
      // autoPan: true,
      // autoPanAnimation: {
      //     duration: 250,
      // },
    });
    map.addOverlay(overlayRef.current);

    function handler(evt) {
      const { pixel, target } = evt;
      const features = target.getFeaturesAtPixel(pixel);
      // const popupOverlay = overlay.element; // document.getElementById('popup-overlay');

      if (features.length) {
        const coordinate = evt.coordinate;
        overlayRef.current.setPosition(coordinate);
        setShowTooltip(true);
      } else {
        // handle a click in an overlay popup
        if (evt.originalEvent.target.tagName === 'A') return;
        overlayRef.current.setPosition(undefined);
        setShowTooltip(false);
        onFeatureSelect(null);
      }
    }

    map.on('click', handler);

    return () => {
      map.un('click', handler);
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
      }
    };
  }, [map, tooltip, onFeatureSelect, ol.Overlay]);

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <div
      id="popup-overlay"
      style={{
        // position: 'absolute', // TODO POPUP
        zIndex: 1,
        visibility: showTooltip ? 'visible' : 'hidden',
      }}
      ref={setTooltipRef}
    >
      {selectedFeature ? <FeatureDisplay feature={selectedFeature} /> : null}
    </div>
  ) : null;
}

export default withOpenLayers(InfoOverlay);
