import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

import HeroSection from './HeroSection';

const mockStore = configureStore();

test('renders Hero section component', () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  const component = renderer.create(
    <Provider store={store}>
      <HeroSection
        image_caption="caption"
        image_url="https://www.google.com"
        content_description="description"
        content_title="title"
      />
    </Provider>,
  );
  const json = component.toJSON();
  expect(json).toMatchSnapshot();
});
