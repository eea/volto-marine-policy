import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

import View from './View';
import schema from './schema';
import { normalizeGroups } from './helpers';

const FactsheetsDescriptorsBlockEdit = (props) => {
  const { selected, onChangeBlock, data = {}, block } = props;

  // Blocks saved while the empty-array slate trap existed still carry
  // `description: []` and would loop in the sidebar. Heal them on open, once.
  React.useEffect(() => {
    const groups = normalizeGroups(data.groups);
    if (groups === data.groups) return;
    onChangeBlock(block, { ...data, groups });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <View {...props} mode="edit" />

      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
          block={block}
        />
      </SidebarPortal>
    </div>
  );
};

export default FactsheetsDescriptorsBlockEdit;
