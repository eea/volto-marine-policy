import React from 'react';
import { Checkbox, Dropdown } from 'semantic-ui-react';

// Renders one filter of an article. The control type comes from the API, so a
// per-article renderer does not need to hardcode it.
const FacetPanel = ({ facet, onToggle, onSelect }) => {
  const { name, label, type, options } = facet;

  return (
    <div className="field msfd-facet" data-fieldname={`form.widgets.${name}`}>
      <h4 className="facet-label">{label}</h4>

      {type === 'checkboxes' ? (
        <div className="facet-options">
          {options.map((option) => (
            <div className="option" key={option.value}>
              <Checkbox
                checked={option.selected}
                label={`${option.label} (${option.count})`}
                onChange={() => onToggle(name, option.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Dropdown
          multiple
          search
          selection
          className="facet-select"
          options={options.map((option) => ({
            key: option.value,
            value: option.value,
            text: `${option.label} (${option.count})`,
          }))}
          value={options
            .filter((option) => option.selected)
            .map((option) => option.value)}
          onChange={(event, data) => onSelect(name, data.value)}
        />
      )}
    </div>
  );
};

export default FacetPanel;
