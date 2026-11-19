import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FilterPanel, { groupFacets } from './FilterPanel';

const location = { key: 'location', label: 'Geographical filters', order: 10 };
const assessment = {
  key: 'assessment',
  label: 'Assessment filters',
  order: 20,
};
const time = { key: 'time', label: 'Time', order: 50 };

const country = {
  name: 'member_states',
  label: 'Country',
  type: 'checkboxes',
  group: location,
  options: [{ value: 'DE', label: 'Germany', count: 3 }],
};

const descriptor = {
  name: 'ges_descriptor',
  label: 'GES Descriptor',
  type: 'checkboxes',
  group: assessment,
  options: [{ value: 'D5', label: 'D5 Eutrophication', count: 2 }],
};

const date = {
  name: 'determination_date',
  label: 'Determination Date',
  type: 'range',
  group: time,
  min: 2008,
  max: 2025,
  selectedMin: 2008,
  selectedMax: 2025,
};

const filters = [country, descriptor, date];

const handlers = {
  onToggle: jest.fn(),
  onReplace: jest.fn(),
  onSelectAll: jest.fn(),
  onClearFacet: jest.fn(),
  onInvert: jest.fn(),
  onReset: jest.fn(),
};

const renderPanel = (props = {}) =>
  render(
    <FilterPanel
      filters={filters}
      draft={{}}
      loading={false}
      {...handlers}
      {...props}
    />,
  );

beforeEach(() => jest.clearAllMocks());

test('buckets the facets into their groups, sorted by group order', () => {
  const groups = groupFacets(filters);

  expect(groups.map((group) => group.key)).toEqual([
    'location',
    'assessment',
    'time',
  ]);
  expect(groups[0].facets).toEqual([country]);
});

test('a group split in the payload stays one band, in declaration order', () => {
  const groups = groupFacets([
    country,
    descriptor,
    { ...country, name: 'region_subregions', label: 'Region' },
  ]);

  expect(groups).toHaveLength(2);
  expect(groups[0].facets.map((facet) => facet.name)).toEqual([
    'member_states',
    'region_subregions',
  ]);
});

test('facets without a group still render, in a trailing band', () => {
  const groups = groupFacets([{ ...country, group: undefined }]);

  expect(groups).toHaveLength(1);
  expect(groups[0].label).toBe('Other filters');
});

test('renders one titled band per group with its icon', () => {
  const { container } = renderPanel();

  const titles = screen.getAllByRole('heading', { level: 3 });

  expect(titles.map((title) => title.textContent)).toEqual([
    'Geographical filters',
    'Assessment filters',
    'Time',
  ]);
  // the icon is the group's, not a generic one
  expect(titles[0].querySelector('i.icon.globe')).toBeInTheDocument();
  expect(titles[2].querySelector('i.icon.calendar')).toBeInTheDocument();
  // one band per group, one grid per band
  expect(container.querySelectorAll('.msfd-filter-group')).toHaveLength(3);
  expect(container.querySelectorAll('.msfd-filters-grid')).toHaveLength(3);
});

test('a lone range facet gets the full width grid', () => {
  const { container } = renderPanel();

  const grid = container.querySelector(
    '.msfd-filter-group:last-child .msfd-filters-grid',
  );

  expect(grid).toHaveClass('is-wide');
});

// The badge and the Applied filters row are currently not rendered (see the
// commented-out block in FilterPanel), so a draft shows no summary either way.
test('a draft renders no active count and no applied row', () => {
  renderPanel({ draft: { member_states: ['DE'] } });

  expect(screen.queryByText(/active/)).not.toBeInTheDocument();
  expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Remove Country: Germany' }),
  ).not.toBeInTheDocument();
});

test('an untouched panel shows no badge and no applied row', () => {
  renderPanel();

  expect(screen.queryByText(/active/)).not.toBeInTheDocument();
  expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
});

test('the first load shows the loader instead of the groups', () => {
  const { container } = renderPanel({ filters: [], loading: true });

  expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  expect(container.querySelector('.msfd-filter-group')).toBeNull();
});

test('Reset filters resets every facet', () => {
  renderPanel();

  fireEvent.click(screen.getByRole('button', { name: /Reset filters/ }));

  expect(handlers.onReset).toHaveBeenCalled();
});
