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

// Flat results table with sortable column headers and a per row action.
const ExplorerTable = ({ columns, rows, sort, dir, onSort, onView }) => {
  if (!columns || !columns.length) return null;

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
          {(rows || []).map((row, index) => (
            <tr key={index}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExplorerTable;
