import {
  getCardLink,
  getIconAlt,
  getIconURL,
  getTextColor,
  hasSlateContent,
  normalizeGroups,
  isDarkColor,
  parseHexColor,
  relativeLuminance,
} from './helpers';

describe('parseHexColor', () => {
  it('parses 6-digit hex values with and without the leading hash', () => {
    expect(parseHexColor('#004B7F')).toEqual({ r: 0, g: 75, b: 127 });
    expect(parseHexColor('004b7f')).toEqual({ r: 0, g: 75, b: 127 });
  });

  it('expands 3-digit hex values', () => {
    expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns null for anything that is not a hex colour', () => {
    expect(parseHexColor('rgb(0, 0, 0)')).toBeNull();
    expect(parseHexColor(undefined)).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('getTextColor', () => {
  it('uses white text on the EEA marine blue', () => {
    expect(getTextColor('#004B7F')).toBe('#FFFFFF');
  });

  it('uses the body text colour on white and on the light blue wash', () => {
    expect(getTextColor('#FFFFFF')).toBe('#3D5265');
    expect(getTextColor('#DAE8F4')).toBe('#3D5265');
  });

  it('falls back to the light background text colour on unknown values', () => {
    expect(getTextColor(undefined)).toBe('#3D5265');
  });
});

describe('isDarkColor', () => {
  it('flags the colours that need white text', () => {
    expect(isDarkColor('#004B7F')).toBe(true);
    expect(isDarkColor('#005248')).toBe(true);
    expect(isDarkColor('#FFFFFF')).toBe(false);
    expect(isDarkColor('#F9F9F9')).toBe(false);
  });
});

describe('getIconURL', () => {
  it('returns null without an icon', () => {
    expect(getIconURL(null)).toBeNull();
    expect(getIconURL(undefined)).toBeNull();
  });

  it('appends the Plone image traversal to an internal URL', () => {
    expect(getIconURL('/marine/icons/fish.svg')).toBe(
      '/marine/icons/fish.svg/@@images/image',
    );
  });

  it('leaves an external URL alone', () => {
    expect(getIconURL('https://example.com/fish.svg')).toBe(
      'https://example.com/fish.svg',
    );
  });

  it('reads the first entry of an array value', () => {
    expect(getIconURL([{ '@id': '/marine/icons/fish.svg' }])).toBe(
      '/marine/icons/fish.svg/@@images/image',
    );
  });

  it('prefers the stored scale download when one is available', () => {
    expect(
      getIconURL({
        '@id': '/marine/icons/fish.svg',
        image_field: 'image',
        image_scales: {
          image: [{ download: '@@images/fish.svg' }],
        },
      }),
    ).toBe('/marine/icons/fish.svg/@@images/fish.svg');
  });
});

describe('getIconAlt', () => {
  it('uses the image title', () => {
    expect(getIconAlt({ '@id': '/a.svg', title: 'Fish' })).toBe('Fish');
  });

  it('falls back to an empty alt for decorative icons', () => {
    expect(getIconAlt('/a.svg')).toBe('');
    expect(getIconAlt(null)).toBe('');
  });
});

describe('getCardLink', () => {
  it('turns an internal path into an app URL', () => {
    expect(getCardLink('/marine/state')).toEqual({
      href: '/marine/state',
      external: false,
    });
  });

  it('keeps external URLs absolute and flags them', () => {
    expect(getCardLink('https://www.eea.europa.eu')).toEqual({
      href: 'https://www.eea.europa.eu',
      external: true,
    });
  });

  it('returns null for an unset or blank URL', () => {
    expect(getCardLink(undefined)).toBeNull();
    expect(getCardLink('')).toBeNull();
    expect(getCardLink('   ')).toBeNull();
  });
});

describe('hasSlateContent', () => {
  it('ignores empty slate values', () => {
    expect(hasSlateContent(undefined)).toBe(false);
    expect(hasSlateContent('')).toBe(false);
    expect(hasSlateContent([{ type: 'p', children: [{ text: '' }] }])).toBe(
      false,
    );
  });

  it('detects text in string and node list values', () => {
    expect(hasSlateContent('75% GES achieved')).toBe(true);
    expect(hasSlateContent([{ type: 'p', children: [{ text: '75%' }] }])).toBe(
      true,
    );
  });
});

describe('normalizeGroups', () => {
  it('returns the original array when there is nothing to heal', () => {
    const groups = [{ cards: [] }];

    expect(normalizeGroups(groups)).toBe(groups);
  });

  it('passes non-arrays through untouched', () => {
    expect(normalizeGroups(undefined)).toBeUndefined();
  });

  it('drops empty slate fields on cards, which are what make the sidebar loop', () => {
    const groups = [
      {
        cards: [{ title: 'Birds', description: [], text: [], info: '75%' }],
      },
    ];

    expect(normalizeGroups(groups)).toEqual([
      { cards: [{ title: 'Birds', info: '75%' }] },
    ]);
  });

  it('keeps slate fields that hold content', () => {
    const text = [{ type: 'p', children: [{ text: '0% GES achieved' }] }];
    const groups = [{ cards: [{ title: 'Birds', text }] }];

    expect(normalizeGroups(groups)).toBe(groups);
    expect(normalizeGroups(groups)[0].cards[0].text).toBe(text);
  });
});
