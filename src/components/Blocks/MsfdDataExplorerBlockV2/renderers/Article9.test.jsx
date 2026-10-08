import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Article9 from './Article9';

jest.mock('../LegacyView', () => () => <div>Legacy explorer</div>);
jest.mock('./Article9Explorer', () => (props) => (
  <div data-testid="article-9-explorer">Cycle: {props.cycle}</div>
));

describe('Article9 renderer', () => {
  it.each(['2024', '2018', '2012'])(
    'renders the React explorer for the %s period',
    (cycle) => {
      render(<Article9 cycle={cycle} />);

      expect(screen.getByTestId('article-9-explorer')).toHaveTextContent(
        `Cycle: ${cycle}`,
      );
      expect(screen.queryByText('Legacy explorer')).not.toBeInTheDocument();
    },
  );

  it('defaults to the 2024 period', () => {
    render(<Article9 />);

    expect(screen.getByTestId('article-9-explorer')).toHaveTextContent(
      'Cycle: 2024',
    );
  });

  it('falls back to the legacy explorer for unsupported periods', () => {
    render(<Article9 cycle="2020" />);

    expect(screen.getByText('Legacy explorer')).toBeInTheDocument();
    expect(screen.queryByTestId('article-9-explorer')).not.toBeInTheDocument();
  });
});
