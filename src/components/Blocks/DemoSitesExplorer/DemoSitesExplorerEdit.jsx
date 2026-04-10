import DemoSitesExplorerView from './DemoSitesExplorerView';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
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
