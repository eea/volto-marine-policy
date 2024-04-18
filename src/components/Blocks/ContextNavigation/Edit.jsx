import React from 'react';
import { useSelector } from 'react-redux';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

import View from './View';
import schema from './schema';

export default function Edit(props) {
  const {
    block,
    data = {},
    onChangeBlock,
    selected,
    id,
    formData = {},
  } = props;
  const contentTypes = useSelector((state) => state?.types.types);
  const blockSchema = schema({ formData, data, contentTypes });

  return (
    <div>
      <View data={data} id={id} mode="edit" />
      <SidebarPortal selected={selected}>
        <BlockDataForm
          block={block}
          title={blockSchema.title}
          schema={blockSchema}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          onChangeBlock={onChangeBlock}
          formData={data}
        />
      </SidebarPortal>
    </div>
  );
}
