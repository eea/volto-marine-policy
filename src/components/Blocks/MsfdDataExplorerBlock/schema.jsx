const MsfdDataExplorerBlockSchema = {
  title: 'Data Explorer Block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['article_select'],
    },
  ],

  properties: {
    article_select: {
      title: 'Select article',
      choices: [
        ['marine-units', 'Article 4'],
        ['competent-authorities', 'Article 7'],
        ['assessments', 'Article 8'],
        ['determination-of-good-environmental-status', 'Article 9'],
        ['establishment-of-environmental-targets', 'Article 10'],
        ['monitoring-programmes', 'Article 11'],
        ['programmes-of-measures-progress-of-pom', 'Article 13 & 18'],
        ['exceptions', 'Article 14'],
        ['datasets-used', 'Article 19.3'],
      ],
    },
  },
  required: ['article_select'],
};

export default MsfdDataExplorerBlockSchema;
