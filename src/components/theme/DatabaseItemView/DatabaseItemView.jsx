import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import {
  ItemMetadataSnippet,
  ItemMetadata,
} from '@eeacms/volto-marine-policy/components';
import { formatItemType } from '@eeacms/volto-marine-policy/utils';

import './style.less';

const DatabaseItemView = (props) => {
  const { content } = props;

  return (
    <>
      <BodyClass className="database-item-view" />
      <div id="page-document" className="ui container">
        <div>
          <div className="metadata-header">
            {content['@type'] && (
              <h3 className="item-type">{formatItemType(content['@type'])}</h3>
            )}
            <h1>{content.title}</h1>

            <ItemMetadataSnippet {...props} item={content} />
          </div>
        </div>
        <ItemMetadata
          {...props}
          item={content}
          map_preview={true}
          item_view={true}
        />
      </div>
    </>
  );
};

export default DatabaseItemView;
