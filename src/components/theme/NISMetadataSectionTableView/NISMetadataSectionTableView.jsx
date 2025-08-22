import { MetadataSectionTableView } from '@eeacms/volto-metadata-block/components';
import './style.less';

const NISMetadataSectionTableView = (props) => {
  return (
    <div className="nis-metadata-section-table-view">
      <MetadataSectionTableView {...props} />
    </div>
  );
};

export default NISMetadataSectionTableView;
