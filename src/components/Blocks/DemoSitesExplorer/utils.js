import { openlayers as ol } from '@eeacms/volto-openlayers-map';

export const truncateText = (str, max = 50) => {
  if (str.length <= max) {
    return str;
  }
  return str.substring(0, max) + '...';
};

export function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
}

export function centerAndResetMapZoom(map) {
  map.getView().animate({
    zoom: 2.5,
    duration: 1000,
    center: ol.proj.transform([10, 54], 'EPSG:4326', 'EPSG:3857'),
  });
}

export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  element.scrollIntoView({
    behavior: 'smooth',
  });
}

export function getExtentOfFeatures(features) {
  const points = features.map((f) => f.getGeometry().flatCoordinates);
  const point = new ol.geom.MultiPoint(points);
  return point.getExtent();
}

export function zoomMapToFeatures(map, features, threshold = 500) {
  const extent = getExtentOfFeatures(features);
  let extentBuffer = (extent[3] - extent[1] + extent[2] - extent[0]) / 4;
  extentBuffer = extentBuffer < threshold ? threshold : extentBuffer;
  const paddedExtent = ol.extent.buffer(extent, extentBuffer);
  map.getView().fit(paddedExtent, { ...map.getSize(), duration: 1000 });
}

export function getFeatures(cases) {
  const Feature = ol.ol.Feature;
  const colors = {
    'Making the sustainable blue economy carbon-neutral and circular':
      '#f9eb8a',
    'Digital twin of the ocean': '#004b7f',
    'Prevent and eliminate pollution of waters': '#fdaf20',
    'Protecting and restoring marine and freshwater ecosystems and biodiversity':
      '#007b6c',
    'Public mobilisation and engagement': '#9e83b6',
  };
  const width = {
    'Demo site': 6,
    'Associated region': 8,
  };

  const radius = {
    'Demo site': 6,
    'Associated region': 5,
  };

  return cases.map((c, index) => {
    const {
      geometry: { coordinates },
    } = c;
    const point = new Feature(
      new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
    );
    point.setId(index);
    point.setProperties(
      {
        title: c.properties.title,
        image: c.properties.image,
        project: c.properties.project,
        project_link: c.properties.project_link,
        country: c.properties.country,
        type_is_region: c.properties.type_is_region,
        type: c.properties.type,
        indicators: c.properties.indicators,
        info: c.properties.info,
        website: c.properties.website,
        objective: c.properties.objective,
        target: c.properties.target,
        description: c.properties.description,
        index: index,
        path: c.properties.path,
        color: colors[c.properties.objective] || '#B83230',
        width: width[c.properties.type_is_region],
        radius: radius[c.properties.type_is_region],
      },
      false,
    );
    return point;
  });
}

export function filterCases(cases, activeFilters, indicatorOnly) {
  const data = cases.filter((_case) => {
    let flag_objective = false;
    let flag_target = false;
    let flag_indicator = false;
    let flag_project = false;
    let flag_country = false;
    let flag_indicatorOnly = false;

    if (indicatorOnly) {
      let indicators = _case.properties.indicators?.map((item) => {
        return item['title'].toString();
      });
      if (indicators?.includes(indicatorOnly)) flag_indicatorOnly = true;
    } else {
      flag_indicatorOnly = true;
    }

    // debugger;
    if (!activeFilters.objective_filter.length) {
      flag_objective = true;
    } else {
      let objective = _case.properties.objective;

      activeFilters.objective_filter.forEach((filter) => {
        if (objective?.includes(filter)) flag_objective = true;
      });
    }

    if (!activeFilters.target_filter.length) {
      flag_target = true;
    } else {
      let target = _case.properties.target;

      activeFilters.target_filter.forEach((filter) => {
        if (target?.includes(filter)) flag_target = true;
      });
    }

    if (!activeFilters.indicator_filter.length) {
      flag_indicator = true;
    } else {
      let indicators = _case.properties.indicators?.map((item) => {
        return '_' + item['id'].toString();
      });

      activeFilters.indicator_filter.forEach((filter) => {
        if (indicators?.includes(filter)) flag_indicator = true;
      });
    }

    if (!activeFilters.project_filter.length) {
      flag_project = true;
    } else {
      let project = _case.properties.project;

      activeFilters.project_filter.forEach((filter) => {
        if (project === filter) flag_project = true;
      });
    }

    if (!activeFilters.country_filter.length) {
      flag_country = true;
    } else {
      let countries = _case.properties.country?.map((item) => {
        return item.toString();
      });

      activeFilters.country_filter.forEach((filter) => {
        if (countries?.includes(filter)) flag_country = true;
      });
    }

    return flag_indicatorOnly &&
      flag_objective &&
      flag_target &&
      flag_indicator &&
      flag_country &&
      flag_project
      ? _case
      : false;
  });

  return data;
}

export function getFilters(cases, indicatorOnly) {
  let _filters = {
    objective_filter: {},
    target_filter: {},
    indicator_filter: {},
    project_filter: {},
    country_filter: {},
  };

  for (let key of Object.keys(cases)) {
    const _case = cases[key];
    // debugger;

    let indicators = _case.properties.indicators;
    indicators.map((item) => {
      if (
        item['title'] &&
        item['title'] !== '0' &&
        !_filters.indicator_filter.hasOwnProperty('_' + item['id'])
      ) {
        _filters.indicator_filter['_' + item['id']] = item['title'];
      }
      return [];
    });

    let objective = _case.properties.objective;
    objective.map((item) => {
      if (item && !_filters.objective_filter.hasOwnProperty(item)) {
        _filters.objective_filter[item] = item;
      }
      return [];
    });

    let target = _case.properties.target;
    target.map((item) => {
      if (item && !_filters.target_filter.hasOwnProperty(item)) {
        _filters.target_filter[item] = item;
      }
    });

    let project = _case.properties.project;
    if (project && !_filters.project_filter.hasOwnProperty(project)) {
      if (!indicatorOnly) {
        _filters.project_filter[project] = project;
      } else {
        let indicators = _case.properties.indicators?.map((item) => {
          return item['title'].toString();
        });
        if (indicators?.includes(indicatorOnly)) {
          _filters.project_filter[project] = project;
        }
      }
      // _filters.project_filter[project] = project;
    }

    let countries = _case.properties.country || [];
    countries.map((item) => {
      if (item && !_filters.country_filter.hasOwnProperty(item)) {
        if (!indicatorOnly) {
          _filters.country_filter[item] = item;
        } else {
          let indicators = _case.properties.indicators?.map((item) => {
            return item['title'].toString();
          });
          if (indicators?.includes(indicatorOnly)) {
            _filters.country_filter[item] = item;
          }
        }
        // _filters.country_filter[item] = item;
      }
      return [];
    });
  }

  return _filters;
}
