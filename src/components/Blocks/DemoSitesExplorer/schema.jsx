const DemoSitesExplorerSchema = {
  title: 'Demo Sites Explorer',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['enableMarineMO'],
    },
  ],

  properties: {
    enableMarineMO: {
      title: 'Enable Marine Protected Areas layer',
      description:
        'If enabled, the Marine Protected Areas layer will be displayed on the map, without the filters and the chart on the right side',
      type: 'boolean',
      default: false,
    },
  },
  required: ['enableMarineMO'],
};

export default DemoSitesExplorerSchema;
