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

// Column header cells, shared by the flat table and each per-group table.
const renderHeaderCells = (columns, sort, dir, onSort) => (
  <>
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
  </>
);

// Flat results table with sortable column headers and a per row action. When
// the provider declares a `groupBy` (only the 2012 cycle does) each group gets
// its own block: the country header row, its detail panel, then the column
// headers and that group's rows.
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

  if (isGrouped) {
    const buckets = bucketRows(rows, groupBy);

    return (
      <div className="msfd-table-groups">
        {groups.map((group) => {
          const groupRows = buckets.get(group.key) || [];
          const fields = (group.meta && group.meta.fields) || [];

          return (
            <section className="msfd-group" key={group.key}>
              <div className="msfd-group-row">
                <div className="msfd-group-header">
                  <span className="msfd-group-name">
                    {group.label || group.key}
                  </span>
                  <span className="msfd-group-count">
                    {group.count} {group.count === 1 ? 'MRU' : 'MRUs'}
                  </span>
                </div>
              </div>

              {fields.length > 0 && (
                <div className="msfd-group-detail">
                  <dl className="msfd-group-detail-fields">
                    {fields.map((field) => (
                      <React.Fragment key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </div>
              )}

              <div className="msfd-table-wrapper">
                <table className="msfd-table">
                  <thead>
                    <tr>{renderHeaderCells(columns, sort, dir, onSort)}</tr>
                  </thead>
                  <tbody>
                    {groupRows.map((row, index) =>
                      renderDataRow(
                        row,
                        `row-${group.key}-${index}`,
                        columns,
                        onView,
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="msfd-table-wrapper">
      <table className="msfd-table">
        <thead>
          <tr>{renderHeaderCells(columns, sort, dir, onSort)}</tr>
        </thead>
        <tbody>
          {(rows || []).map((row, index) =>
            renderDataRow(row, `row-${index}`, columns, onView),
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExplorerTable;
