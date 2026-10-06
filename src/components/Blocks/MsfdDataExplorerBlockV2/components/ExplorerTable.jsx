import React from 'react';
import { Icon } from 'semantic-ui-react';

// Cell values are `{raw, text, tooltip, empty}` and are rendered as plain React
// children, never as raw HTML.
const renderCell = (cell) => {
  if (!cell) return null;

  if (cell.empty) return <em className="msfd-empty">No value</em>;

  if (cell.tooltip) {
    return <span title={cell.tooltip}>{cell.text}</span>;
  }

  return cell.text;
};

// Renders one data row. `key` is passed in because grouped rows need a stable
// key per group (the row index alone is not unique across groups).
const renderDataRow = (row, key, columns, onView) => (
  <tr key={key}>
    {columns.map((column) => (
      <td
        key={column.key}
        className={column.align === 'right' ? 'is-right' : ''}
      >
        {renderCell(row[column.key])}
      </td>
    ))}
    <td className="msfd-table-action-col">
      <button
        type="button"
        className="msfd-view"
        onClick={() => onView && onView(row)}
      >
        View <Icon name="external" />
      </button>
    </td>
  </tr>
);

// Buckets the rows of the current page by the grouping column, preserving the
// order the backend returned them in.
const bucketRows = (rows, groupBy) => {
  const buckets = new Map();

  (rows || []).forEach((row) => {
    const cell = row[groupBy];
    const key = cell ? cell.raw : null;
    const bucket = buckets.get(key);

    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  });

  return buckets;
};

// Flat results table with sortable column headers and a per row action. When
// the provider declares a `groupBy` (only the 2012 cycle does) the rows are
// rendered under a header per group; groups that carry extra detail show it in
// a panel above their rows.
const ExplorerTable = ({
  columns,
  rows,
  sort,
  dir,
  onSort,
  onView,
  groups,
  groupBy,
}) => {
  if (!columns || !columns.length) return null;

  const isGrouped = Boolean(groupBy && groups && groups.length);
  const buckets = isGrouped ? bucketRows(rows, groupBy) : null;
  const totalColumns = columns.length + 1;

  const renderGroup = (group) => {
    const groupRows = buckets.get(group.key) || [];
    const fields = (group.meta && group.meta.fields) || [];
    const nodes = [
      <tr className="msfd-group-row" key={`group-${group.key}`}>
        <td colSpan={totalColumns}>
          <div className="msfd-group-header">
            <span className="msfd-group-name">{group.label || group.key}</span>
            <span className="msfd-group-count">
              {group.count} {group.count === 1 ? 'MRU' : 'MRUs'}
            </span>
          </div>
        </td>
      </tr>,
    ];

    if (fields.length > 0) {
      nodes.push(
        <tr className="msfd-group-detail" key={`group-detail-${group.key}`}>
          <td colSpan={totalColumns}>
            <dl className="msfd-group-detail-fields">
              {fields.map((field) => (
                <React.Fragment key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </td>
        </tr>,
      );
    }

    groupRows.forEach((row, index) =>
      nodes.push(
        renderDataRow(row, `row-${group.key}-${index}`, columns, onView),
      ),
    );

    return nodes;
  };

  return (
    <div className="msfd-table-wrapper">
      <table className="msfd-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.align === 'right' ? 'is-right' : ''}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className="msfd-table-sort"
                    onClick={() => onSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <Icon
                      name={
                        sort === column.key
                          ? dir === 'desc'
                            ? 'caret down'
                            : 'caret up'
                          : 'sort'
                      }
                    />
                  </button>
                ) : (
                  <span>{column.label}</span>
                )}
              </th>
            ))}
            <th className="msfd-table-action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          {isGrouped
            ? groups.flatMap(renderGroup)
            : (rows || []).map((row, index) =>
                renderDataRow(row, `row-${index}`, columns, onView),
              )}
        </tbody>
      </table>
    </div>
  );
};

export default ExplorerTable;
