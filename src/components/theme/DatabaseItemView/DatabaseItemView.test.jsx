import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DatabaseItemView from './DatabaseItemView';

// Mock the necessary modules
jest.mock('@plone/volto/helpers', () => ({
  BodyClass: (props) => <div {...props} />,
}));

jest.mock('@eeacms/volto-marine-policy/components', () => ({
  ItemMetadataSnippet: (props) => (
    <div data-testid="item-metadata-snippet" {...props} />
  ),
  ItemMetadata: (props) => <div data-testid="item-metadata" {...props} />,
}));

jest.mock('@eeacms/volto-marine-policy/utils', () => ({
  formatItemType: (type) => `Formatted ${type}`,
}));

describe('DatabaseItemView', () => {
  const mockContent = {
    '@type': 'MockType',
    title: 'Mock Title',
  };

  test('renders the component with content', () => {
    render(<DatabaseItemView content={mockContent} />);

    // Check if the title is rendered
    expect(screen.getByText('Mock Title')).toBeInTheDocument();

    // Check if the formatted item type is rendered
    expect(screen.getByText('Formatted MockType')).toBeInTheDocument();

    // Check if ItemMetadataSnippet and ItemMetadata are rendered
    expect(screen.getByTestId('item-metadata-snippet')).toBeInTheDocument();
    expect(screen.getByTestId('item-metadata')).toBeInTheDocument();

    // Check if map_preview is passed as a string
    expect(screen.getByTestId('item-metadata')).toHaveAttribute(
      'map_preview',
      'true',
    );
  });
});
