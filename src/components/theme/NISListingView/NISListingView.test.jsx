import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import NISListingView from './NISListingView';

const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
}));

jest.mock(
  '@plone/volto/components/manage/UniversalLink/UniversalLink',
  () =>
    function MockUniversalLink({ href, children, className }) {
      return (
        <a href={href} className={className}>
          {children}
        </a>
      );
    },
);

jest.mock(
  '@eeacms/volto-marine-policy/components/theme/ProgressWorkflow/ProgressWorkflow',
  () => ({
    __esModule: true,
    default: () => <div data-testid="progress-workflow" />,
  }),
);

const mockStore = configureStore();

function buildItems(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `/marine/item-${i + 1}`,
    nis_species_name_original: `Species ${i + 1}`,
    nis_species_name_accepted: `Species ${i + 1} accepted`,
    nis_scientificname_accepted: `Scientificus acceptus ${i + 1}`,
    nis_region: 'Europe',
    nis_subregion: 'Western Europe',
    nis_country: 'France',
    nis_status: 'Established',
    nis_group: 'Fish',
    nis_year: 2020 + i,
    nis_assigned_to: `User ${i + 1} (user${i + 1})`,
  }));
}

function renderComponent(props = {}) {
  const { items = buildItems(), ...rest } = props;
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
  });
  return render(
    <Provider store={store}>
      <NISListingView items={items} {...rest} />
    </Provider>,
  );
}

