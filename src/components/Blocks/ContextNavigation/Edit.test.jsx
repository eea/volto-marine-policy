import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ContextNavigationEdit from './Edit';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

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

describe('ContextNavigationEdit', () => {
  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { getByText, queryByText } = render(
      <Router history={history}>
        <ContextNavigationEdit />
      </Router>,
    );

    expect(queryByText('InlineForm')).toBeNull();
    expect(getByText('SidebarPortal')).toBeInTheDocument();
  });

  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { container, getByText } = render(
      <Router history={history}>
        <ContextNavigationEdit selected={true} onChangeBlock={() => {}} />
      </Router>,
    );

    expect(getByText('InlineForm')).toBeInTheDocument();
    expect(getByText('SidebarPortal')).toBeInTheDocument();

    fireEvent.change(container.querySelector('#test'), {
      target: { value: 'test' },
    });
  });
});
