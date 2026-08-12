/**
 * Customization of
 * @eeacms/volto-eea-website-theme/components/theme/Banner/View.jsx
 *
 * Changes vs. upstream:
 * - Added 'Created by' metadata field (creator of the page), rendered only
 *   for the 'default_with_creator' variation of the Title (Page header) block
 *   and hidden when the block's 'hideCreator' flag is set.
 * - './styles.less' import resolved through the package path (relative imports
 *   do not resolve from the addon's customizations directory).
 *
 * Keep in sync with the upstream file on theme upgrades.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import startCase from 'lodash/startCase';
import { Icon } from 'semantic-ui-react';
import Popup from '@eeacms/volto-eea-design-system/ui/Popup/Popup';
import config from '@plone/volto/registry';
import Banner from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import {
  getImageSource,
  sharePage,
} from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import Copyright from '@eeacms/volto-eea-design-system/ui/Copyright/Copyright';
import { setupPrintView } from '@eeacms/volto-eea-website-theme/helpers/setupPrintView';

import '@eeacms/volto-eea-website-theme/components/theme/Banner/styles.less';

const messages = defineMessages({
  share: {
    id: 'Share',
    defaultMessage: 'Share',
  },
  share_to: {
    id: 'Share to',
    defaultMessage: 'Share to',
  },
  download: {
    id: 'Download',
    defaultMessage: 'Download',
  },
  created: {
    id: 'Created',
    defaultMessage: 'Created',
  },
  created_by: {
    id: 'Created by',
    defaultMessage: 'Created by',
  },
  published: {
    id: 'Published',
    defaultMessage: 'Published',
  },
  modified: {
    id: 'Modified',
    defaultMessage: 'Modified',
  },
  rssFeed: {
    id: 'rssFeed',
    defaultMessage: 'RSS Feed',
  },
});

const friendlyId = (id) => {
  if (typeof id !== 'string') return id;
  return startCase(id);
};

const Title = ({ config = {}, properties }) => {
  const view = useMemo(() => {
    return config.view;
  }, [config.view]);

  if (view) {
    return view;
  }
  return <Banner.Title>{properties['title']}</Banner.Title>;
};

const View = (props) => {
  const dispatch = useDispatch();
  const { banner = {}, intl } = props;
  const metadata = props.metadata || props.properties;
  const popupRef = useRef(null);
  const {
    info = [],
    hideContentType,
    hideCreationDate,
    hideCreator,
    hidePublishingDate,
    hideModificationDate,
    hideShareButton,
    hideDownloadButton,
    copyright,
    copyrightIcon,
    copyrightPosition,
    rssLinks,
    subtitle,
    styles,
    // contentType,
  } = props.data;
  const copyrightPrefix =
    config.blocks.blocksConfig.title.copyrightPrefix || '';

  const contentTypesWithoutHeaderImage =
    config.settings?.eea?.contentTypesWithoutHeaderImage || [];

  // Set dates
  const getDate = useCallback(
    (hidden, key) => {
      return !hidden && metadata[key] ? metadata[key] : null;
    },
    [metadata],
  );
  const creationDate = useMemo(
    () => getDate(hideCreationDate, 'created'),
    [getDate, hideCreationDate],
  );
  const publishingDate = useMemo(
    () => getDate(hidePublishingDate, 'effective'),
    [getDate, hidePublishingDate],
  );
  const modificationDate = useMemo(
    () => getDate(hideModificationDate, 'modified'),
    [getDate, hideModificationDate],
  );

  // Set image source
  const image = contentTypesWithoutHeaderImage.includes(
    props.properties['@type'],
  )
    ? false
    : getImageSource(metadata['image']);
  // Get type
  const type = metadata.type_title || friendlyId(metadata['@type']);

  // Get creator (only for the 'default_with_creator' variation)
  const creator = useMemo(() => {
    if (props.variation?.id !== 'default_with_creator' || hideCreator) {
      return null;
    }
    const fullnames = Array.isArray(metadata.creators_fullname)
      ? metadata.creators_fullname
      : [];
    const ids = Array.isArray(metadata.creators) ? metadata.creators : [];
    // Per-creator fallback: use the fullname when available, else the user id
    const creators = fullnames.length
      ? fullnames.map((name, index) =>
          typeof name === 'string' && name.trim()
            ? name.trim()
            : ids[index] || name,
        )
      : ids;
    return creators.filter((name) => name).join(', ');
  }, [metadata, props.variation, hideCreator]);

  return (
    <Banner {...props} image={image} styles={styles}>
      <Banner.Content
        actions={
          <>
            {!hideShareButton && (
              <>
                <Popup
                  className={'share-popup'}
                  trigger={
                    <Banner.Action
                      icon="ri-share-fill"
                      title={intl.formatMessage(messages.share)}
                      className="share"
                      onClick={() => {}}
                    />
                  }
                  content={
                    <>
                      <p>{intl.formatMessage(messages.share_to)}</p>
                      <div className="actions" ref={popupRef}>
                        <Banner.Action
                          icon="ri-facebook-fill"
                          title={'Share page to Facebook'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'facebook');
                          }}
                        />
                        <Banner.Action
                          icon="ri-twitter-x-line"
                          title={'Share page to Twitter'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'twitter');
                          }}
                        />
                        <Banner.Action
                          icon="ri-linkedin-fill"
                          title={'Share page to Linkedin'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'linkedin');
                          }}
                        />
                      </div>
                    </>
                  }
                />
              </>
            )}
            {!hideDownloadButton && (
              <Banner.Action
                icon="ri-download-2-fill"
                title={intl.formatMessage(messages.download)}
                className="download"
                onClick={() => {
                  setupPrintView(dispatch);
                }}
              />
            )}
            {rssLinks?.map((rssLink, index) => (
              <React.Fragment key={rssLink.href || index}>
                <Helmet
                  link={[
                    {
                      rel: 'alternate',
                      title:
                        rssLink.title ?? intl.formatMessage(messages.rssFeed),
                      href: rssLink.href,
                      type:
                        rssLink.feedType === 'atom'
                          ? 'application/atom+xml'
                          : 'application/rss+xml',
                    },
                  ]}
                />
                <Banner.Action
                  icon="ri-rss-fill"
                  title={rssLink.title ?? intl.formatMessage(messages.rssFeed)}
                  className="rssfeed"
                  href={rssLink.href}
                  target="_blank"
                />
              </React.Fragment>
            ))}
          </>
        }
      >
        {!props.data.aboveTitle && subtitle && (
          <Banner.Subtitle>{subtitle}</Banner.Subtitle>
        )}
        {props.data.aboveTitle}
        <Title config={banner.title} properties={metadata} />
        {props.data.belowTitle}
        <Banner.Metadata>
          <Banner.MetadataField
            type="type"
            hidden={
              hideContentType || props.variation.id.indexOf('report') !== -1
            }
            value={type}
          />
          <Banner.MetadataField
            type="date"
            label={intl.formatMessage(messages.created)}
            value={creationDate}
          />
          <Banner.MetadataField
            type="text"
            label={intl.formatMessage(messages.created_by)}
            value={creator}
          />
          <Banner.MetadataField
            type="date"
            label={intl.formatMessage(messages.published)}
            value={publishingDate}
          />
          <Banner.MetadataField
            type="date"
            label={intl.formatMessage(messages.modified)}
            value={modificationDate}
          />
          {info.map((item, index) => (
            <Banner.MetadataField
              key={`header-info-${index}`}
              value={item.description}
            />
          ))}
        </Banner.Metadata>
        {copyright ? (
          <Copyright copyrightPosition={copyrightPosition}>
            <Copyright.Prefix>{copyrightPrefix}</Copyright.Prefix>
            <Copyright.Icon>
              <Icon className={copyrightIcon} />
            </Copyright.Icon>
            <Copyright.Text>{copyright}</Copyright.Text>
          </Copyright>
        ) : (
          ''
        )}
      </Banner.Content>
    </Banner>
  );
};

export default compose(
  injectIntl,
  withRouter,
  connect((state) => {
    return {
      types: state.types.types,
      isPrint: state.isPrint,
    };
  }),
)(View);
