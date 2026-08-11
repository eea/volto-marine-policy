import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import {
  MenuList,
  customSelectStyles,
  selectTheme,
} from '@plone/volto/components/manage/Widgets/SelectStyling';

/**
 * NISScientificNameWidget — free-text combobox for nis_scientificname_accepted.
 *
 * Offers the canonical scientific names from the nis_scientific_names
 * vocabulary (distinct ScientificName values of the NIS reference table). The
 * user picks a name from the filtered list or types a name that is not in it;
 * values outside the list are kept as-is (also when editing existing items).
 */
const NISScientificNameWidget = (props) => {
  const { id, value, onChange, onBlur, placeholder, disabled } = props;
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetch(
      `${window.env.apiPath}/++api++/@vocabularies/nis_scientific_names?b_size=-1`,
      {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          setOptions(
            data.items.map((item) => ({
              value: item.token,
              label: item.title,
            })),
          );
        }
      })
      .catch(() => {
        // The field stays usable as free text if the vocabulary fails to load.
      });
  }, []);

  const handleChange = (option) => {
    onChange(id, option ? option.value : '');
  };

  const handleBlur = () => {
    // Commit typed free text on blur, matching plain text field behavior.
    if (inputValue && inputValue !== (value || '')) {
      onChange(id, inputValue);
    }
    if (onBlur) {
      onBlur(id, inputValue || value);
    }
  };

  return (
    <FormFieldWrapper {...props} className="nis-scientific-name">
      <CreatableSelect
        inputId={id}
        name={id}
        value={value ? { value, label: value } : null}
        options={options}
        onChange={handleChange}
        onInputChange={(val) => setInputValue(val)}
        onBlur={handleBlur}
        isClearable
        isDisabled={disabled}
        isSearchable
        placeholder={placeholder || 'Select or type a scientific name'}
        formatCreateLabel={(input) => `Use "${input}"`}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={customSelectStyles}
        theme={selectTheme}
        components={{
          ...(options?.length > 25 && { MenuList }),
        }}
      />
    </FormFieldWrapper>
  );
};

NISScientificNameWidget.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

export default NISScientificNameWidget;
