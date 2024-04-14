import React from 'react';
import { formatItemType } from '@eeacms/volto-marine-policy/utils';

const ItemMetadataSnippet = (props) => {
  const { item } = props;
  const source = item?.source?.[0] || item;
  const type = item?.source?.[0]['@type'] || item['@type'];
  const { topics, publication_year, legislative_reference } = source;

  return (
    <>
      <div className="item-modal-metadata">
        {type && (
          <div className="metadata-tab-section item-snippet-type">
            <span className="metadata-tab-title">Item: </span>
            <span>{formatItemType(type)}</span>
          </div>
        )}

        {topics && topics.length > 0 && (
          <div className="metadata-tab-section">
            <span className="metadata-tab-title">Topics: </span>
            {Array.isArray(topics) ? (
              <>
                {topics.map((topic, i) => (
                  <span key={i}>
                    {topic.title}
                    {i < topics.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            ) : (
              <span>{topics.title}</span>
            )}
          </div>
        )}

        {publication_year && (
          <div className="metadata-tab-section">
            <span className="metadata-tab-title">Publication year: </span>
            <span>{publication_year}</span>
          </div>
        )}

        {legislative_reference && legislative_reference.length > 0 && (
          <div className="metadata-tab-section">
            <span className="metadata-tab-title">Legislative reference: </span>
            {Array.isArray(legislative_reference) ? (
              <>
                {legislative_reference.map((tag, i) => (
                  <span key={i}>
                    {tag.title || tag}
                    {i < legislative_reference.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            ) : (
              <span>
                {legislative_reference.title || legislative_reference}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ItemMetadataSnippet;
