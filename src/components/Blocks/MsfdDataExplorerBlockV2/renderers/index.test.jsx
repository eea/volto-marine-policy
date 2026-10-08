import Article4 from './Article4';
import Article7 from './Article7';
import RENDERERS, { getRenderer } from './index';

describe('article renderer registry', () => {
  it('registers the Article 4 and Article 7 renderers', () => {
    expect(getRenderer('marine-units')).toBe(Article4);
    expect(getRenderer('competent-authorities')).toBe(Article7);
    expect(RENDERERS['marine-units']).toBe(Article4);
    expect(RENDERERS['competent-authorities']).toBe(Article7);
  });

  it('returns null for articles without a React renderer', () => {
    expect(getRenderer('assessments')).toBeNull();
    expect(getRenderer('unknown-article')).toBeNull();
  });
});
