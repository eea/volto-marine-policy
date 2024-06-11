import { render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';

import MsfdDataExplorerBlockView from './View';

jest.mock('axios');

describe('MsfdDataExplorerBlockView', () => {
  const mockHtmlResponse = '<div class="msfd-search-wrapper">Content</div>';

  beforeEach(() => {
    axios.get.mockClear();
  });

  it('should prompt to select an article when none is selected', () => {
    const { getByText } = render(
      <MsfdDataExplorerBlockView data={{}} editable={true} />,
    );
    expect(getByText('Select article')).toBeInTheDocument();
  });

  it('displays loader while fetching data', () => {
    axios.get.mockResolvedValueOnce({ data: mockHtmlResponse });
    render(
      <MsfdDataExplorerBlockView
        Network={false}
        data={{ article_select: 'article1' }}
      />,
    );
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders content upon successful data fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: mockHtmlResponse });
    render(<MsfdDataExplorerBlockView data={{ article_select: 'article1' }} />);

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
