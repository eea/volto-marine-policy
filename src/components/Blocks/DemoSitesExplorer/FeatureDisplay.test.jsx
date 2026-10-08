import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FeatureDisplay from './FeatureDisplay';

describe('FeatureDisplay', () => {
  it('renders the feature title and optional details', () => {
    render(
      <FeatureDisplay
        feature={{
          title: 'A marine demonstration site',
          info: 'Site information',
          country: 'Portugal',
          project: 'Ocean project',
          project_link: '',
          objective: ['Restore marine ecosystems'],
          indicators: [{ title: 'Water quality', path: '/indicators/water' }],
        }}
      />,
    );

    expect(screen.getByText('A marine demonstration site')).toBeInTheDocument();
    expect(screen.getByText('Site information')).toBeInTheDocument();
    expect(screen.getByText('Portugal')).toBeInTheDocument();
    expect(screen.getByText('Ocean project')).toBeInTheDocument();
    expect(screen.getByText('Restore marine ecosystems')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Water quality' })).toHaveAttribute(
      'href',
      '/indicators/water',
    );
  });

  it('renders valid info URLs as links', () => {
    render(
      <FeatureDisplay
        feature={{
          title: 'Site',
          info: 'https://example.org/info',
          objective: [],
          indicators: [],
        }}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'https://example.org/info' }),
    ).toHaveAttribute('target', '_blank');
  });

  it('renders nothing when no feature is selected', () => {
    const { container } = render(<FeatureDisplay />);

    expect(container.firstChild).toBeNull();
  });
});
