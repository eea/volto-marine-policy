import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ObjectivesChart from './ObjectivesChart';

jest.mock('@loadable/component', () => () => () => <div>Chart</div>);

const objective =
  'Objective 1: Protect and restore marine and freshwater ecosystems and biodiversity';

const item = { properties: { objective: [objective] } };

describe('ObjectivesChart', () => {
  it('renders objective counts and synchronizes the highlighted objective filter', () => {
    const setActiveFilters = jest.fn();

    render(
      <ObjectivesChart
        items={[item]}
        activeItems={[item]}
        activeFilters={{ objective_filter: [] }}
        setActiveFilters={setActiveFilters}
        highlightedIndex={0}
        setHighlightedIndex={jest.fn()}
        initialized
        setInitialized={jest.fn()}
      />,
    );

    expect(screen.getByText(objective)).toBeInTheDocument();
    expect(
      screen.getByText('Demo sites and Associated regions'),
    ).toBeInTheDocument();
    expect(screen.getByText('Objective/Enabler')).toBeInTheDocument();
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(setActiveFilters).toHaveBeenCalled();
  });

  it('renders no chart when the highlighted index is below the supported range', () => {
    const { container } = render(
      <ObjectivesChart
        items={[]}
        activeItems={[]}
        activeFilters={{ objective_filter: [] }}
        setActiveFilters={jest.fn()}
        highlightedIndex={-2}
        setHighlightedIndex={jest.fn()}
        initialized
        setInitialized={jest.fn()}
      />,
    );

    expect(
      container.querySelector('.objectives-chart'),
    ).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });
});
