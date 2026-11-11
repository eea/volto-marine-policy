import Article4 from './Article4';
import Article7 from './Article7';
import Article9 from './Article9';
import Article193 from './Article193';
import RENDERERS, { getRenderer } from './index';

describe('article renderer registry', () => {
  it('registers the Article 4, 7, 9 and 19.3 renderers', () => {
    expect(getRenderer('marine-units')).toBe(Article4);
    expect(getRenderer('competent-authorities')).toBe(Article7);
    expect(getRenderer('determination-of-good-environmental-status')).toBe(
      Article9,
    );
    expect(getRenderer('datasets-used')).toBe(Article193);
    expect(RENDERERS['marine-units']).toBe(Article4);
    expect(RENDERERS['competent-authorities']).toBe(Article7);
    expect(RENDERERS['determination-of-good-environmental-status']).toBe(
      Article9,
    );
    expect(RENDERERS['datasets-used']).toBe(Article193);
  });

  it('returns null for articles without a React renderer', () => {
    expect(getRenderer('assessments')).toBeNull();
    expect(getRenderer('unknown-article')).toBeNull();
  });
});
