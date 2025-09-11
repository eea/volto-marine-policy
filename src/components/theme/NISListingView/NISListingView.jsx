import ProgressWorkflow from '@eeacms/volto-marine-policy/components/theme/ProgressWorkflow/ProgressWorkflow';

import PropTypes from 'prop-types';
import './style.less';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { Button, Select, Dimmer, Loader } from 'semantic-ui-react';

const NISListingView = ({ items, isEditMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const actions = useSelector((state) => state.actions.actions);
  const canEditPage = actions?.object?.some((action) => action.id === 'edit');

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

  const handleBulkAssignAll = () => {
    setSelectedItems(['All']);
  };

  const onBulkAssign = async (ids, assignee) => {
    setIsLoading(true);
    await fetch(
      `${window.location.origin}/marine/++api++/@bulk-assign${window.location.search}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: ids,
          assigned_to: assignee,
          search: window.location.search,
        }),
      },
    );

    window.location.reload();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(
        `${window.location.origin}/marine/++api++/@vocabularies/nis_experts_vocabulary`,
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

  return (
    <>
      {isLoading && (
        <Dimmer active inverted>
          <Loader>Assigning...</Loader>
        </Dimmer>
      )}
      {canEditPage && (
        <div className="download-button-wrapper">
          <Button
            className="primary"
            size="small"
            onClick={handleBulkAssignAll}
          >
            <i className="ri-user-add-line"></i>Assign search results
          </Button>
          <div>
            <a
              href={`/marine/++api++${window.location.pathname.replace(
                '/marine',
                '',
              )}/nis-export${window.location.search}`}
              title="Download"
              target="_blank"
              rel="noopener"
              className="ui button primary download-as-xls"
            >
              <i className="ri-file-download-line"></i>
              Download search results
            </a>
          </div>
        </div>
      )}
      <table className="ui table">
        <thead>
          <tr>
            <th>Species name original</th>
            <th>Species name accepted</th>
            <th>Scientific name accepted</th>
            <th>Region</th>
            <th>Subregion</th>
            <th>Country</th>
            <th>Status</th>
            <th>Group</th>
            <th>Assigned to</th>
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
              <td>{item.nis_country && item.nis_country.join(', ')}</td>
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
