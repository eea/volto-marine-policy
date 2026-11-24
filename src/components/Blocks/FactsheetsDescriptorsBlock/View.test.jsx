import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import config from '@plone/volto/registry';

import View from './View';

// The block renders its text fields through the slate renderer. Volto's slate
// config is bootstrapped by the app, not by the add-on test config, so give the
// renderer the minimum it needs to turn nodes into elements.
config.settings.slate = {
  ...(config.settings.slate || {}),
  elements: {
    p: ({ children }) => <p>{children}</p>,
    default: ({ children }) => <p>{children}</p>,
  },
  leafs: {},
};

const paragraph = (text) => [{ type: 'p', children: [{ text }] }];

const makeGroup = (overrides = {}) => ({
  '@id': 'group-1',
  cards: [],
  ...overrides,
});

const makeCard = (overrides = {}) => ({
  '@id': 'card-1',
  icon: null,
  title: 'Birds',
  text: paragraph('0% GES achieved'),
  info: paragraph('75% reported area assessed'),
  background_color: '#FFFFFF',
  ...overrides,
});

describe('FactsheetsDescriptorsBlockView', () => {
  it('asks editors to add a group when the block is empty', () => {
    render(<View data={{}} mode="edit" />);

    expect(screen.getByText('Add a descriptor group.')).toBeInTheDocument();
  });

  it('renders nothing in view mode when the block is empty', () => {
    const { container } = render(<View data={{}} mode="view" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders the descriptor cards of a group', () => {
    render(
      <View
        data={{ groups: [makeGroup({ cards: [makeCard()] })] }}
        mode="view"
      />,
    );

    expect(screen.getByText('Birds')).toBeInTheDocument();
    expect(screen.getByText('0% GES achieved')).toBeInTheDocument();
    expect(screen.getByText('75% reported area assessed')).toBeInTheDocument();
  });

  it('does not render a group-level card from legacy data', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({
              icon: { '@id': '/marine/icons/state.svg', title: 'State icon' },
              title: paragraph('State descriptors'),
              description: paragraph('The condition of marine habitats.'),
              background_color: '#004B7F',
            }),
          ],
        }}
        mode="view"
      />,
    );

    expect(container.querySelector('.factsheet-descriptor-main')).toBeNull();
    expect(
      container.querySelector('.factsheet-descriptors-group').children,
    ).toHaveLength(0);
    expect(screen.queryByText('State descriptors')).toBeNull();
  });

  it('renders a slate title without nesting a paragraph in the heading', () => {
    render(
      <View
        data={{
          groups: [
            makeGroup({
              cards: [makeCard({ title: paragraph('Birds') })],
            }),
          ],
        }}
        mode="view"
      />,
    );

    const cardTitle = screen.getByRole('heading', { level: 4 });

    expect(cardTitle).toHaveTextContent('Birds');
    expect(cardTitle.querySelector('p')).toBeNull();
  });

  it('gives each group its own grid', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({ cards: [makeCard()] }),
            makeGroup({
              '@id': 'group-2',
              cards: [makeCard({ '@id': 'card-2', title: 'Mammals' })],
            }),
          ],
        }}
        mode="view"
      />,
    );

    expect(
      container.querySelectorAll('.factsheet-descriptors-group'),
    ).toHaveLength(2);
  });

  it('renders a card without a URL as plain, non-clickable content', () => {
    const { container } = render(
      <View
        data={{ groups: [makeGroup({ cards: [makeCard()] })] }}
        mode="view"
      />,
    );

    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('.factsheet-descriptor-card').tagName).toBe(
      'ARTICLE',
    );
  });

  it('makes the whole card a link when a URL is set', () => {
    render(
      <View
        data={{
          groups: [
            makeGroup({ cards: [makeCard({ url: '/marine/state/birds' })] }),
          ],
        }}
        mode="view"
      />,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/marine/state/birds');
    expect(link).toHaveTextContent('Birds');
    expect(link).toHaveClass('factsheet-descriptor-card--link');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external card links in a new tab', () => {
    render(
      <View
        data={{
          groups: [
            makeGroup({
              cards: [makeCard({ url: 'https://www.eea.europa.eu' })],
            }),
          ],
        }}
        mode="view"
      />,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not navigate while the block is being edited', () => {
    render(
      <View
        data={{
          groups: [makeGroup({ cards: [makeCard({ url: '/marine/state' })] })],
        }}
        mode="edit"
      />,
    );

    const link = screen.getByRole('link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('uses the stored background colour and derives the text colour from it', () => {
    render(
      <View
        data={{ groups: [makeGroup({ cards: [makeCard()] })] }}
        mode="view"
      />,
    );

    const card = screen
      .getByText('Birds')
      .closest('.factsheet-descriptor-card');

    expect(card).toHaveStyle({ backgroundColor: '#FFFFFF', color: '#3D5265' });
  });

  it('marks dark cards so the icon can be inverted', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({
              cards: [
                makeCard({
                  icon: {
                    '@id': '/marine/icons/fish.svg',
                    title: 'Fish icon',
                  },
                  background_color: '#004B7F',
                }),
              ],
            }),
          ],
        }}
        mode="view"
      />,
    );

    const card = container.querySelector('.factsheet-descriptor-card');
    const icons = container.querySelectorAll('img');

    expect(card).toHaveClass('factsheet-card-dark');
    expect(card.querySelector('img')).toHaveClass('factsheet-icon-inverted');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('alt', 'Fish icon');
  });

  it('falls back to the default background when none is stored', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({ cards: [makeCard({ background_color: undefined })] }),
          ],
        }}
        mode="view"
      />,
    );

    expect(container.querySelector('.factsheet-descriptor-card')).toHaveStyle({
      backgroundColor: '#FFFFFF',
    });
  });
});
