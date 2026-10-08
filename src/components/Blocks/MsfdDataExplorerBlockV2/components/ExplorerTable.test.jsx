import React from 'react';
import { render, screen, within } from '@testing-library/react';
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
});
