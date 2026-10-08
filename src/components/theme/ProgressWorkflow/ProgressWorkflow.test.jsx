import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import ProgressWorkflow, { getWorkflowProgress } from './ProgressWorkflow';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: () => null,
}));
jest.mock('@plone/volto/actions/workflow/workflow', () => ({
  transitionWorkflow: jest.fn(),
}));

describe('getWorkflowProgress', () => {
  it('builds the request descriptor for the workflow progress endpoint', () => {
    expect(getWorkflowProgress('/site/page')).toEqual({
      type: 'WORKFLOW_PROGRESS_PATH',
      item: '/site/page',
      request: {
        op: 'get',
        path: '/site/page/@workflow.progress.nis',
        headers: { Accept: 'application/json' },
      },
    });
  });
});

describe('ProgressWorkflow', () => {
  it('renders nothing for anonymous visitors', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <ProgressWorkflow
          pathname="/site/page"
          content={{ '@id': '/site/page', review_state: 'private' }}
        />
      </IntlProvider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
