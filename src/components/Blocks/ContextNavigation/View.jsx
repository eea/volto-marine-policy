import React from 'react';
import './styles.less';
import ContextNavigation from './ContextNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions';

export function useChildren(location) {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const action = getContent(location, null, location);
    dispatch(action);
  }, [location, dispatch]);

  const items = useSelector(
    (state) => state.content.subrequests?.[location]?.data?.items || [],
  );
  return items;
}

export default function View(props) {
  const { data } = props;
  let root_path = data?.root_path;
  if (typeof root_path === 'undefined') {
    root_path = '/';
  }
  let items = useChildren(root_path);
  if (root_path === '/') {
    items = [];
  }

  return (
    <div className="block rast-block">
      <ContextNavigation
        items={items}
        location={{
          pathname: root_path,
        }}
        data={data}
      />
    </div>
  );
}
