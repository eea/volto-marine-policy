import React from 'react';
import { compose } from 'redux';

import Accordion from './Accordion';
import { useLocation } from 'react-router-dom';

/**
 * A navigation slot implementation, similar to the classic Plone navigation
 * portlet. It uses the same API, so the options are similar to
 * INavigationPortlet
 */
export function ContextNavigationComponent(props) {
  const { items, data } = props;
  let activeMenu = null;

  const curent_location = useLocation();
  for (let i = 0; i < items.length; i++) {
    let itemUrl = '/' + items[i]['@id'].split('/').slice(3).join('/');
    items[i].is_active = false;
    if (curent_location.pathname.includes(itemUrl)) {
      activeMenu = i;
      items[i].is_active = true;
    }
  }

  return (
    <>
      {items.length ? (
        <Accordion
          items={items}
          curent_location={curent_location}
          activeMenu={activeMenu}
          data={data}
        />
      ) : null}
    </>
  );
}

// withContentNavigation
export default compose()(ContextNavigationComponent);
