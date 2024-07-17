import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

import StickyHeader from './StickyHeader';

const mockStore = configureStore();

test('renders a sticky header component', () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  const component = renderer.create(
    <Provider store={store}>
      <StickyHeader stickyBreakpoint={700} />
    </Provider>,
  );
  const json = component.toJSON();
  expect(json).toMatchSnapshot();
});
