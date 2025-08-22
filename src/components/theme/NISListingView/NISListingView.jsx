// import ProgressWorkflow from '@eeacms/volto-workflow-progress/ProgressWorkflow';
import ProgressWorkflow from '@eeacms/volto-marine-policy/components/theme/ProgressWorkflow/ProgressWorkflow';

// import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.less';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { Button, Select } from 'semantic-ui-react';

const NISListingView = ({ items, isEditMode }) => {
  // console.log(items);
  const [selectedItems, setSelectedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const content = useSelector((state) => state.content.data);
  const canEditPage = content?.['@components']?.actions?.object?.some(
    (action) => action.id === 'edit',
  );
  // console.log('canEditPage', canEditPage);

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkAssign = () => {
    onBulkAssign(selectedItems, assignee);
    setSelectedItems([]);
    setAssignee(null);
  };

  const onBulkAssign = async (ids, assignee) => {
    const res = await fetch(`${window.location.origin}/++api++/@bulk-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        items: ids,
        assigned_to: assignee,
      }),
    });

    const result = await res.json();
    // window.location.reload();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(
        `${window.location.origin}/++api++/@vocabularies/nis_experts_vocabulary`,
        {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (data?.items) {
        setUsers(
          data.items.map((u) => ({
            key: u.token,
            text: u.title,
            value: u.token,
          })),
        );
      }
    };
    fetchUsers();
  }, []);
  console.log(items);
  return (
    <>
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
            <th>Assigned to</th>
            <th>
              {canEditPage && (
                <div>
                  <a
                    href={`/++api++${window.location.pathname}/nis-export${window.location.search}`}
                    title="Download"
                    target="_blank"
                    rel="noopener"
                    className="ui button primary download-as-xls"
                  >
                    <i className="ri-file-download-line"></i>
                    Download
                  </a>
                </div>
              )}
            </th>
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
                <div className="assigned-to-container">
                  <div>{item.nis_assigned_to}</div>
                  {canEditPage && (
                    <Checkbox
                      checked={selectedItems.includes(item['@id'])}
                      onChange={() => toggleSelection(item['@id'])}
                    />
                  )}
                </div>
              </td>
              <td>
                <div className="workflow-actions">
                  <div className="action-buttons">
                    <a
                      className="ui button secondary mini"
                      href={`${item['@id']}`}
                      target="_blank"
                      rel="noopener"
                    >
                      View
                    </a>
                    <a
                      className="ui button primary mini"
                      href={`${item['@id']}/edit`}
                      target="_blank"
                      rel="noopener"
                    >
                      Edit
                    </a>
                  </div>
                  <div className="workflow-progress">
                    <ProgressWorkflow
                      content={item}
                      pathname={item['@id']}
                      token={123}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedItems.length > 0 && (
        <div className="users-assign-container">
          <h4>
            Assign {selectedItems.length} item
            {selectedItems.length > 1 ? 's' : ''}
          </h4>
          <Select
            placeholder="Select expert"
            options={users}
            value={assignee}
            onChange={(e, { value }) => setAssignee(value)}
          />
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <Button
              className="tertiary"
              size="small"
              onClick={() => setSelectedItems([])}
              style={{ marginRight: '5px' }}
            >
              Cancel
            </Button>
            <Button
              className="primary"
              size="small"
              // color="green"
              disabled={!assignee}
              onClick={handleBulkAssign}
            >
              Assign
            </Button>
          </div>
        </div>
      )}{' '}
    </>
  );
};

NISListingView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default NISListingView;
