import ScrollToTop from './ScrollToTop';
// import PrintPage from './PrintPage';

const config = (config) => {
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

export default config;
