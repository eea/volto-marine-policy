import Article4 from './Article4';

// Registry of per-article React renderers. Anything not listed here falls back
// to the legacy server rendered explorer (see View.jsx).
const RENDERERS = {
  'marine-units': Article4,
};

export const getRenderer = (articleSlug) => RENDERERS[articleSlug] || null;

export default RENDERERS;
