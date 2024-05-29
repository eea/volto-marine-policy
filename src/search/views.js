export default {
  resultViews: [
    {
      id: 'marineMeasureCard',
      title: 'Marine measure items',
      icon: 'bars',
      render: null,
      isDefault: true,
      factories: {
        view: 'HorizontalCard.Group',
        item: 'MarineMeasureItem',
      },
    },
    {
      id: 'indicatorTable',
      title: 'Indicators table',
      icon: 'table',
      render: null,
      isDefault: false,
      factories: {
        view: 'IndicatorsTableView',
        item: 'IndicatorsTableRowItem',
      },
    },
  ],
  indicatorsTableViewParams: {
    titleField: 'title',
    urlField: 'about',
    enabled: false,
    columns: [
      {
        title: 'Source',
        field: 'data_provenances_organisations',
      },
      {
        title: 'Name of indicator',
        field: 'label',
      },
      {
        title: 'Type',
        field: 'dpsir_type',
      },
      {
        title: 'Theme',
        field: 'indicator_theme',
      },
      {
        title: 'Sub-theme',
        field: 'wm_theme',
      },
    ],
  },
};
