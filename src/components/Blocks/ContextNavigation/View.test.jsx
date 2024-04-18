import React from 'react';
import { render } from '@testing-library/react';
import ContextNavigationView from './View';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

jest.mock(
  '@eeacms/volto-marine-policy/components/Blocks/ContextNavigation/ContextNavigation',
  () => {
    return {
      __esModule: true,
      default: ({ params }) => {
        return <div>ContextNavigation {params.root_path}</div>;
      },
    };
  },
);

describe('ContextNavigationView', () => {
  let history;
  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('renders corectly', () => {
    const { container } = render(
      <Router history={history}>
        <ContextNavigationView />
      </Router>,
    );

    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation',
    );
  });

  it('renders corectly', () => {
    const { container } = render(
      <Router history={history}>
        <ContextNavigationView
          data={{
            navProps: { root_path: 'https://localhost:3000/test' },
            root_node: [{ '@id': 'root_node' }],
          }}
        />
      </Router>,
    );
    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation root_node',
    );
  });
});
