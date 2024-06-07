import React from 'react';
import {
  // HeroSectionView,
  // FullwidthView,
  DatabaseItemView,
  MetadataListingView,
  SimpleListingView,
} from './components';
// import installAppExtras from './components/theme/AppExtras';
// import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
// import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';

import installMsfdDataExplorerBlock from './components/Blocks/MsfdDataExplorerBlock';
import { breadcrumb, localnavigation } from './reducers';
import customBlockTemplates from '@eeacms/volto-marine-policy/components/Blocks/CustomBlockTemplates/customBlockTemplates';
import TextAlignWidget from './components/Widgets/TextAlign';
import installContextNavigation from './components/Blocks/ContextNavigation';
import './slate-styles.less';

import installSearchEngine from './search';

import TokenWidget from '@plone/volto/components/manage/Widgets/TokenWidget';
import linkSVG from '@plone/volto/icons/link.svg';
import { makeInlineElementPlugin } from '@plone/volto-slate/elementEditor';
import { LINK } from '@plone/volto-slate/constants';
import { LinkElement } from '@plone/volto-slate/editor/plugins/AdvancedLink/render';
import { withLink } from '@plone/volto-slate/editor/plugins/AdvancedLink/extensions';
import { linkDeserializer } from '@plone/volto-slate/editor/plugins/AdvancedLink/deserialize';
import LinkEditSchema from '@plone/volto-slate/editor/plugins/AdvancedLink/schema';
import { getBlocks } from '@plone/volto/helpers';
import { defineMessages } from 'react-intl'; // , defineMessages

import marineLogo from '@eeacms/volto-marine-policy/../theme/assets/images/Header/wise-marine-logo.svg';
import marineLogoWhite from '@eeacms/volto-marine-policy/../theme/assets/images/Header/wise-marine-logo-white.svg';
import eeaWhiteLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/eea-logo-white.svg';
import europeanComissionLogo from '@eeacms/volto-marine-policy/static/ec_logo_white.svg';
import MeasureView from '@eeacms/volto-marine-policy/components/Widgets/MeasureViewWidget';

const available_colors = [
  '#ffffff',
  '#f7f3ef',
  '#e3edf7',
  '#002d54',
  '#59d3ff',
  '#2dd2b7',
  '#1271e1',
  '#826A6A',
  '#FAD0C3',
  '#F3E2AB',
  '#C1E1C5',
  '#BEDADC',
  '#BED3F3',
  '#000000',
];

const restrictedBlocks = ['imagecards'];

const messages = defineMessages({
  edit: {
    id: 'Edit link',
    defaultMessage: 'Edit link',
  },
  delete: {
    id: 'Remove link',
    defaultMessage: 'Remove link',
  },
  document_view: {
    id: 'Document View',
    defaultMessage: 'Document View',
  },
  herosection_view: {
    id: 'Hero Section View',
    defaultMessage: 'Hero Section View',
  },
  fullwidth_view: {
    id: 'Full Width View',
    defaultMessage: 'Full Width View',
  },
});

