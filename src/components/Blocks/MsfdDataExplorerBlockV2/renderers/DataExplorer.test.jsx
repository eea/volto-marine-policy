import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import DataExplorer from './DataExplorer';
import { fetchExplorer } from '../api';

jest.mock('../api', () => ({ fetchExplorer: jest.fn() }));
jest.mock('../components/FilterPanel', () => () => <div>Filters</div>);
jest.mock('../components/ExplorerTable', () => ({ rows }) => (
  <div data-testid="results-table">
    {rows.map((row) => row.name).join(', ')}
  </div>
));
jest.mock('../components/Pagination', () => () => <div>Pagination</div>);
jest.mock('../components/PanelLoader', () => () => <div>Loading results</div>);
jest.mock('../components/SummaryInsights', () => () => <div>Summary</div>);

const config = {
  articleId: '4',
  subject: 'Marine Reporting Units',
  csvName: (cycle) => `article-4-${cycle}.csv`,
  supportsSummary: () => false,
};

const renderExplorer = (props = {}) =>
  render(
    <MemoryRouter>
      <DataExplorer
        config={config}
        cycle="2024"
        editable
        sidebar={<aside>Explorer sidebar</aside>}
        {...props}
      />
    </MemoryRouter>,
  );

const filtersResponse = { filters: [] };
const dataResponse = {
  columns: [{ key: 'name', label: 'Name' }],
  rows: [{ name: 'North Sea' }],
  pagination: { page: 0, pageSize: 10, pageCount: 1, total: 1 },
};

describe('DataExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchExplorer.mockImplementation(({ view }) =>
      Promise.resolve(view === 'filters' ? filtersResponse : dataResponse),
    );
  });

  it('fetches filters and results, then renders the result table', async () => {
    renderExplorer();

    expect(screen.getByText('Loading results')).toBeInTheDocument();
    expect(await screen.findByTestId('results-table')).toHaveTextContent(
      'North Sea',
    );
    expect(
      screen.getByText('1 Marine Reporting Units found'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pagination')).toBeInTheDocument();

    expect(fetchExplorer).toHaveBeenCalledWith(
      expect.objectContaining({
        article: '4',
        cycle: '2024',
        view: 'filters',
        selections: {},
      }),
    );
    expect(fetchExplorer).toHaveBeenCalledWith(
      expect.objectContaining({
        article: '4',
        cycle: '2024',
        view: 'data',
        selections: {},
        page: 0,
        pageSize: 10,
      }),
    );
  });

  it('shows the empty state when there are no result rows', async () => {
    fetchExplorer.mockImplementation(({ view }) =>
      Promise.resolve(
        view === 'filters'
          ? filtersResponse
          : { ...dataResponse, rows: [], pagination: { total: 0 } },
      ),
    );

    renderExplorer();

    expect(await screen.findByText('No data reported')).toBeInTheDocument();
    expect(screen.queryByTestId('results-table')).not.toBeInTheDocument();
  });

  it('shows the service-unavailable message when the results request returns 503', async () => {
    fetchExplorer.mockImplementation(({ view }) =>
      view === 'filters'
        ? Promise.resolve(filtersResponse)
        : Promise.reject({ response: { status: 503 } }),
    );

    renderExplorer();

    expect(
      await screen.findByText(
        'The MSFD database is not available, please try again later.',
      ),
    ).toBeInTheDocument();
  });
});
