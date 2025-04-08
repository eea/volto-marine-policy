import './mockJsdom';
import '@testing-library/jest-dom/extend-expect';
import { getFeatures, filterCases, getFilters } from './utils';

describe('utils.js', () => {
  const mockCases = [
    {
      geometry: { coordinates: [0, 0] },
      properties: {
        title: 'test case study',
        image: '',
        nwrm_type: 'light',
        measures: [{ id: 'test-measure1', title: 'test measure 1' }],
        description: 'test',
        sectors: ['testsector'],
        path: '/test-case-study',
        url: 'localhost.com/test-case-study',
      },
    },
    {
      geometry: { coordinates: [0, 0] },
      properties: {
        title: 'case study 2',
        image: '',
        nwrm_type: 'light',
        measures: [{ id: 'test-measure1', title: 'test measure 1' }],
        description: 'test',
        sectors: ['testsector'],
        path: '/test-case-study',
        url: 'localhost.com/test-case-study',
      },
    },
  ];

  test('getFeatures', () => {
    expect(() => {
      getFeatures(mockCases);
    }).not.toThrowError();
  });

  test('filterCases', () => {
    const mockActiveFilters = {
      nwrms_implemented: ['test measure 1'],
      sectors: ['testsector'],
    };
    const mockDemoSitesIds = ['test-case-study'];
    const mockCasesFiltered = filterCases(
      mockCases,
      mockActiveFilters,
      mockDemoSitesIds,
      'test',
    );
    expect(mockCasesFiltered).toStrictEqual([]);
  });

  test('getFilters', () => {
    const mockFilters = getFilters(mockCases);
    expect(mockFilters).toStrictEqual({
      nwrms_implemented: { 'test-measure1': 'test measure 1' },
      sectors: { testsector: 'testsector' },
    });
  });
});
