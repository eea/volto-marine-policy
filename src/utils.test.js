import {
  getPath,
  getScaleUrl,
  formatItemType,
  doStringifySearchquery,
  deStringifySearchquery,
} from './utils';

describe('getPath', () => {
  it('returns the pathname for a fully qualified URL', () => {
    const url = 'http://example.com/some/path';
    expect(getPath(url)).toBe('/some/path');
  });

  it('returns the input URL if it is not fully qualified', () => {
    const url = '/some/path';
    expect(getPath(url)).toBe(url);
  });

  it('handles edge case with no input', () => {
    expect(getPath('')).toBe('');
  });
});

describe('getScaleUrl', () => {
  it('returns a scaled image URL for internal API URLs', () => {
    const url = '/api/some/path';
    const size = 'large';
    expect(getScaleUrl(url, size)).toBe('/some/path/@@images/image/large');
  });

  it('returns a scaled image URL for external URLs', () => {
    const url = 'http://example.com/api/some/path';
    const size = 'medium';
    expect(getScaleUrl(url, size)).toBe(
      'http://example.com/some/path/@@images/image/medium',
    );
  });

  it('handles null inputs', () => {
    expect(getScaleUrl(null, 'small')).toBe('undefined/@@images/image/small');
  });
});

describe('formatItemType', () => {
  it('formats item types correctly', () => {
    expect(formatItemType('type_example')).toBe('Type / Example');
  });

  it('returns an empty string for empty input', () => {
    expect(formatItemType('')).toBe('');
  });

  it('handles types without underscores', () => {
    expect(formatItemType('typeexample')).toBe('Typeexample');
  });
});

describe('Search query conversion', () => {
  const queryString = 'key1=value1&key2=value2';
  const jsonString = '{"key1":["value1"],"key2":["value2"]}';

  it('converts query string to JSON string', () => {
    expect(doStringifySearchquery(queryString)).toBe(jsonString);
  });

  it('converts JSON string to query string', () => {
    expect(deStringifySearchquery(jsonString)).toBe(queryString);
  });
});
