import ProgressWorkflow from '@eeacms/volto-marine-policy/components/theme/ProgressWorkflow/ProgressWorkflow';

import qs from 'query-string';
import PropTypes from 'prop-types';
import './style.less';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { Button, Select, Dimmer, Loader } from 'semantic-ui-react';

function normalizeQueryOperators(query) {
  return query.map((q) => {
    // if the operator starts with "paqo", replace with full
    if (q.o && q.o.startsWith('paqo.')) {
      const op = q.o.replace('paqo.', 'plone.app.querystring.operation.');
      return { ...q, o: op };
    }
    return q;
  });
}

async function getCurrentSearchItems() {
  // parse querystring into an object
  const parsed = qs.parse(window.location.search);

  // decode the `query` param, which is itself a JSON string
  let query = [];
  if (parsed.query) {
    try {
      query = normalizeQueryOperators(JSON.parse(parsed.query));
    } catch (e) {
      console.error('Invalid query param JSON', e);
    }
  }

  // build payload
  const payload = {
    metadata_fields: '_all',
    b_size: parsed.b_size ? parseInt(parsed.b_size, 10) : 25,
    limit: parsed.limit ? parseInt(parsed.limit, 10) : 3000,
    query,
    sort_on: parsed.sort_on || 'effective',
    sort_order: parsed.sort_order || 'ascending',
    b_start: parsed.b_start ? parseInt(parsed.b_start, 10) : 0,
  };

  // call Plone
  try {
    const response = await fetch('/++api++/@querystring-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (err) {
    console.error('Querystring search failed:', err);
  }
}

const NISListingView = ({ items, isEditMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const actions = useSelector((state) => state.actions.actions);
  const canEditPage = actions?.object?.some((action) => action.id === 'edit');

  const toggleSelection = (id) => {
    setItemsTotal(0);
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id && x !== 'All')
        : [...prev.filter((x) => x !== 'All'), id],
    );
  };

  const handleBulkAssign = () => {
    setItemsTotal(0);
    onBulkAssign(selectedItems, assignee);
    setSelectedItems([]);
    setAssignee(null);
  };

  const handleBulkAssignAll = async () => {
    const items = await getCurrentSearchItems();
    const itemsTotal = await items.json();
    setItemsTotal(itemsTotal.items_total);
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
            {itemsTotal > 0 &&
              selectedItems[0] === 'All' &&
              `Assign ${itemsTotal} search result items`}
            {itemsTotal === 0 &&
              `Assign ${selectedItems.length} selected item${
                selectedItems.length > 1 ? 's' : ''
              }`}
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
