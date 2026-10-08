import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import DemoSitesList from './DemoSitesListing';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Component) => Component,
}));

const createFeature = (title, path) => ({
  values_: { title, path },
});

describe('DemoSitesList', () => {
  it('lists features in title order and shows the empty-results message', () => {
    const pointsSource = {
      getFeatures: jest.fn(() => [
        createFeature('Zulu site', '/zulu'),
        createFeature('Alpha site', '/alpha'),
      ]),
    };

    const { rerender } = render(
      <DemoSitesList
        pointsSource={pointsSource}
        selectedCase={null}
        onSelectedCase={jest.fn()}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Alpha site',
      'Zulu site',
    ]);

    pointsSource.getFeatures.mockReturnValue([]);
    rerender(
      <DemoSitesList
        pointsSource={pointsSource}
        selectedCase={null}
        onSelectedCase={jest.fn()}
      />,
    );

    expect(
      screen.getByText(
        'We could not find any results for your search criteria',
      ),
    ).toBeInTheDocument();
  });
});
