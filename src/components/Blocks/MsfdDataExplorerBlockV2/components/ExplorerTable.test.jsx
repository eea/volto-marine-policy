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

const multiColumns = [
  { key: 'Feature', label: 'Feature(s)', sortable: false, maxItems: 10 },
];

const multiCell = (count) => ({
  text: 'multi',
  tooltip: 'codes',
  empty: false,
  items: Array.from({ length: count }, (_, index) => `Item ${index}`),
});

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

  it('collapses a multi cell above maxItems and expands on demand', () => {
    renderTable([{ Feature: multiCell(13) }], { columns: multiColumns });

    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(10);
    expect(screen.getByText('Item 9')).toBeInTheDocument();
    expect(screen.queryByText('Item 10')).toBeNull();

    fireEvent.click(screen.getByText('Show 3 more'));

    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(13);
    expect(screen.getByText('Item 12')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show less'));
    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(10);
  });

  it('does not collapse a multi cell at or below maxItems', () => {
    renderTable([{ Feature: multiCell(10) }], { columns: multiColumns });

    expect(document.querySelectorAll('ul.msfd-cell-list li')).toHaveLength(10);
    expect(screen.queryByText(/Show \d+ more/)).toBeNull();
  });

  it('renders URL items in a multi cell as links', () => {
    renderTable(
      [
        {
          Feature: {
            text: 'http://a;http://b',
            items: ['http://a', 'http://b'],
            empty: false,
          },
        },
      ],
      { columns: multiColumns },
    );

    const links = document.querySelectorAll('ul.msfd-cell-list a.msfd-link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'http://a');
    expect(links[1]).toHaveAttribute('href', 'http://b');
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

  // Pinning is opt-in per column: nothing is pinned until the user ticks the
  // checkbox in that column's header. Ticking it moves the column to the left
  // edge of the table straight away (long before it would have scrolled out of
  // view); unticking it sends the column back to its place.
  it('moves a pinned column to the left edge', () => {
    renderTable([
      {
        Feature: { text: 'Nutrients', empty: false },
        MarineReportingUnit: { text: 'ANS-DE-1', empty: false },
        GESDescription: { text: 'Good status', empty: false },
      },
    ]);

    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(columns.length);
    boxes.forEach((box) => expect(box).not.toBeChecked());
    expect(document.querySelectorAll('.msfd-pinned')).toHaveLength(0);

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column GES Description' }),
    );

    const heads = Array.from(document.querySelectorAll('th'));
    // The column count is unchanged: the column is moved, not duplicated.
    expect(heads).toHaveLength(columns.length);
    expect(heads[0]).toHaveClass('msfd-pinned');
    expect(heads[0]).toHaveTextContent('GES Description');
    // A lone pinned column is both edges of the pinned strip.
    expect(heads[0]).toHaveClass('is-pinned-first');
    expect(heads[0]).toHaveClass('is-pinned-last');
    // It no longer appears in its original place.
    const labels = Array.from(document.querySelectorAll('th')).map((th) =>
      th.textContent.trim(),
    );
    expect(labels.filter((label) => label === 'GES Description')).toHaveLength(
      1,
    );

    const cells = document.querySelector('tbody tr').children;
    expect(cells).toHaveLength(columns.length);
    expect(cells[0]).toHaveClass('msfd-pinned');
    expect(cells[0]).toHaveTextContent('Good status');

    // The pinned header still carries the pin checkbox, so the column can be
    // released without scrolling.
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Unpin column GES Description' }),
    );

    expect(document.querySelectorAll('.msfd-pinned')).toHaveLength(0);
    const restored = Array.from(document.querySelectorAll('th'));
    expect(restored).toHaveLength(columns.length);
    expect(restored[2]).toHaveTextContent('GES Description');
  });

  // The X in the pin bar drops every pin at once, so a reader who pinned a few
  // columns can get the original table back without hunting each checkbox.
  it('unpins all columns from the pin bar', () => {
    renderTable([
      {
        Feature: { text: 'Nutrients', empty: false },
        MarineReportingUnit: { text: 'ANS-DE-1', empty: false },
        GESDescription: { text: 'Good status', empty: false },
      },
    ]);

    // Nothing pinned: there is no pin bar to clear.
    expect(
      screen.queryByRole('button', { name: /Unpin all columns/ }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column GES Description' }),
    );
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column Feature(s)' }),
    );

    expect(document.querySelectorAll('.msfd-pinned')).toHaveLength(4);
    expect(screen.getByText('2 pinned columns')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unpin all columns' }));

    expect(document.querySelectorAll('.msfd-pinned')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Unpin all columns/ }),
    ).toBeNull();
    // The table is back in its original column order.
    expect(
      Array.from(document.querySelectorAll('th')).map((th) =>
        th.textContent.trim(),
      ),
    ).toEqual(['Feature(s)', 'Marine Reporting Unit(s)', 'GES Description']);
  });

  // Several columns can be pinned at once; the pinned strip is stacked in column
  // order, whichever order they were pinned in, and the offsets are published on
  // the frame for the cells to read.
  it('stacks the pinned columns in column order', () => {
    const width = (element, property, value) =>
      Object.defineProperty(element, property, {
        configurable: true,
        value,
      });

    renderTable([
      {
        Feature: { text: 'Nutrients', empty: false },
        MarineReportingUnit: { text: 'ANS-DE-1', empty: false },
        GESDescription: { text: 'Good status', empty: false },
      },
    ]);

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column GES Description' }),
    );
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column Feature(s)' }),
    );

    const heads = Array.from(document.querySelectorAll('th.msfd-pinned'));
    expect(heads).toHaveLength(2);
    expect(heads[0]).toHaveTextContent('Feature(s)');
    expect(heads[0]).toHaveClass('is-pinned-first');
    expect(heads[1]).toHaveTextContent('GES Description');
    expect(heads[1]).toHaveClass('is-pinned-last');

    width(heads[0], 'offsetWidth', 100);
    width(heads[1], 'offsetWidth', 140);
    const scroller = screen.getByRole('region', {
      name: 'Results table, scrollable horizontally',
    });
    fireEvent.scroll(scroller);

    const frame = scroller.parentElement;
    expect(frame.style.getPropertyValue('--msfd-pin-offset-0')).toBe('0px');
    expect(frame.style.getPropertyValue('--msfd-pin-offset-1')).toBe('100px');
    expect(frame.style.getPropertyValue('--msfd-sticky-width')).toBe('240px');
  });

  // The pin checkboxes are easy to miss in a dense header, so a coach mark
  // points at them until the user pins something or dismisses it.
  it('shows a dismissible hint about pinning columns', () => {
    renderTable([{ Feature: { text: 'Nutrients', empty: false } }]);

    expect(screen.getByText(/You can pin a column/)).toBeInTheDocument();
    expect(document.querySelector('.msfd-table-frame')).toHaveClass(
      'is-hinting',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Dismiss the column pinning hint/,
      }),
    );

    expect(screen.queryByText(/You can pin a column/)).toBeNull();
    expect(document.querySelector('.msfd-table-frame')).not.toHaveClass(
      'is-hinting',
    );
  });

  it('hides the hint once a column is pinned', () => {
    renderTable([{ Feature: { text: 'Nutrients', empty: false } }]);

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Pin column Feature(s)' }),
    );

    expect(screen.queryByText(/You can pin a column/)).toBeNull();
    // The glow on the checkboxes is tied to the hint, so it stops with it.
    expect(document.querySelector('.msfd-table-frame')).not.toHaveClass(
      'is-hinting',
    );
  });

  // The results table scrolls sideways, which is easy to miss: the box is a
  // focusable region, and each edge gets a cue for as long as it hides content.
  it('shows the edge cues only on the sides that hide more table', () => {
    const width = (element, property, value) =>
      Object.defineProperty(element, property, {
        configurable: true,
        value,
      });

    renderTable([{ Feature: { text: 'Nutrients', empty: false } }]);

    const scroller = screen.getByRole('region', {
      name: 'Results table, scrollable horizontally',
    });
    const left = document.querySelector('.msfd-table-cue.is-left');
    const right = document.querySelector('.msfd-table-cue.is-right');

    expect(scroller).toHaveAttribute('tabindex', '0');
    // jsdom reports a zero-width box, i.e. nothing to scroll.
    expect(left).not.toHaveClass('is-visible');
    expect(right).not.toHaveClass('is-visible');
    expect(scroller.parentElement).not.toHaveClass('is-scrolled');

    // A table twice as wide as the box, scrolled to the start: only the right
    // edge hides content.
    width(scroller, 'scrollWidth', 800);
    width(scroller, 'clientWidth', 400);
    width(scroller, 'scrollLeft', 0);
    fireEvent.scroll(scroller);
    expect(left).not.toHaveClass('is-visible');
    expect(right).toHaveClass('is-visible');

    // Halfway: content on both sides, and the frame flags that the table's own
    // left border has scrolled away.
    width(scroller, 'scrollLeft', 200);
    fireEvent.scroll(scroller);
    expect(left).toHaveClass('is-visible');
    expect(right).toHaveClass('is-visible');
    expect(scroller.parentElement).toHaveClass('is-scrolled');

    // At the end: the right cue is gone.
    width(scroller, 'scrollLeft', 400);
    fireEvent.scroll(scroller);
    expect(left).toHaveClass('is-visible');
    expect(right).not.toHaveClass('is-visible');

    // With nothing pinned the left cue is anchored to the table edge, and the
    // cells carry no sticky offset.
    expect(
      scroller.parentElement.style.getPropertyValue('--msfd-sticky-width'),
    ).toBe('0px');
    expect(document.querySelector('th.msfd-pinned')).toBeNull();

    // Pinning a column from its header checkbox anchors the cue to the right
    // edge of the pinned run and publishes that column's offset for the cells.
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    width(document.querySelector('th.msfd-pinned'), 'offsetWidth', 180);
    fireEvent.scroll(scroller);
    expect(
      scroller.parentElement.style.getPropertyValue('--msfd-pin-offset-0'),
    ).toBe('0px');
    expect(
      scroller.parentElement.style.getPropertyValue('--msfd-sticky-width'),
    ).toBe('180px');

    // Same for the horizontal scrollbar: the cues have to stop above it.
    width(scroller, 'offsetHeight', 240);
    width(scroller, 'clientHeight', 229);
    fireEvent.scroll(scroller);
    expect(
      scroller.parentElement.style.getPropertyValue('--msfd-scrollbar-height'),
    ).toBe('11px');
  });
});
