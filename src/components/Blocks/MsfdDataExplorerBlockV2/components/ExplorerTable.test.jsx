import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import ExplorerTable from './ExplorerTable';

const columns = [
  { key: 'Feature', label: 'Feature(s)', sortable: false },
  {
    key: 'MarineReportingUnit',
    label: 'Marine Reporting Unit(s)',
    sortable: false,
  },
  { key: 'GESDescription', label: 'GES Description', sortable: false },
];

const expandableColumns = [
  {
    key: 'GESDescription',
    label: 'GES Description',
    sortable: false,
    expandable: true,
  },
];

const groupedColumns = [
  { key: 'Feature', label: 'Feature(s)', sortable: true, maxItems: 10 },
];

const groupedCell = (pressureCount) => ({
  text: 'grouped',
  empty: false,
  groups: [
    { label: 'Species group', items: ['All birds'] },
    {
      label: 'Pressures',
      items: Array.from(
        { length: pressureCount },
        (_, index) => `Pressure ${index}`,
      ),
    },
  ],
});

const renderTable = (rows, extra = {}) =>
  render(
    <ExplorerTable
      columns={columns}
      rows={rows}
      sort={null}
      dir="asc"
      onSort={() => {}}
      onView={() => {}}
      {...extra}
    />,
  );

describe('ExplorerTable', () => {
  it('renders multi-valued cells (Feature, MRU) as bullet lists', () => {
    renderTable([
      {
        Feature: {
          text: 'Nutrients, Contaminants',
          items: ['Nutrients', 'Contaminants'],
          tooltip: 'Nutrients; Contaminants',
          empty: false,
        },
        MarineReportingUnit: {
          text: 'ANS-DE-1, ANS-DE-2',
          items: ['ANS-DE-1', 'ANS-DE-2'],
          empty: false,
        },
        GESDescription: {
          text: 'Good status',
          empty: false,
        },
      },
    ]);

    const lists = document.querySelectorAll('ul.msfd-cell-list');
    expect(lists).toHaveLength(2);
    expect(within(lists[0]).getAllByRole('listitem')).toHaveLength(2);
    expect(lists[0]).toHaveTextContent('Nutrients');
    expect(lists[0]).toHaveTextContent('Contaminants');
    expect(lists[1]).toHaveTextContent('ANS-DE-1');
    expect(lists[1]).toHaveTextContent('ANS-DE-2');

    // the table cells carry the new MRU header label
    expect(screen.getByText('Marine Reporting Unit(s)')).toBeInTheDocument();
  });

  it('still renders a single valued cell as plain text', () => {
    renderTable([
      {
        Feature: { text: 'Nutrients', empty: false },
        MarineReportingUnit: { text: 'ANS-DE-1', empty: false },
        GESDescription: { text: 'Good status', empty: false },
      },
    ]);

    expect(document.querySelector('ul.msfd-cell-list')).toBeNull();
    expect(screen.getByText('Good status')).toBeInTheDocument();
  });

  it('shows the expand icon only when the text overflows the cell box', () => {
    const scrollWidth = jest
      .spyOn(Element.prototype, 'scrollWidth', 'get')
      .mockReturnValue(400);
    const clientWidth = jest
      .spyOn(Element.prototype, 'clientWidth', 'get')
      .mockReturnValue(200);

    renderTable(
      [{ GESDescription: { text: 'A very long value', empty: false } }],
      { columns: expandableColumns },
    );

    expect(
      document.querySelector('.msfd-cell-expandable i.icon'),
    ).toBeInTheDocument();

    scrollWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it('hides the expand icon when the text fits', () => {
    renderTable([{ GESDescription: { text: 'Short', empty: false } }], {
      columns: expandableColumns,
    });

    expect(document.querySelector('.msfd-cell-expandable i.icon')).toBeNull();
  });

  it('renders grouped cells as FeatureType headings with bullets', () => {
    renderTable([{ Feature: groupedCell(1) }], {
      columns: groupedColumns,
    });

    expect(screen.getByText('Species group')).toBeInTheDocument();
    expect(screen.getByText('Pressures')).toBeInTheDocument();
    expect(screen.getByText('All birds')).toBeInTheDocument();
    expect(screen.getByText('Pressure 0')).toBeInTheDocument();
    expect(screen.queryByText(/Show \d+ more/)).toBeNull();
  });

  it('collapses a grouped cell above maxItems and expands on demand', () => {
    renderTable([{ Feature: groupedCell(11) }], {
      columns: groupedColumns,
    });

    // 1 species-group item + 11 pressures = 12; only 10 show (group headings
    // whose items are all hidden are dropped).
    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(10);
    expect(screen.getByText('Pressure 8')).toBeInTheDocument();
    expect(screen.queryByText('Pressure 9')).toBeNull();

    const toggle = screen.getByText('Show 2 more');
    fireEvent.click(toggle);

    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(12);
    expect(screen.getByText('Pressure 10')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show less'));
    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(10);
  });
});
