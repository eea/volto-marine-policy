import ScrollToTop from './ScrollToTop';
// import PrintPage from './PrintPage';

export default (config) => {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '',
      component: ScrollToTop,
    },
    // {
    //   match: '',
    //   component: PrintPage,
    // },
  ];

  return config;
};
