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
  icon: null,
  title: 'State descriptors',
  description: paragraph(
    'The condition of marine species, habitats and food webs.',
  ),
  background_color: '#004B7F',
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

  it('renders the main card of every group', () => {
    render(<View data={{ groups: [makeGroup()] }} mode="view" />);

    expect(screen.getByText('State descriptors')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The condition of marine species, habitats and food webs.',
      ),
    ).toBeInTheDocument();
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

  it('renders a slate title without nesting a paragraph in the heading', () => {
    render(
      <View
        data={{
          groups: [
            makeGroup({
              title: paragraph('State descriptors'),
              cards: [makeCard({ title: paragraph('Birds') })],
            }),
          ],
        }}
        mode="view"
      />,
    );

    const mainTitle = screen.getByRole('heading', { level: 3 });
    const cardTitle = screen.getByRole('heading', { level: 4 });

    expect(mainTitle).toHaveTextContent('State descriptors');
    expect(cardTitle).toHaveTextContent('Birds');
    expect(mainTitle.querySelector('p')).toBeNull();
    expect(cardTitle.querySelector('p')).toBeNull();
  });

  it('still renders titles saved as plain strings', () => {
    render(
      <View
        data={{ groups: [makeGroup({ title: 'State descriptors' })] }}
        mode="view"
      />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'State descriptors',
    );
  });

  it('skips an empty title but keeps the card', () => {
    render(<View data={{ groups: [makeGroup({ title: '' })] }} mode="view" />);

    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
    expect(
      document.querySelector('.factsheet-descriptor-main'),
    ).toBeInTheDocument();
  });

  it('gives each group its own grid', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup(),
            makeGroup({ '@id': 'group-2', title: 'Pressure descriptors' }),
          ],
        }}
        mode="view"
      />,
    );

    expect(
      container.querySelectorAll('.factsheet-descriptors-group'),
    ).toHaveLength(2);
  });

  it('uses the stored background colour and derives the text colour from it', () => {
    render(
      <View
        data={{ groups: [makeGroup({ cards: [makeCard()] })] }}
        mode="view"
      />,
    );

    const mainCard = screen
      .getByText('State descriptors')
      .closest('.factsheet-descriptor-main');
    const card = screen
      .getByText('Birds')
      .closest('.factsheet-descriptor-card');

    expect(mainCard).toHaveStyle({
      backgroundColor: '#004B7F',
      color: '#FFFFFF',
    });
    expect(card).toHaveStyle({ backgroundColor: '#FFFFFF', color: '#3D5265' });
  });

  it('marks dark cards so the icon can be inverted', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({
              icon: {
                '@id': '/marine/icons/fish.svg',
                title: 'State descriptors icon',
              },
              cards: [makeCard()],
            }),
          ],
        }}
        mode="view"
      />,
    );

    const mainCard = container.querySelector('.factsheet-descriptor-main');
    const card = container.querySelector('.factsheet-descriptor-card');
    const icons = container.querySelectorAll('img');

    expect(mainCard).toHaveClass('factsheet-card-dark');
    expect(mainCard.querySelector('img')).toHaveClass(
      'factsheet-icon-inverted',
    );
    expect(card).not.toHaveClass('factsheet-card-dark');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('alt', 'State descriptors icon');
  });

  it('falls back to the default backgrounds when none is stored', () => {
    const { container } = render(
      <View
        data={{
          groups: [
            makeGroup({
              background_color: undefined,
              cards: [makeCard({ background_color: undefined })],
            }),
          ],
        }}
        mode="view"
      />,
    );

    expect(container.querySelector('.factsheet-descriptor-main')).toHaveStyle({
      backgroundColor: '#004B7F',
    });
    expect(container.querySelector('.factsheet-descriptor-card')).toHaveStyle({
      backgroundColor: '#FFFFFF',
    });
  });
});