describe('NISListingView', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: [] }),
        ok: true,
      }),
    );

    delete window.location;
    window.location = {
      href: 'http://localhost:3000/marine/test-path',
      pathname: '/marine/test-path',
      search: '',
      reload: jest.fn(),
    };

    window.env = { apiPath: 'http://localhost:8080/Plone' };

    global.fetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('nis_experts_vocabulary')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              items: [
                { token: 'jdoe', title: 'John Doe (jdoe)' },
                { token: 'asmith', title: 'Alice Smith (asmith)' },
              ],
            }),
        });
      }
      if (typeof url === 'string' && url.includes('check-nis-duplicates')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              duplicate_ids: [],
              groups: [],
            }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      });
    });

    mockUseSelector.mockReturnValue({
      object: [{ id: 'edit' }],
    });
  });

  describe('table rendering', () => {
    it('renders all column headers', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species name original')).toBeInTheDocument();
      });
      expect(screen.getByText('Species name accepted')).toBeInTheDocument();
      expect(screen.getByText('Scientific name accepted')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Subregion')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Group')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Assigned to')).toBeInTheDocument();
    });

    it('renders one row per item', async () => {
      renderComponent({ items: buildItems(3) });
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(4);
    });

    it('renders item data in correct columns', async () => {
      const items = [
        {
          '@id': '/marine/item-x',
          nis_species_name_original: 'Alienus maximus original',
          nis_species_name_accepted: 'Alienus maximus (Linnaeus)',
          nis_scientificname_accepted: 'Alienus maximus scientific',
          nis_region: 'Asia',
          nis_subregion: 'South Asia',
          nis_country: 'India',
          nis_status: 'Invasive',
          nis_group: 'Plant',
          nis_year: 2023,
          nis_assigned_to: 'Jane Expert (jexpert)',
        },
      ];
      renderComponent({ items });
      await waitFor(() => {
        expect(
          screen.getByText('Alienus maximus original'),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText('Alienus maximus (Linnaeus)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Alienus maximus scientific'),
      ).toBeInTheDocument();
      expect(screen.getByText('Asia')).toBeInTheDocument();
      expect(screen.getByText('South Asia')).toBeInTheDocument();
      expect(screen.getByText('India')).toBeInTheDocument();
      expect(screen.getByText('Invasive')).toBeInTheDocument();
      expect(screen.getByText('Plant')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('renders an empty table body when items is empty', async () => {
      renderComponent({ items: [] });
      await waitFor(() => {
        expect(screen.getByText('Species name original')).toBeInTheDocument();
      });
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1);
    });
  });

  describe('formatAssignedTo — rendered output', () => {
    it('strips the (userid) suffix from assigned_to', async () => {
      const items = [
        {
          ...buildItems(1)[0],
          nis_assigned_to: 'Jane Expert (jexpert)',
        },
      ];
      renderComponent({ items });
      await waitFor(() => {
        expect(screen.getByText('Jane Expert')).toBeInTheDocument();
      });
      expect(screen.queryByText('Jane Expert (jexpert)')).toBeNull();
    });

    it('decodes Python \\U escape sequences in assigned_to', async () => {
      const items = [
        {
          ...buildItems(1)[0],
          nis_assigned_to:
            '\\U000000d6sterreich User (\\U000000d6sterreichUser)',
        },
      ];
      renderComponent({ items });
      await waitFor(() => {
        expect(screen.getByText('Österreich User')).toBeInTheDocument();
      });
    });

    it('shows empty string when assigned_to is null', async () => {
      const items = [
        {
          ...buildItems(1)[0],
          nis_assigned_to: null,
        },
      ];
      renderComponent({ items });
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const containers = document.querySelectorAll('.assigned-to-container');
      expect(containers.length).toBeGreaterThan(0);
      expect(containers[0].firstChild.textContent).toBe('');
    });
  });

  describe('admin controls — canEditPage', () => {
    it('shows assign, download, and check-duplicates buttons when user can edit', async () => {
      mockUseSelector.mockReturnValue({
        object: [{ id: 'edit' }],
      });
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Assign search results')).toBeInTheDocument();
      });
      expect(screen.getByText('Download search results')).toBeInTheDocument();
      expect(screen.getByText('Check duplicates')).toBeInTheDocument();
    });

    it('hides admin controls when user cannot edit', async () => {
      mockUseSelector.mockReturnValue({
        object: [],
      });
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species name original')).toBeInTheDocument();
      });
      expect(
        screen.queryByText('Assign search results'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Download search results'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Check duplicates')).not.toBeInTheDocument();
    });

    it('hides checkboxes and Copy button when user cannot edit', async () => {
      mockUseSelector.mockReturnValue({
        object: [],
      });
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      expect(document.querySelector('.ui.checkbox')).toBeNull();
      expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    });
  });

  describe('duplicate checking', () => {
    beforeEach(() => {
      window.location.search = '?check-duplicates=1';
    });

    function mockDuplicateFetch(duplicateIds, groups) {
      global.fetch.mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('nis_experts_vocabulary')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                items: [{ token: 'jdoe', title: 'John Doe (jdoe)' }],
              }),
          });
        }
        if (typeof url === 'string' && url.includes('check-nis-duplicates')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                duplicate_ids: duplicateIds,
                groups: groups,
              }),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve({}),
          ok: true,
        });
      });
    }

    it('shows the duplicate info banner when check-duplicates param is set', async () => {
      mockDuplicateFetch(
        ['/marine/item-1', '/marine/item-3'],
        [{ id: 1 }, { id: 2 }],
      );
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText(/duplicate records/)).toBeInTheDocument();
      });
      expect(screen.getByText(/2 duplicate records/)).toBeInTheDocument();
      expect(screen.getByText(/2 groups/)).toBeInTheDocument();
    });

    it('filters table to show only duplicate items', async () => {
      mockDuplicateFetch(
        ['/marine/item-1', '/marine/item-3'],
        [{ id: 1 }, { id: 2 }],
      );
      const items = buildItems(5);
      renderComponent({ items });
      await waitFor(() => {
        expect(screen.getByText(/duplicate records/)).toBeInTheDocument();
      });
      expect(screen.getByText('Species 1')).toBeInTheDocument();
      expect(screen.getByText('Species 3')).toBeInTheDocument();
      expect(screen.queryByText('Species 2')).toBeNull();
      expect(screen.queryByText('Species 4')).toBeNull();
      expect(screen.queryByText('Species 5')).toBeNull();
    });

    it('renders a Clear link that removes check-duplicates from URL', async () => {
      mockDuplicateFetch([], []);
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
      const clearLink = screen.getByText('Clear');
      expect(clearLink.tagName).toBe('A');
      expect(clearLink.getAttribute('href')).not.toContain('check-duplicates');
    });
  });

  describe('item selection', () => {
    it('toggles checkbox selection', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      expect(checkboxes.length).toBeGreaterThan(0);
      fireEvent.click(checkboxes[0]);
      // Selection panel should appear after clicking a checkbox
      await waitFor(() => {
        expect(screen.getByText(/Assign 1 selected item/)).toBeInTheDocument();
      });
    });

    it('removes selection when checkbox is unchecked', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText(/Assign 1 selected item/)).toBeInTheDocument();
      });
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(
          screen.queryByText(/Assign 1 selected item/),
        ).not.toBeInTheDocument();
      });
    });

    it('updates count when selecting multiple items', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      await waitFor(() => {
        expect(screen.getByText(/Assign 2 selected items/)).toBeInTheDocument();
      });
    });
  });

  describe('bulk assign panel', () => {
    it('shows Cancel and Assign buttons after selection', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
      expect(screen.getByText('Assign')).toBeInTheDocument();
    });

    it('Assign button is disabled when no assignee is selected', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText('Assign')).toBeInTheDocument();
      });
      const assignButton = screen.getByText('Assign').closest('button');
      expect(assignButton).toBeDisabled();
    });

    it('Cancel button clears selection', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Species 1')).toBeInTheDocument();
      });
      const checkboxes = document.querySelectorAll('.ui.checkbox input');
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      });
    });
  });
});
