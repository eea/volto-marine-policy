import React from 'react';
import SelectWidget from '@plone/volto/components/manage/Widgets/SelectWidget';

/**
 * NISStatusWidget — wraps the default SelectWidget and disables the
 * client-side "No value" option that Volto injects for hardcoded-choice
 * fields when noValueOption=true (the default) and default is nullish.
 */
const NISStatusWidget = (props) => (
  <SelectWidget {...props} noValueOption={false} />
);

export default NISStatusWidget;
