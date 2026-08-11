import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NISScientificNameWidget from './NISScientificNameWidget';

jest.mock(
  '@plone/volto/components/manage/Widgets/FormFieldWrapper',
  () =>
    function MockFormFieldWrapper({ children }) {
      return <div>{children}</div>;
    },
);

jest.mock('@plone/volto/components/manage/Widgets/SelectStyling', () => ({
  MenuList: undefined,
  customSelectStyles: undefined,
  selectTheme: undefined,
}));

const VOCAB_ITEMS = [
  { token: 'Ablennes hians', title: 'Ablennes hians' },
  { token: 'Acipenser gueldenstaedtii', title: 'Acipenser gueldenstaedtii' },
  { token: 'Acrochaetium catenulatum', title: 'Acrochaetium catenulatum' },
  { token: 'Zeuxo turkensis', title: 'Zeuxo turkensis' },
];

const FIELD_ID = 'nis_scientificname_accepted';

function renderWidget(props = {}) {
  const onChange = jest.fn();
  const onBlur = jest.fn();
  const utils = render(
    <NISScientificNameWidget
      id={FIELD_ID}
      title="Scientific name accepted"
      fieldSet="nis"
      value=""
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />,
  );
  return { onChange, onBlur, ...utils };
}

function getInput(container) {
  return container.querySelector('input');
}

describe('NISScientificNameWidget', () => {
  beforeEach(() => {
    window.env = { apiPath: 'http://localhost:8080/Plone' };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: VOCAB_ITEMS }),
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads the vocabulary from the backend', async () => {
    renderWidget();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('@vocabularies/nis_scientific_names?b_size=-1'),
        expect.anything(),
      );
    });
  });

  it('shows vocabulary options filtered by the typed text', async () => {
    const { container } = renderWidget();
    const input = getInput(container);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Ablennes' } });
    expect(await screen.findByText('Ablennes hians')).toBeInTheDocument();
    expect(screen.queryByText('Zeuxo turkensis')).not.toBeInTheDocument();
  });

  it('commits the selected vocabulary option', async () => {
    const { container, onChange } = renderWidget();
    const input = getInput(container);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Acrochaetium' } });
    const option = await screen.findByText('Acrochaetium catenulatum');
    fireEvent.click(option);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        FIELD_ID,
        'Acrochaetium catenulatum',
      );
    });
  });

  it('commits free text via the create option', async () => {
    const { container, onChange } = renderWidget();
    const input = getInput(container);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Brand new species' } });
    const createOption = await screen.findByText('Use "Brand new species"');
    fireEvent.click(createOption);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(FIELD_ID, 'Brand new species');
    });
  });

  it('commits typed free text on blur', async () => {
    const { container, onChange, onBlur } = renderWidget();
    const input = getInput(container);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'My own species' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(FIELD_ID, 'My own species');
    });
    expect(onBlur).toHaveBeenCalledWith(FIELD_ID, 'My own species');
  });

  it('renders a stored value that is not in the vocabulary', async () => {
    renderWidget({ value: 'Legacy name not in list' });
    expect(screen.getByText('Legacy name not in list')).toBeInTheDocument();
    // let the vocabulary fetch settle so no update happens after the test
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('clears the value with the clear indicator', async () => {
    const { onChange } = renderWidget({ value: 'Ablennes hians' });
    await waitFor(() => {
      expect(screen.getByText('Ablennes hians')).toBeInTheDocument();
    });
    const clearIndicator = document.querySelector(
      '.react-select__clear-indicator',
    );
    expect(clearIndicator).not.toBeNull();
    fireEvent.mouseDown(clearIndicator);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(FIELD_ID, '');
    });
  });
});