const applyConfig = (config) => {
  config.views.layoutViews = {
    ...config.views.layoutViews,
    // document_view: HeroSectionView,
    // herosection_view: HeroSectionView,
    // fullwidth_view: FullwidthView,
  };
  config.views.layoutViewsNamesMapping = {
    ...(config.views.layoutViewsNamesMapping || {}),
    document_view: 'Document View',
    // herosection_view: 'Hero Section View',
    // fullwidth_view: 'Full Width View',
  };
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    // Folder: HomePageInverseView,
    // Document: HeroSectionView,
    dashboard: DatabaseItemView,
    dataset: DatabaseItemView,
    database: DatabaseItemView,
    publication_report: DatabaseItemView,
    // indicator: DatabaseItemView,
    briefing: DatabaseItemView,
    // map_interactive: DatabaseItemView,
  };

  config.addonReducers = {
    ...(config.addonReducers || {}),
    breadcrumb,
    localnavigation,
  };

  config.widgets.widget.text_align = TextAlignWidget;
  // check if it breaks the 'theme' field in volto-tabs-block in the 'horizontal carousel' layout
  // We have a 'theme' field in the wise catalogue metadata (CatalogueMetadata)
  config.widgets.id.indicator_theme = TokenWidget;
  // config.widgets.id.theme = TokenWidget;

  config.blocks.groupBlocksOrder = [
    ...config.blocks.groupBlocksOrder,
    { id: 'marine_addons', title: 'Marine' },
  ];

  config.blocks = {
    ...config.blocks,
    blocksConfig: { ...customBlockTemplates(config) },
  };

  // on home contextNavigation should return false
  config.blocks.blocksConfig.contextNavigation = {
    ...config.blocks.blocksConfig.contextNavigation,
    blockHasValue: (data) => {
      return data.pathname !== '/';
    },
  };
  config.blocks.blocksConfig.listing = {
    ...config.blocks.blocksConfig.listing,
    variations: [
      ...config.blocks.blocksConfig.listing.variations,
      {
        id: 'metadata',
        title: 'Metadata Listing',
        template: MetadataListingView,
        isDefault: false,
      },
      {
        id: 'simple',
        title: 'Simple Listing',
        template: SimpleListingView,
        isDefault: false,
      },
    ],
  };

  config.settings.useQuantaToolbar = false;

  config.settings.apiExpanders = [
    ...config.settings.apiExpanders,
    {
      match: '/marine',
      GET_CONTENT: ['object_provides'],
    },
    {
      match: '/marine-new',
      GET_CONTENT: ['object_provides'],
    },
    {
      match: '/',
      GET_CONTENT: ['siblings'],
    },
  ];

  // do not expand breadcrumbs. This fixed the breadcrumbs in contents view. The hasApiExpander needs to be made
  // generic to also look for nonContentRoutes.
  (config.settings.apiExpanders || []).forEach((item) => {
    if (item.GET_CONTENT.includes('breadcrumbs')) {
      item.GET_CONTENT.splice(item.GET_CONTENT.indexOf('breadcrumbs', 1));
    }
  });

  config.settings.navDepth = 3;

  config.settings.available_colors = available_colors;

  config.settings.externalRoutes = [
    ...(config.settings.externalRoutes || []),
    ...(config.settings.prefixPath
      ? [
          {
            match: {
              path: /\/$/,
              exact: true,
              strict: true,
            },

            url(payload) {
              return payload.location.pathname;
            },
          },
        ]
      : []),
  ];
  config.settings.externalRoutes = [
    ...(config.settings.externalRoutes || []),
    {
      match: {
        path: '/(.*)marine(-new)?/assessment-module(.*)',
        exact: false,
        strict: false,
      },
      url(payload) {
        return payload.location.pathname;
      },
    },
    // {
    //   match: {
    //     path:
    //       '/(.*)marine(-new)?/countries-and-regional-seas/country-profiles(.*)',
    //     exact: false,
    //     strict: false,
    //   },
    //   url(payload) {
    //     return payload.location.pathname;
    //   },
    // },
    // {
    //   match: {
    //     path:
    //       '/(.*)marine(-new)?/policy-and-reporting/msfd-reports-and-assessments(.*)',
    //     exact: false,
    //     strict: false,
    //   },
    //   url(payload) {
    //     return payload.location.pathname;
    //   },
    // },
    {
      match: {
        path: '/(.*)marine(-new)?/policy-and-reporting/reports-and-assessments(.*)',
        exact: false,
        strict: false,
      },
      url(payload) {
        return payload.location.pathname;
      },
    },
    {
      match: {
        path: '/(.*)marine(-new)?/policy-and-reporting/assessment-by-country(.*)',
        exact: false,
        strict: false,
      },
      url(payload) {
        return payload.location.pathname;
      },
    },
    {
      match: {
        path: '/(.*)marine(-new)?/policy-and-reporting/assessment-by-region(.*)',
        exact: false,
        strict: false,
      },
      url(payload) {
        return payload.location.pathname;
      },
    },
  ];

  config.settings.openExternalLinkInNewTab = true;

  if (config.blocks.blocksConfig.contextNavigation)
    config.blocks.blocksConfig.contextNavigation.restricted = false;

  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'uiContainer',
      title: 'Container',
      viewComponent: (props) => {
        return <div className="ui container">{props.children}</div>;
      },
    },
    {
      id: 'primary-table',
      title: 'Primary table',
      // previewComponent: () => (
      //   <Icon name={contentBoxSVG} size="88px" className="primary" />
      // ),
      viewComponent: (props) => {
        return (
          <div className="content-box primary-table">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
  ];

  // restrict blocks
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });

  // mega menu layout settings
  config.settings.menuItemsLayouts = {
    ...config.settings.menuItemsLayouts,
    '/marine/countries-and-regional-seas': {
      menuItemColumns: ['eight wide column', 'four wide column'],
      menuItemChildrenListColumns: [5, 1],
      appendExtraMenuItemsToLastColumn: true,
      hideChildrenFromNavigation: false,
    },
    '/marine/europe-seas': {
      // menuItemColumns: [
      //   'three wide column',
      //   'three wide column',
      //   'three wide column',
      //   // 'three wide column',
      //   // 'three wide column',
      // ],
      menuItemChildrenListColumns: [1, 1, 1],
      appendExtraMenuItemsToLastColumn: false,
      hideChildrenFromNavigation: false,
    },
    '/marine/resources': {
      // menuItemColumns: [
      //   'three wide column',
      //   'three wide column',
      //   'three wide column',
      //   // 'three wide column',
      //   // 'three wide column',
      // ],
      menuItemChildrenListColumns: [1, 1, 1],
      appendExtraMenuItemsToLastColumn: false,
      hideChildrenFromNavigation: false,
    },
  };

  config.settings.slate.styleMenu = config.settings.slate.styleMenu || {};
  config.settings.slate.styleMenu.inlineStyles = [
    ...(config.settings.slate.styleMenu?.inlineStyles || []),
    { cssClass: 'large-text', label: 'Large text' },
    { cssClass: 'primary-big-text', label: 'Big text' },
    { cssClass: 'medium-text', label: 'Medium text' },
    { cssClass: 'small-text', label: 'Small text' },
    { cssClass: 'blue-text', label: 'Blue text' },
    { cssClass: 'blue-chart-text', label: 'Blue plot-chart text' },
    { cssClass: 'green-chart-text', label: 'Green plot-chart text' },
    { cssClass: 'yellow-chart-text', label: 'Yellow plot-chart text' },
    { cssClass: 'orange-chart-text', label: 'Orange plot-chart text' },
    { cssClass: 'red-chart-text', label: 'Red plot-chart text' },
    { cssClass: 'blue-circle text-circle', label: 'Blue circle' },
    { cssClass: 'green-circle text-circle', label: 'Green circle' },
    { cssClass: 'orange-circle text-circle', label: 'Orange circle' },
    { cssClass: 'yellow-circle text-circle', label: 'Yellow circle' },
    { cssClass: 'grey-circle text-circle', label: 'Grey circle' },
    { cssClass: 'black-text', label: 'Black text' },

    {
      cssClass: 'uwwt-empty-box blue-uwwt-background',
      label: 'UWWT blue empty box',
    },
    {
      cssClass: 'uwwt-empty-box green-uwwt-background',
      label: 'UWWT green empty box',
    },
    {
      cssClass: 'uwwt-empty-box yellow-uwwt-background',
      label: 'UWWT yellow empty box',
    },
    {
      cssClass: 'uwwt-empty-box orange-uwwt-background',
      label: 'UWWT orange empty box',
    },
    {
      cssClass: 'uwwt-empty-box red-uwwt-background',
      label: 'UWWT red empty box',
    },
  ];

  // EEA customizations
  config.settings.eea.websiteTitle = 'Wise - Marine';
  config.settings.eea = {
    ...(config.settings.eea || {}),
    headerOpts: {
      ...(config.settings.eea?.headerOpts || {}),
      logo: marineLogo,
      logoWhite: marineLogoWhite,
    },
    headerSearchBox: [
      {
        isDefault: true,
        path: '/marine/advanced-search',
        placeholder: 'Search Marine...',
        description:
          'Looking for more information? Try searching the full EEA website content',
        buttonTitle: 'Go to advanced search',
        buttonUrl: 'https://www.eea.europa.eu/en/advanced-search',
      },
    ],
    footerOpts: {
      ...(config.settings.eea?.footerOpts || {}),
      logosHeader: 'Managed by',
      // description:
      //   'WISE - Marine is a gateway to information on European marine issues in support of ecosystem based management and ocean governance',
      managedBy: [
        {
          link: 'https://www.eea.europa.eu/',
          src: eeaWhiteLogo,
          alt: 'EEA Logo',
          className: 'site logo',
          columnSize: {
            mobile: 6,
            tablet: 12,
            computer: 4,
          },
        },
        {
          link: 'https://commission.europa.eu/',
          src: europeanComissionLogo,
          alt: 'European Commission Logo',
          className: 'ec logo',
          columnSize: {
            mobile: 6,
            tablet: 12,
            computer: 4,
          },
        },
      ],
      social: [],
      actions: [
        {
          url: '/sitemap',
          title: 'Sitemap',
        },
        {
          url: '/#legal-notice',
          title: 'Privacy statement',
        },
        {
          url: '/marine/login',
          title: 'Login',
        },
      ],

      contacts: [
        // {
        //   icon: 'comment outline',
        //   text: 'About',
        //   link: '/marine/wise-marine',
        //   children: [],
        // },
        // {
        //   icon: 'comment outline',
        //   text: 'Contact',
        //   link: 'mailto:WISE@eea.europa.eu',
        // },
      ],
    },
    organisationName: 'Marine Water Information System for Europe',
  };

  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.tocEntries = (
      block = {},
      tocData,
    ) => {
      // integration with volto-block-toc
      const headlines = tocData.levels || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      let entries = [];
      const sorted_column_blocks = getBlocks(block?.data || {});
      sorted_column_blocks.forEach((column_block) => {
        const sorted_blocks = getBlocks(column_block[1]);
        sorted_blocks.forEach((block) => {
          const { value, plaintext } = block[1];
          const type = value?.[0]?.type;
          if (headlines.includes(type)) {
            entries.push([parseInt(type.slice(1)), plaintext, block[0]]);
          }
        });
      });
      return entries;
    };
  }

  // SPMeasure View widget
  config.views.contentTypesViews.spmeasure = MeasureView;

  //advancedlink is currently not working properly/not recognized in fise, so we add it to config manually
  const { slate } = config.settings;

  slate.toolbarButtons = [...(slate.toolbarButtons || []), LINK];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    LINK,
  ];

  slate.htmlTagsToSlate.A = linkDeserializer;

  const opts = {
    title: 'Link',
    pluginId: LINK,
    elementType: LINK,
    element: LinkElement,
    isInlineElement: true,
    editSchema: LinkEditSchema,
    extensions: [withLink],
    hasValue: (formData) => !!formData.link,
    toolbarButtonIcon: linkSVG,
    messages,
  };

  const [installLinkEditor] = makeInlineElementPlugin(opts);
  config = installLinkEditor(config);

  const final = [
    installMsfdDataExplorerBlock,
    installSearchEngine,
    installContextNavigation,
  ].reduce((acc, apply) => apply(acc), config);

  return final;
};

export default applyConfig;
