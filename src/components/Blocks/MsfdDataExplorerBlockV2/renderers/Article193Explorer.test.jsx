import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Article193Explorer from './Article193Explorer';

// Stub the shared explorer and keep the config it is handed, so the test can
// assert on the Article 19.3 specific settings.
const mockProps = {};

jest.mock('./DataExplorer', () => (props) => {
  mockProps.config = props.config;

  return <div data-testid="data-explorer" />;
});

describe('Article193Explorer', () => {
  const renderExplorer = (cycle = '2024') =>
    render(<Article193Explorer cycle={cycle} />);

  it('keeps the Article 19.3 identity and download name', () => {
    renderExplorer();

    expect(screen.getByTestId('data-explorer')).toBeInTheDocument();
    expect(mockProps.config.articleId).toBe('19.3');
    expect(mockProps.config.subject).toBe('datasets');
    expect(mockProps.config.csvName('2020')).toBe(
      'article-19-3-datasets-2020.csv',
    );
  });

  it.each(['2024', '2020', '2018', '2012'])(
    'requests Summary & insights for the %s information type',
    (cycle) => {
      renderExplorer(cycle);

      expect(mockProps.config.supportsSummary(cycle)).toBe(true);
    },
  );

  it('does not request Summary & insights for an unknown information type', () => {
    renderExplorer('2016');

    expect(mockProps.config.supportsSummary('2016')).toBe(false);
  });

  it('treats a numeric information type like a string one', () => {
    renderExplorer(2024);

    expect(mockProps.config.supportsSummary(2024)).toBe(true);
  });
});
