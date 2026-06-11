import ProgressWorkflow from '@eeacms/volto-marine-policy/components/theme/ProgressWorkflow/ProgressWorkflow';

import qs from 'query-string';
import PropTypes from 'prop-types';
import './style.less';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { Button, Select, Dimmer, Loader } from 'semantic-ui-react';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';

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
      // console.error('Invalid query param JSON', e);
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
    const response = await fetch(
      `${window.env.apiPath}/++api++/@querystring-search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
    return response;
  } catch (err) {
    // console.error('Querystring search failed:', err);
  }
}

function formatAssignedTo(assignedTo) {
  if (!assignedTo) return '';
  // Fix Python-style unicode escape sequences (\UXXXXXXXX -> actual char)
  let result = assignedTo.replace(/\\U([0-9A-Fa-f]{8})/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  // Strip the "(userid)" suffix to show only the display name
  result = result.replace(/\s*\([^)]+\)\s*$/, '').trim();
  return result;
}

const NISListingView = ({ items, isEditMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [duplicateIds, setDuplicateIds] = useState(null);
  const [duplicateGroups, setDuplicateGroups] = useState([]);

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
      `${window.env.apiPath}/++api++/@bulk-assign${window.location.search}`,
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

  const handleCopy = async (item) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${window.env.apiPath}${item['@id']}/@copy-nis-record`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        },
      );
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Copy failed:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const parsed = qs.parse(window.location.search);
    if (parsed['check-duplicates']) {
      const containerPath = window.location.pathname.replace('/marine', '');
      fetch(`${window.env.apiPath}${containerPath}/@check-nis-duplicates`)
        .then((res) => res.json())
        .then((data) => {
          setDuplicateIds(new Set(data.duplicate_ids));
          setDuplicateGroups(data.groups || []);
        });
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(
        `${window.env.apiPath}/++api++/@vocabularies/nis_experts_vocabulary`,
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
            text: formatAssignedTo(u.title),
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
            <Button
              className="primary"
              size="small"
              onClick={() => {
                const parsed = qs.parse(window.location.search);
                parsed['check-duplicates'] = '1';
                window.location.search = qs.stringify(parsed);
              }}
            >
              Check duplicates
            </Button>
          </div>
        </div>
      )}
      {duplicateIds && (
        <div
          style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            padding: '10px 15px',
            marginBottom: '15px',
            borderRadius: '4px',
          }}
        >
          Showing {items.filter((i) => duplicateIds.has(i['@id'])).length}{' '}
          duplicate records across {duplicateGroups.length} groups
          <a
            href={(() => {
              const p = qs.parse(window.location.search);
              delete p['check-duplicates'];
              const q = qs.stringify(p);
              return `${window.location.pathname}${q ? '?' + q : ''}`;
            })()}
            style={{ marginLeft: '10px', fontSize: '0.9em' }}
          >
            Clear
          </a>
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
            <th>Year</th>
            <th>Assigned to</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(duplicateIds
            ? items.filter((item) => duplicateIds.has(item['@id']))
            : items
          ).map((item, index) => (
            <tr key={item['@id']}>
              <td>{item.nis_species_name_original}</td>
              <td>{item.nis_species_name_accepted}</td>
              <td>{item.nis_scientificname_accepted}</td>
              <td>{item.nis_region}</td>
              <td>{item.nis_subregion}</td>
              <td>{item.nis_country}</td>
              <td>{item.nis_status}</td>
              <td>{item.nis_group}</td>
              <td>{item.nis_year}</td>
              <td>
                <div className="assigned-to-container">
                  <div>{formatAssignedTo(item.nis_assigned_to)}</div>
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
                    <UniversalLink
                      className="ui button secondary mini"
                      href={`${item['@id']}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </UniversalLink>
                    <UniversalLink
                      className="ui button primary mini"
                      href={`${item['@id']}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Edit
                    </UniversalLink>
                    {canEditPage && (
                      <Button
                        className="tertiary mini"
                        onClick={() => handleCopy(item)}
                      >
                        Copy
                      </Button>
                    )}
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
