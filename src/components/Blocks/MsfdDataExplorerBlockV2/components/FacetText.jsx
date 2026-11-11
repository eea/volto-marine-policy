import React from 'react';
import { Input } from 'semantic-ui-react';

// Free text search facet (e.g. MRU identifier or name). The selection is a one
// element array; an empty value clears the filter.
const FacetText = ({ facet, value, onChange }) => {
  const text = (value && value[0]) || '';

  return (
    <div className="msfd-field">
      <span className="msfd-field-label">{facet.label}</span>
      <Input
        className="msfd-text-input"
        icon="search"
        placeholder={facet.placeholder}
        value={text}
        onChange={(event, data) =>
          onChange(facet.name, data.value ? [data.value] : [])
        }
      />
    </div>
  );
};

export default FacetText;
