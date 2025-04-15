import React from 'react';
import { useMapContext } from '@eeacms/volto-openlayers-map/api';
import { openlayers as ol } from '@eeacms/volto-openlayers-map';
import FeatureDisplay from './FeatureDisplay';
import { usePrevious } from '@plone/volto/helpers/Utils/usePrevious';

export default function InfoOverlay({
  selectedFeature,
  onFeatureSelect,
  layerId,
  // hideFilters,
}) {
  const { map } = useMapContext();
  const [tooltip, setTooltipRef] = React.useState();
  const [showTooltip, setShowTooltip] = React.useState();

  const prevLayerId = usePrevious(layerId);

  React.useEffect(() => {
    if (prevLayerId && layerId !== prevLayerId) {
      setShowTooltip(false);
    }
  }, [layerId, prevLayerId]);

  React.useEffect(() => {
    if (!(map && tooltip)) return;

    const overlay = new ol.Overlay({
      element: document.getElementById('popup-overlay'),
      positioning: 'bottom-left',
      offset: [0, 0],
      stopEvent: false,
      // autoPan: true,
      // autoPanAnimation: {
      //     duration: 250,
      // },
    });
    map.addOverlay(overlay);

    function handler(evt) {
      const { pixel, target } = evt;
      const features = target.getFeaturesAtPixel(pixel);
      // const popupOverlay = overlay.element; // document.getElementById('popup-overlay');

      if (features.length) {
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
        setShowTooltip(true);
      } else {
        // const coordinate = evt.coordinate
        // overlay.setPosition(coordinate);
        // handle a click in an overlay popup
        if (evt.originalEvent.target.tagName === 'A') return;
        setShowTooltip(false);
        // popupOverlay.style.display = 'none';
        onFeatureSelect(null);
      }
    }

    map.on('click', handler);

    return () => {
      map.un('click', handler);
      map.removeOverlay(overlay);
    };
  }, [map, tooltip, onFeatureSelect]); //

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
