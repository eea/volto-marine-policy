import React from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import { useChildren } from './View';

const AccordionContent = (props) => {
  const {
    main,
    curent_location,
    data: { types = [] },
  } = props;
  const location = main.url;

  // React.useEffect(() => {
  //   const action = getContent(location, null, location);
  //   dispatch(action);
  // }, [location, dispatch]);

  // items = useSelector(
  //   (state) => state.content?.subrequests?.[location]?.data?.items || [],
  // );
  const items = useChildren(location);
  return (
    <div className="dataset-content">
      <div>
        {items.length
          ? items
              .filter((item) =>
                types.length ? types.includes(item['@type']) : item,
              )
              .map((item) => (
                <List.Item
                  key={item.id}
                  className={`${
                    item['@id'].endsWith(curent_location.pathname)
                      ? 'active'
                      : ''
                  }`}
                >
                  <List.Content>
                    <div className="dataset-item">
                      <Link to={flattenToAppURL(getBaseUrl(item['@id']))}>
                        {item.title}
                      </Link>
                    </div>
                  </List.Content>
                </List.Item>
              ))
          : null}
      </div>
    </div>
  );
};

export default compose()(AccordionContent);
