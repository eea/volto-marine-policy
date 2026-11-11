import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import MsfdDataExplorerBlockV2View from './View';

const renderView = (props, initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MsfdDataExplorerBlockV2View {...props} />
    </MemoryRouter>,
  );

describe('MsfdDataExplorerBlockV2View', () => {
  it('prompts editors to select an article when none is configured', () => {
    renderView({ data: {}, editable: true });

    expect(screen.getByText('Select article')).toBeInTheDocument();
  });

  it('renders no explorer in view mode when no article is configured', () => {
    const { container } = renderView({ data: {}, editable: false });

    expect(container.firstChild).toBeNull();
  });

  it('renders the Article 4 explorer and sidebar for a configured article', () => {
    renderView({ data: { article_select: '4' }, editable: true });

    expect(screen.getByText('Marine Reporting Units')).toBeInTheDocument();
    expect(screen.getByText('MSFD Articles')).toBeInTheDocument();
    expect(screen.getByText('Reporting cycle')).toBeInTheDocument();
  });

  it('adds the article page class next to the explorer class', () => {
    const { container } = renderView({
      data: { article_select: '9' },
      editable: true,
    });

    expect(container.firstChild).toHaveClass('msfd-explorer-v2');
    expect(container.firstChild).toHaveClass('article-9');
  });

  it('adds the article page class in view mode too', () => {
    const { container } = renderView({
      data: { article_select: 'datasets-used' },
      editable: false,
    });

    expect(container.firstChild).toHaveClass('msfd-explorer-v2');
    expect(container.firstChild).toHaveClass('datasets-used');
  });

  it('uses the article and cycle from URL overrides in view mode', () => {
    renderView(
      { data: { article_select: '4' }, editable: false },
      '/?msfd_cycle=2018',
    );

    expect(screen.getByText('Marine Reporting Units')).toBeInTheDocument();
    expect(screen.getByText('MSFD Articles')).toBeInTheDocument();
  });
});
