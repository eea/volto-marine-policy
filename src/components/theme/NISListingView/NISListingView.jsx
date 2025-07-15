import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.less';

const NISListingView = ({ items, isEditMode }) => {
  return (
    <div className="items">
      {items.map((item, index) => (
        <div className="listing-item" key={item['@id']}>
          <div className="listing-body">
            <h3>
              <Link to={item['@id']}>{item.title}</Link>
            </h3>
            <div className="listing-metadata">
              {item.nis_species_name_accepted && (
                <div className="metadata-item">
                  <b>Species name accepted:</b> {item.nis_species_name_accepted}
                </div>
              )}
              {item.nis_region && (
                <div className="metadata-item">
                  <b>Region:</b> {item.nis_region}
                </div>
              )}
              {item.nis_subregion && (
                <div className="metadata-item">
                  <b>Subregion:</b> {item.nis_subregion}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

NISListingView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default NISListingView;
