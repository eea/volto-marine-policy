import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.less';

// const NISListingView = ({ items, isEditMode }) => {
//   console.log(items);
//   return (
//     <div className="items">
//       {items.map((item, index) => (
//         <div className="listing-item" key={item['@id']}>
//           <div className="listing-body">
//             <h3>
//               <Link to={item['@id']}>{item.title}</Link>
//             </h3>
//             <div className="listing-metadata">
//               {item.nis_species_name_accepted && (
//                 <div className="metadata-item">
//                   <b>Species name accepted:</b> {item.nis_species_name_accepted}
//                 </div>
//               )}
//               {item.nis_region && (
//                 <div className="metadata-item">
//                   <b>Region:</b> {item.nis_region}
//                 </div>
//               )}
//               {item.nis_subregion && (
//                 <div className="metadata-item">
//                   <b>Subregion:</b> {item.nis_subregion}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

const NISListingView = ({ items, isEditMode }) => {
  console.log(items);
  return (
    <table className="ui table">
      <thead>
        <tr>
          <th>Species name original</th>
          <th>Species name accepted</th>
          <th>Scientific name accepted</th>
          <th>Region</th>
          <th>Subregion</th>
          <th>Status</th>
          <th>Group</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item['@id']}>
            <td>{item.nis_species_name_original}</td>
            <td>{item.nis_species_name_accepted}</td>
            <td>{item.nis_scientificname_accepted}</td>
            <td>{item.nis_region}</td>
            <td>{item.nis_subregion}</td>
            <td>{item.nis_status}</td>
            <td>{item.nis_group}</td>
            <td>
              <div className="action-buttons">
                <a
                  className="ui button secondary mini"
                  href={`${item['@id']}`}
                  target="_blank"
                >
                  View
                </a>
                <a
                  className="ui button primary mini"
                  href={`${item['@id']}/edit`}
                  target="_blank"
                >
                  Edit
                </a>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

NISListingView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default NISListingView;
