import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Article4 from './Article4';

jest.mock('../LegacyView', () => () => <div>Legacy explorer</div>);
jest.mock('./Article4Explorer', () => (props) => (
  <div data-testid="article-4-explorer">Cycle: {props.cycle}</div>
));

describe('Article4 renderer', () => {
  it.each(['2012', '2018', '2024'])(
    'renders the React explorer for cycle %s',
    (cycle) => {
      render(<Article4 cycle={cycle} />);

      expect(screen.getByTestId('article-4-explorer')).toHaveTextContent(
        `Cycle: ${cycle}`,
      );
      expect(screen.queryByText('Legacy explorer')).not.toBeInTheDocument();
    },
  );

  it('defaults to the 2024 cycle', () => {
    render(<Article4 />);

    expect(screen.getByTestId('article-4-explorer')).toHaveTextContent(
      'Cycle: 2024',
    );
  });

  it('falls back to the legacy explorer for unsupported cycles', () => {
    render(<Article4 cycle="2008" />);

    expect(screen.getByText('Legacy explorer')).toBeInTheDocument();
    expect(screen.queryByTestId('article-4-explorer')).not.toBeInTheDocument();
  });
});
