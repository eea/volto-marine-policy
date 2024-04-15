import { mergeConfig } from '@eeacms/search';
import facets from './facets';
import views from './views';
import { build_runtime_mappings } from '@eeacms/volto-globalsearch/utils';

const getClientProxyAddress = () => {
  const url = new URL(window.location);
  url.pathname = '';
  url.search = '';
  return url.toString();
};

export const clusters = {
  name: 'op_cluster',
  field: 'objectProvides',
  clusters: [
    {
      name: 'Maps and Charts',
      values: ['Map (interactive)', 'Map (simple)', 'Chart (interactive)'],
      defaultResultView: 'horizontalCard',
    },
    {
      name: 'Dashboards',
      values: ['Dashboard'],
      defaultResultView: 'horizontalCard',
    },
    {
      name: 'Web pages',
      values: ['Webpage'],
      defaultResultView: 'horizontalCard',
    },
    {
      name: 'Country factsheet',
      values: ['Country fact sheet'],
      defaultResultView: 'horizontalCard',
    },
    {
      name: 'Others',
      values: [
        'Glossary term',
        'Case study',
        'Measure',
        'Shipping and Ports Measure',
      ],
      defaultResultView: 'horizontalCard',
    },
  ],
};

const marineMeasureSearchConfig = {
  title: 'Marine measure search',
  ...facets,
  ...views,
};

export default function install(config) {
  const envConfig = process.env.RAZZLE_ENV_CONFIG
    ? JSON.parse(process.env.RAZZLE_ENV_CONFIG)
    : marineMeasureSearchConfig;

  const pjson = require('../../package.json');
  envConfig.app_name = pjson.name;
  envConfig.app_version = pjson.version;

  config.searchui.marinemeasure = {
    ...mergeConfig(envConfig, config.searchui.globalsearch),
    elastic_index: '_es/marinemeasure',
    index_name: 'wisetest_searchui',
    host: process.env.RAZZLE_ES_PROXY_ADDR || 'http://localhost:3000',
    runtime_mappings: build_runtime_mappings(clusters),
  };

  config.searchui.marinemeasure.facets = envConfig.facets;

  config.searchui.marinemeasure.contentSectionsParams = {
    enable: true,
    sectionFacetsField: 'op_cluster',
    sections: clusters.clusters,
    clusterMapping: Object.assign(
      {},
      ...clusters.clusters.map(({ name, values }) =>
        Object.assign({}, ...values.map((v) => ({ [v]: name }))),
      ),
    ),
  };

  if (typeof window !== 'undefined') {
    config.searchui.marinemeasure.host =
      process.env.RAZZLE_ES_PROXY_ADDR || getClientProxyAddress();
  }

  return config;
}
