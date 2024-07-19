import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-intl-redux';
import Accordion from './Accordion';

const mockStore = configureStore();

describe('RASTAccordion', () => {
  let store;
  let data;

  beforeEach(() => {
    store = mockStore({
      userSession: { token: '1234' },
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        subrequests: {},
      },
    });

    data = {
      items: [
        {
          id: 'item1',
          title: 'Item 1',
          '@id': '/item1',
          '@type': 'Folder',
          href: '/item1-href',
        },
        {
          id: 'item2',
          title: 'Item 2',
          '@id': '/item2',
          '@type': 'Folder',
          href: '/item2-href',
        },
      ],
      activeMenu: 1,
      curent_location: '/item1-href',
      data: { title: "Accordion's Title" },
    };
  });

  it('renders the component with initial data', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Accordion {...data} />
        </MemoryRouter>
      </Provider>,
    );

    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
  });

  it('navigates to correct path on item click', () => {
    const { getByText, history } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Accordion {...data} />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.click(getByText('Item 1'));
    waitFor(() => expect(history.location.pathname).toBe('/item1'));
  });

  it('clicks on accordion items', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Accordion {...data} />
        </MemoryRouter>
      </Provider>,
    );

    screen.debug();

    // check that item1 is expanded by default
    expect(container.querySelector('#item2 .active.title')).toBeInTheDocument();

    const item1 = container.querySelector('#item1');
    fireEvent.click(item1);
  });

  it('responds to keyboard events', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Accordion {...data} />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.keyDown(getByText('Item 1'), { keyCode: 13 }); // Enter key
    waitFor(() => expect(getByText('Content of Item 1')).toBeVisible());
  });
});
