const DemoSitesExplorerSchema = {
  title: 'Demo Sites Explorer',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['mapVariation'],
    },
  ],

  properties: {
    mapVariation: {
      title: 'Choose the type of map',
      description:
        'If enabled, the Marine Protected Areas layer will be displayed on the map, without the filters and the chart on the right side',
      // type: 'boolean',
      choices: [
        ['standard', 'Standard map with filters and chart'],
        ['blueParks', 'Marine protected areas map with Blue Parks projects'],
        [
          'blueParksObj1',
          'Marine protected areas map with Objective 1 and Blue Parks projects',
        ],
      ],
      default: 'standard',
    },
  },
  required: ['mapVariation'],
};

export default DemoSitesExplorerSchema;
