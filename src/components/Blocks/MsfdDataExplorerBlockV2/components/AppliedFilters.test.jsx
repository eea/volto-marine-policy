import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import AppliedFilters, { buildChips } from './AppliedFilters';

const country = {
  name: 'member_states',
  label: 'Country',
  type: 'checkboxes',
  group: { key: 'location', label: 'Geographical filters', order: 10 },
  options: [
    { value: 'DE', label: 'Germany', count: 10 },
    { value: 'BE', label: 'Belgium', count: 4 },
  ],
};

const descriptor = {
  name: 'ges_descriptor',
  label: 'GES Descriptor',
  type: 'checkboxes',
  group: { key: 'assessment', label: 'Assessment filters', order: 20 },
  options: [{ value: 'D5', label: 'D5 Eutrophication', count: 7 }],
};

const date = {
  name: 'determination_date',
  label: 'Determination Date',
  type: 'range',
  group: { key: 'time', label: 'Time', order: 50 },
  min: 2008,
  max: 2025,
  nullOption: {
    label: 'Include empty values',
    value: 'null',
    count: 41,
    selected: true,
  },
};

const filters = [country, descriptor, date];

test('one chip per selected value, a single chip for a range', () => {
  const chips = buildChips(filters, {
    member_states: ['DE', 'BE'],
    ges_descriptor: ['D5'],
    determination_date: ['2015', '2025', 'null'],
  });

  expect(chips.map((chip) => chip.label)).toEqual([
    'Germany',
    'Belgium',
    'D5 Eutrophication',
    '2015 – 2025',
  ]);
});

test('the "no value" token never shows in the range chip', () => {
  const chips = buildChips(filters, {
    determination_date: ['2015', '2025', 'null'],
  });

  expect(chips).toHaveLength(1);
  expect(chips[0].label).toBe('2015 – 2025');
});

test('a facet without a selection contributes no chip', () => {
  expect(buildChips(filters, {})).toEqual([]);
  expect(buildChips(filters, { member_states: [], area: undefined })).toEqual(
    [],
  );
});

test('a selected value missing from the options falls back to its code', () => {
  const chips = buildChips(filters, { member_states: ['XX'] });

  expect(chips[0].label).toBe('XX');
});

test('renders nothing when no filter is set', () => {
  const { container } = render(
    <AppliedFilters
      chips={[]}
      onToggle={jest.fn()}
      onClearFacet={jest.fn()}
      onReset={jest.fn()}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});

test('removing a chip toggles exactly that value', () => {
  const onToggle = jest.fn();

  render(
    <AppliedFilters
      chips={buildChips(filters, { member_states: ['DE', 'BE'] })}
      onToggle={onToggle}
      onClearFacet={jest.fn()}
      onReset={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByLabelText('Remove Country: Belgium'));

  expect(onToggle).toHaveBeenCalledWith('member_states', 'BE');
});

test('removing a range chip clears the whole facet', () => {
  const onToggle = jest.fn();
  const onClearFacet = jest.fn();

  render(
    <AppliedFilters
      chips={buildChips(filters, { determination_date: ['2015', '2025'] })}
      onToggle={onToggle}
      onClearFacet={onClearFacet}
      onReset={jest.fn()}
    />,
  );

  fireEvent.click(
    screen.getByLabelText('Remove Determination Date: 2015 – 2025'),
  );

  expect(onClearFacet).toHaveBeenCalledWith('determination_date');
  expect(onToggle).not.toHaveBeenCalled();
});

test('Clear all resets every filter', () => {
  const onReset = jest.fn();

  render(
    <AppliedFilters
      chips={buildChips(filters, { member_states: ['DE'] })}
      onToggle={jest.fn()}
      onClearFacet={jest.fn()}
      onReset={onReset}
    />,
  );

  const row = screen.getByText('Active filters:').closest('.msfd-applied');

  fireEvent.click(within(row).getByRole('button', { name: 'Clear all' }));

  expect(onReset).toHaveBeenCalled();
});
