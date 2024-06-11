const fields = ['root_path', 'title', 'types'];

const schema = ({ contentTypes }) => {
  const availableTypes = contentTypes.map((type) => [
    type.id,
    type.title || type.name,
  ]);
  return {
    title: 'RAST',

    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields,
      },
    ],

    properties: {
      root_path: {
        title: 'Rooth path',
        type: 'string',
        description:
          'Ex: /en/knowledge-and-data/regional-adaptation-support-tool',
        required: true,
        noValueOption: false,
      },
      title: {
        title: 'Title',
      },
      types: {
        title: 'Display content types',
        description: 'Choose content types displayed as children',
        choices: availableTypes,
        isMulti: true,
      },
    },

    required: [],
  };
};

export default schema;
