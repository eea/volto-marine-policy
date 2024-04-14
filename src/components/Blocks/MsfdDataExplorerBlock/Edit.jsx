import React from 'react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import MsfdDataExplorerBlockView from './View';
import schema from './schema';

const MsfdDataExplorerBlockEdit = (props) => {
  const { selected, onChangeBlock, data = {}, block } = props;
  return (
    <div>
      <MsfdDataExplorerBlockView {...props} />

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

export default MsfdDataExplorerBlockEdit;
