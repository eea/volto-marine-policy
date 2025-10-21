import DemoSitesExplorerView from './DemoSitesExplorerView';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import schema from './schema';

export default function DemoSitesExplorerEdit(props) {
  const { selected, onChangeBlock, data = {}, block } = props;

  return (
    <div>
      <DemoSitesExplorerView {...props} mode="edit" />

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
}
