import { jest } from '@jest/globals';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import IconWidget, { hasIconValue } from './IconWidget';

// The widget only adds the remove control on top of Volto's image widget, so
// the image widget itself can be a stub in these tests.
jest.mock('@plone/volto/components/manage/Widgets/ImageWidget', () => ({
  __esModule: true,
  default: ({ value }) => (
    <div className="image-widget-stub">{JSON.stringify(value)}</div>
  ),
}));

const renderWidget = (props = {}) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <IconWidget id="icon-0" onChange={jest.fn()} {...props} />
    </IntlProvider>,
  );

describe('FactsheetsDescriptorsBlock IconWidget', () => {
  it('renders Volto image widget with the current value', () => {
    renderWidget({ value: '/marine/icons/fish.svg' });

    expect(screen.getByText('"/marine/icons/fish.svg"')).toBeInTheDocument();
  });

  it('clears the icon when the remove button is clicked', () => {
    const onChange = jest.fn();
    renderWidget({ value: '/marine/icons/fish.svg', onChange });

    fireEvent.click(screen.getByRole('button', { name: 'Remove icon' }));

    expect(onChange).toHaveBeenCalledWith('icon-0', null);
  });

  it('offers no remove button when there is no icon', () => {
    renderWidget({ value: null });

    expect(
      screen.queryByRole('button', { name: 'Remove icon' }),
    ).not.toBeInTheDocument();
  });

  it('treats a picked image object as a value to remove', () => {
    expect(hasIconValue({ '@id': '/marine/icons/fish.svg' })).toBe(true);
    expect(hasIconValue(['/marine/icons/fish.svg'])).toBe(true);
    expect(hasIconValue([])).toBe(false);
    expect(hasIconValue(null)).toBe(false);
    expect(hasIconValue(undefined)).toBe(false);
  });
});
