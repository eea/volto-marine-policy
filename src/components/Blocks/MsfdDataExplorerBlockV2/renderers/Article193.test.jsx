import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Article193 from './Article193';

jest.mock('../LegacyView', () => () => <div>Legacy explorer</div>);
jest.mock('./Article193Explorer', () => (props) => (
  <div data-testid="article-19-3-explorer">Cycle: {props.cycle}</div>
));

describe('Article193 renderer', () => {
  it.each(['2024', '2020', '2018', '2012'])(
    'renders the React explorer for the %s information type',
    (cycle) => {
      render(<Article193 cycle={cycle} />);

      expect(screen.getByTestId('article-19-3-explorer')).toHaveTextContent(
        `Cycle: ${cycle}`,
      );
      expect(screen.queryByText('Legacy explorer')).not.toBeInTheDocument();
    },
  );

  it('defaults to the 2024 information type', () => {
    render(<Article193 />);

    expect(screen.getByTestId('article-19-3-explorer')).toHaveTextContent(
      'Cycle: 2024',
    );
  });

  it('falls back to the legacy explorer for unsupported information types', () => {
    render(<Article193 cycle="2016" />);

    expect(screen.getByText('Legacy explorer')).toBeInTheDocument();
    expect(
      screen.queryByTestId('article-19-3-explorer'),
    ).not.toBeInTheDocument();
  });
});
