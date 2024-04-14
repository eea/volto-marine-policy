import installMainSearch from './config';
import MarineMeasureItem from '../components/Result/MarineMeasureItem';

const applyConfig = (config) => {
  config.settings.searchlib = installMainSearch(config.settings.searchlib);

  const { resolve } = config.settings.searchlib;

  resolve.MarineMeasureItem = { component: MarineMeasureItem };

  // fix the query
  const marineMeasureConfig = config.settings.searchlib.searchui.marinemeasure;
  const index = marineMeasureConfig.permanentFilters.findIndex(
    (f) => f.id === 'constantScore',
  );
  const baseConstantScore = marineMeasureConfig.permanentFilters[index];

  function updatedConstantScore() {
    const base = baseConstantScore();
    let filterBool = base.constant_score.filter.bool;

    if (filterBool) {
      if (!Array.isArray(filterBool.must_not)) {
        if (
          filterBool.must_not?.exists?.field === 'exclude_from_globalsearch'
        ) {
          delete filterBool.must_not;
        }
      } else {
        filterBool.must_not = filterBool.must_not.filter((item) => {
          if (item?.exists?.field === 'exclude_from_globalsearch') {
            return false;
          }
          return true;
        });
      }
    }

    return base;
  }

  updatedConstantScore.id = 'constantScore';

  marineMeasureConfig.permanentFilters[index] = updatedConstantScore;
  return config;
};

export default applyConfig;
