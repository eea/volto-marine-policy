import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  DemoSitesFilter,
  DemoSitesFilters,
  SearchBox,
} from './DemoSitesFilters';

describe('DemoSitesFilter', () => {
  it('sorts choices alphabetically and updates active filters', () => {
    const setActiveFilters = jest.fn();
    const filters = {
      country_filter: { PT: 'Portugal', ES: 'Spain' },
    };
    const activeFilters = { country_filter: [] };

    render(
      <DemoSitesFilter
        filterTitle="Country"
        filterName="country_filter"
        filters={filters}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />,
    );

    const choices = screen.getAllByRole('checkbox');
    expect(choices.map((choice) => choice.value)).toEqual(['PT', 'ES']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Portugal' }));

    expect(setActiveFilters).toHaveBeenCalledWith({ country_filter: ['PT'] });
  });

  it('shows the filter controls except for map variations with hidden filters', () => {
    const filterProps = {
      filters: {
        target_filter: {},
        indicator_filter: {},
        project_filter: {},
        country_filter: {},
      },
      activeFilters: {
        target_filter: [],
        indicator_filter: [],
        project_filter: [],
        country_filter: [],
      },
      setActiveFilters: jest.fn(),
      hideFilters: false,
      highlightedIndex: 5,
      mapVariation: 'blueParks',
    };

    const { container } = render(<DemoSitesFilters {...filterProps} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SearchBox', () => {
  it('submits a normalized query when Enter is pressed', () => {
    const setSearchInput = jest.fn();
    const onSelectedCase = jest.fn();

    render(
      <SearchBox
        setSearchInput={setSearchInput}
        onSelectedCase={onSelectedCase}
      />,
    );

    const input = screen.getByPlaceholderText('Search with a keyword...');
    fireEvent.change(input, { target: { value: 'Marine (sites)?' } });
    fireEvent.keyDown(input, { code: 'Enter' });

    expect(onSelectedCase).toHaveBeenCalledWith(null);
    expect(setSearchInput).toHaveBeenCalledWith('\\bmarine sites.\\b');
  });
});
