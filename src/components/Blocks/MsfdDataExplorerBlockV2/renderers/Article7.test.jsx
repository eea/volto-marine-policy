import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Article7 from './Article7';

jest.mock('../LegacyView', () => () => <div>Legacy explorer</div>);
jest.mock('./Article7Explorer', () => (props) => (
  <div data-testid="article-7-explorer">Cycle: {props.cycle}</div>
));

describe('Article7 renderer', () => {
  it('renders the React explorer for the 2012 cycle', () => {
    render(<Article7 cycle="2012" />);

    expect(screen.getByTestId('article-7-explorer')).toHaveTextContent(
      'Cycle: 2012',
    );
    expect(screen.queryByText('Legacy explorer')).not.toBeInTheDocument();
  });

  it('defaults to the 2012 cycle', () => {
    render(<Article7 />);

    expect(screen.getByTestId('article-7-explorer')).toHaveTextContent(
      'Cycle: 2012',
    );
  });

  it('falls back to the legacy explorer for unsupported cycles', () => {
    render(<Article7 cycle="2024" />);

    expect(screen.getByText('Legacy explorer')).toBeInTheDocument();
    expect(screen.queryByTestId('article-7-explorer')).not.toBeInTheDocument();
  });
});
