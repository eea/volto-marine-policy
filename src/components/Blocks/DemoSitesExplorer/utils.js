import { openlayers as ol } from '@eeacms/volto-openlayers-map';

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
        description: c.properties.description,
        index: index,
        path: c.properties.path,
        color: c.properties.nwrm_type === 'Light' ? '#50B0A4' : '#0083E0',
      },
      false,
    );
    return point;
  });
}

export function filterCases(cases, activeFilters, demoSitesIds, searchInput) {
  const data = cases.filter((_case) => {
    let flag_searchInput = false;
    let flag_objective = false;
    let flag_indicator = false;
    let flag_project = false;
    let flag_country = false;
    let flag_case = demoSitesIds
      ? demoSitesIds.includes(_case.properties.url.split('/').pop())
      : true;

    if (!searchInput) {
      flag_searchInput = true;
    } else {
      if (_case.properties.title.toLowerCase().match(searchInput)) {
        flag_searchInput = true;
        // } else if (
        //   _case.properties.description.toLowerCase().match(searchInput)
        // ) {
        //   flag_searchInput = true;
      }
    }

    // debugger;
    if (!activeFilters.objective_filter.length) {
      flag_objective = true;
    } else {
      let objective = _case.properties.objective?.map((item) => {
        return item['id'].toString();
      });

      activeFilters.objective_filter.forEach((filter) => {
        if (objective?.includes(filter)) flag_objective = true;
      });
    }

    // if (!activeFilters.sectors.length) {
    //   flag_sectors = true;
    // } else {
    //   let sectors = _case.properties.sectors?.map((item) => {
    //     return item.toString();
    //   });

    //   activeFilters.sectors.forEach((filter) => {
    //     if (sectors?.includes(filter)) flag_sectors = true;
    //   });
    // }

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

    return flag_case &&
      flag_objective &&
      flag_country &&
      flag_project &&
      flag_searchInput
      ? _case
      : false;
  });

  return data;
}

export function getFilters(cases) {
  let _filters = {
    objective_filter: {},
    indicator_filter: {},
    project_filter: {},
    country_filter: {},
  };

  for (let key of Object.keys(cases)) {
    const _case = cases[key];
    // debugger;
    //   let nwrms_implemented = _case.properties.measures;
    //   nwrms_implemented.map((item) => {
    //     if (!_filters.nwrms_implemented.hasOwnProperty(item['id'])) {
    //       _filters.nwrms_implemented[item['id']] = item['title'];
    //     }
    //     return [];
    //   });

    let project = _case.properties.project;

    if (!_filters.project_filter.hasOwnProperty(project)) {
      _filters.project_filter[project] = project;
    }

    let countries = _case.properties.country;
    countries.map((item) => {
      if (!_filters.country_filter.hasOwnProperty(item)) {
        _filters.country_filter[item] = item;
      }
      return [];
    });
  }

  return _filters;
}
