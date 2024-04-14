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
  ],
};
