import React, { useState } from 'react';
import { Portal } from 'react-portal';
import { fields } from '@eeacms/volto-marine-policy/constants/measureFields';
import String from './String';
import { Accordion } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import { BodyClass } from '@plone/volto/helpers';
import downSVG from '@plone/volto/icons/down-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import './measure.css';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <Portal node={document.getElementById('page-header')}>{children}</Portal>
  ) : (
    children
  );
}

const MeasureView = (props) => {
  const { origin } = props?.content;

  //conditional fields shown in view based on origin of measure
  const conditions = {
    'WFD (Directive 2000/60/EC)': [
      'nature_of_physical_modification',
      'effect_on_hydromorphology',
      'ecological_impacts',
    ],
    'MSFD (Directive 2008/56/EC)': [
      'links_to_existing_policies',
      'ktms_it_links_to',
      'relevant_targets',
      'relevant_features_from_msfd_annex_iii',
      'msfd_spatial_scope',
    ],
    'HD (Directive 92/43/EEC)': [
      'measure_purpose',
      'measure_location',
      'measure_response',
      'measure_additional_info',
      'pressure_type',
      'pressure_name',
      'ranking',
      'region',
    ],
    'BD (Directive 79/409/EEC)': [
      'measure_purpose',
      'measure_location',
      'measure_response',
      'measure_additional_info',
      'pressure_type',
      'pressure_name',
      'ranking',
      'region',
    ],
    'MSPD (Directive 2008/56/EC)': [
      'mspd_implementation_status',
      'shipping_tackled',
      'traffic_separation_scheme',
      'priority_areas',
      'approaching_areas',
      'precautionary_areas',
      'areas_to_be_avoided',
      'future_scenarios',
      'source',
      'authority',
      'general_view',
      'ports',
      'future_expectations',
      'safety_manner',
      'objective',
      'categories',
    ],
    Sectorial: ['source'],
  };

  // Fields that don't need to check the origin condition
  const unconditionalFields = fields.filter(
    (field) => !Object.values(conditions).flat().includes(field.field),
  );

  // Determine which fields to display in the "Further Information" section
  const getConditionalFields = () => {
    // If origin has no value, display all available fields
    if (!origin || origin.length === 0) {
      const fieldsNames = unconditionalFields.reduce(
        (acc, field) => [...acc, field.field],
        [],
      );
      return fields.filter((field) => !fieldsNames.includes(field.field));
    }

    // Filter fields based on origin(s)
    return fields.filter((field) => {
      for (let cond of origin) {
        if (conditions[cond]?.includes(field.field)) {
          return true;
        }
      }
      return false;
    });
  };

  const renderField = (field, fieldLocation) => (
    <div className="measure-field">
      <div className="measure-field-label">
        {field.title}
        {fieldLocation === 'header' && ':'}
      </div>
      <div className="measure-field-value">
        {props.content[field.field] ? (
          <String val={props?.content[field.field]} />
        ) : (
          'No value'
        )}
      </div>
      <div></div>
    </div>
  );

  const renderFieldTable = () => (
    <Accordion fluid styled>
      <Accordion.Title
        active={isActiveAccordion}
        index={0}
        onClick={handleAccordionClick}
      >
        <div className="further-information-section">
          <h3>Further information</h3>
        </div>
        <Icon size="30px" name={isActiveAccordion ? upSVG : downSVG} />
      </Accordion.Title>
      <Accordion.Content active={isActiveAccordion}>
        <div className="measure__items">
          <div className="measure__item">
            <div className="table-responsive">
              <table>
                <tbody>
                  {getConditionalFields().map((field, index) => (
                    <tr
                      key={`row-measure-${index}`}
                      id={`row-measure-${index}`}
                    >
                      <td className="measure-field-label">{field.title}</td>
                      <td className="measure-field-value">
                        {props.content[field.field] ? (
                          <String val={props?.content[field.field]} />
                        ) : (
                          'No value'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Accordion.Content>
    </Accordion>
  );

  const truncateTitle = () => {
    const maxLength = 90;
    if (props?.content?.title?.length > maxLength) {
      const trimmedTitle = props?.content?.title?.substr(0, maxLength);

      return (
        trimmedTitle.substr(
          0,
          Math.min(trimmedTitle.length, trimmedTitle.lastIndexOf(' ')),
        ) + '...'
      );
    }
    return props?.content?.title;
  };

  const [isActiveAccordion, setIsAccordionActive] = useState(true);

  const handleAccordionClick = () => {
    setIsAccordionActive(!isActiveAccordion);
  };

  return (
    <div id="page-document" className="view-view-spmeasure ui container">
      <div>
        <React.Fragment>
          <BodyClass className="custom-page-header" />
          <IsomorphicPortal>
            <div className="measure-header content-box ui container">
              <div className="measure-header-content">
                <h1 className="measure-title">
                  <String val={truncateTitle()} />
                </h1>
                <div className="measure-field">
                  <div className="measure-field-label">Code:</div>
                  <div className="measure-field-value">
                    <String val={props?.content?.code} />
                  </div>
                </div>
                {unconditionalFields
                  .slice(0, 2)
                  .map((field) => renderField(field, 'header'))}
              </div>
            </div>
          </IsomorphicPortal>
        </React.Fragment>

        <div className="measure-form">
          <div className="measure-field measure-name">
            <div className="measure-field-label">Measure name</div>
            <div className="measure-field-value">
              <String val={props?.content?.title} />
            </div>
          </div>

          <div className="unconditional-fields">
            {unconditionalFields.slice(2).map(renderField)}
          </div>

          {/* Further Information Section */}
          {renderFieldTable()}
        </div>
      </div>
    </div>
  );
};

export default MeasureView;
