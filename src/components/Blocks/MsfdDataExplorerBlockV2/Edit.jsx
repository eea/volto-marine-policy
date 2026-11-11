import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

import MsfdDataExplorerBlockV2View from './View';
import schema from './schema';

const MsfdDataExplorerBlockV2Edit = (props) => {
  const { selected, onChangeBlock, data = {}, block } = props;

  return (
    <div>
      <MsfdDataExplorerBlockV2View {...props} />

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
        />
      </SidebarPortal>
    </div>
  );
};

export default MsfdDataExplorerBlockV2Edit;
