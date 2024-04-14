import React from 'react';

import { Label } from 'semantic-ui-react';
import { SegmentedBreadcrumb, StringList, ResultContext } from '@eeacms/search';
import { UniversalCard } from '@eeacms/volto-listing-block';
import { firstWords, getTermDisplayValue } from '@eeacms/search/lib/utils';
import { useAppConfig } from '@eeacms/search/lib/hocs';

import ExternalLink from '@eeacms/search/components/Result/ExternalLink';

const ExtraContent = (props) => {
  const { result, vocab } = props;
  const measureSector = result.wm_spm_sector ? result.wm_spm_sector.raw : '';

  return (
    <div>
      <div className="result-bottom">
        <div className="result-info">
          <span className="result-info-title">Sector: </span>
          <StringList value={measureSector} />
        </div>
      </div>
      <div>
        <div className="result-info result-source">
          <span className="result-info-title">Source: </span>
          <ExternalLink href={result.href}>
            <strong title={result.source} className="source">
              {firstWords(
                getTermDisplayValue({
                  vocab,
                  field: 'cluster_name',
                  term: result.source,
                }),
                8,
              )}
            </strong>
            <SegmentedBreadcrumb
              href={result.href}
              short={true}
              maxChars={40}
            />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};

const MarineMeasureItem = (props) => {
  const { result } = props;
  const { appConfig } = useAppConfig();
  const { vocab = {} } = appConfig;

  const item = {
    '@id': result.href,
    title: (
      <>
        <ExternalLink href={result.href} title={result.title}>
          {result.title}
          {/* {result.isNew && <Label className="new-item">New</Label>} */}
          {result.isExpired && (
            <Label className="archived-item">Archived</Label>
          )}
        </ExternalLink>
      </>
    ),
    // meta: <ContentClusters clusters={clusters} item={result} />,
    description: props.children ? props.children : <ResultContext {...props} />,
    preview_image_url: result.hasImage ? result.thumbUrl : undefined,
    extra: <ExtraContent result={result} vocab={vocab} />,
  };

  const itemModel = {
    hasImage: result.hasImage,
    hasDescription: true,
    imageOnRightSide: true,
    '@type': 'searchItem',
  };

  return <UniversalCard item={item} itemModel={itemModel} />;
};

export default MarineMeasureItem;
