import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import ContextNavigationEdit from './Edit';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();

jest.mock('@plone/volto/components', () => ({
  SidebarPortal: ({ children }) => (
    <div>
      <div>SidebarPortal</div>
      {children}
    </div>
  ),
}));

jest.mock('@plone/volto/components/manage/Form/BlockDataForm', () => {
  return {
    __esModule: true,
    default: ({ params }) => {
      return <div>BlockDataForm {params}</div>;
    },
  };
});

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
    types: [],
  },
});

describe('ContextNavigationEdit', () => {
  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationEdit />
        </Router>
      </Provider>,
    );

    expect(getByText('SidebarPortal')).toBeInTheDocument();
  });

  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationEdit selected={true} onChangeBlock={() => {}} />
        </Router>
      </Provider>,
    );

    // expect(getByText('InlineForm')).toBeInTheDocument();
    expect(getByText('SidebarPortal')).toBeInTheDocument();
  });
});
