import Article4 from './Article4';
import Article7 from './Article7';
import Article9 from './Article9';
import Article193 from './Article193';

// Registry of per-article React renderers. Anything not listed here falls back
// to the legacy server rendered explorer (see View.jsx).
const RENDERERS = {
  'marine-units': Article4,
  'competent-authorities': Article7,
  'determination-of-good-environmental-status': Article9,
  'datasets-used': Article193,
};

export const getRenderer = (articleSlug) => RENDERERS[articleSlug] || null;

export default RENDERERS;
