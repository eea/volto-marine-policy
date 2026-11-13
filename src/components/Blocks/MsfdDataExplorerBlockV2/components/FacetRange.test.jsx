import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FacetRange from './FacetRange';

// Article 9 determination date: a year slider whose rows may have no date.
const facet = {
  name: 'determination_date',
  label: 'Determination Date',
  type: 'range',
  unit: 'year',
  step: 1,
  min: 2019,
  max: 2024,
  selectedMin: 2019,
  selectedMax: 2024,
  nullOption: {
    label: 'Include rows without a determination date',
    value: 'null',
    count: 12,
    selected: true,
  },
};

const areaFacet = {
  name: 'area',
  label: 'Area (km²)',
  type: 'range',
  unit: 'km²',
  min: 0,
  max: 1000,
  selectedMin: 0,
  selectedMax: 1000,
};

const renderFacet = (value, onChange = jest.fn()) => {
  render(<FacetRange facet={facet} value={value} onChange={onChange} />);

  return onChange;
};

test('shows the slider bounds in years', () => {
  renderFacet(undefined);

  expect(screen.getByLabelText('Min (year)')).toHaveValue(2019);
  expect(screen.getByLabelText('Max (year)')).toHaveValue(2024);
});

test('keeps rows without a date by default', () => {
  renderFacet(undefined);

  // an untouched facet must keep every row, so the toggle starts checked
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(
    screen.getByText('Include rows without a determination date'),
  ).toBeInTheDocument();
  // the toggle also shows how many rows carry no date
  expect(screen.getByText('(12)')).toBeInTheDocument();
});

test('turning the toggle off drops the null token', () => {
  const onChange = renderFacet(['2019', '2024', 'null']);

  fireEvent.click(screen.getByRole('checkbox'));

  expect(onChange).toHaveBeenCalledWith('determination_date', [
    '2019',
    '2024',
  ]);
});

test('turning the toggle back on appends the null token', () => {
  const onChange = renderFacet(['2019', '2024']);

  expect(screen.getByRole('checkbox')).not.toBeChecked();

  fireEvent.click(screen.getByRole('checkbox'));

  expect(onChange).toHaveBeenCalledWith('determination_date', [
    '2019',
    '2024',
    'null',
  ]);
});

test('moving a bound keeps the null token while it is on', () => {
  const onChange = renderFacet(['2019', '2024', 'null']);

  fireEvent.change(screen.getByLabelText('Max (year)'), {
    target: { value: '2022' },
  });

  expect(onChange).toHaveBeenCalledWith('determination_date', [
    '2019',
    '2022',
    'null',
  ]);
});

test('a facet without a null option renders no toggle', () => {
  render(<FacetRange facet={areaFacet} value={undefined} onChange={jest.fn()} />);

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});
