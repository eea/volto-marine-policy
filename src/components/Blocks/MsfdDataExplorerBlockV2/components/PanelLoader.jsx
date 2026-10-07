import React from 'react';
import { Loader } from 'semantic-ui-react';

// Shared loading indicator for the explorer panels (filters, summary,
// results). `overlay` keeps the panel's existing content in place (dimmed)
// while a request is in flight, so interactive facet widgets are not unmounted
// and do not lose focus.
const PanelLoader = ({ overlay }) => (
  <div className={`msfd-panel-loading${overlay ? ' is-overlay' : ''}`}>
    <Loader active inline="centered" size="small">
      Loading
    </Loader>
  </div>
);

export default PanelLoader;
