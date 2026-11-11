// Plotly is heavy and only the Summary & insights bar charts need it, so this
// module is the lazy boundary: import it via @loadable/component and webpack
// puts plotly in its own chunk. The bar-only build is used instead of the full
// plotly.js bundle (`react-plotly.js/factory` lets us pick the build).
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-basic.min.js';

export default createPlotlyComponent(Plotly);
