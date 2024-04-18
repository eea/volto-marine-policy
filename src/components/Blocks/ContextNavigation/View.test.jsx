import React from 'react';
import { render } from '@testing-library/react';
import ContextNavigationView from './View';
import { Router } from 'react-router-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();

const store = mockStore({
  userSession: { token: '1234' },
  intl: {
    locale: 'en',
    messages: {},
  },
  content: {
    subrequests: {},
  },
  types: {
    types: {},
  },
});

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
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationView />
        </Router>
      </Provider>,
    );

    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation',
    );
  });

  it('renders corectly', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationView
            data={{
              navProps: { root_path: 'https://localhost:3000/test' },
              root_node: [{ '@id': 'root_node' }],
            }}
          />
        </Router>
      </Provider>,
    );
    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation root_node',
    );
  });
});
