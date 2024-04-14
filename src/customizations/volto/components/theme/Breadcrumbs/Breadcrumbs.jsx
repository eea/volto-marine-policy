/**
 * Breadcrumbs components.
 * @module components/theme/Breadcrumbs/Breadcrumbs
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from 'react-router';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getBreadcrumbs } from '@plone/volto/actions';

import EEABreadcrumbs from '@eeacms/volto-eea-design-system/ui/Breadcrumbs/Breadcrumbs';

const Breadcrumbs = (props) => {
  const dispatch = useDispatch();
  const { items = [], root = '/marine' } = useSelector(
    (state) => state?.breadcrumbs,
  );
  // const pathname = useSelector((state) => state.location.pathname);
  const location = useLocation();
  const { pathname } = location;
  const breadCrumbsRoot = root?.length > 0 ? root : '/marine';

  const sections = items.map((item) => ({
    title: item.title,
    href: item.url,
    key: item.title,
  }));

  useEffect(() => {
    if (!hasApiExpander('breadcrumbs', getBaseUrl(pathname))) {
      dispatch(getBreadcrumbs(getBaseUrl(pathname)));
    }
  }, [dispatch, pathname]);

  return (
    <React.Fragment>
      <div id="page-header" />
      <EEABreadcrumbs
        pathname={pathname}
        sections={sections}
        root={breadCrumbsRoot}
      />
    </React.Fragment>
  );
};

export default Breadcrumbs;
