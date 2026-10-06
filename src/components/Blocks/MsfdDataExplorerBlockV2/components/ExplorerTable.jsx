import React from 'react';

// Renders the result table. Cell values are `{raw, text, tooltip, empty}` and
// are rendered as plain React children, never as raw HTML.
const ExplorerTable = ({ columns, rows }) => {
  if (!columns || !columns.length) return null;

  return (
    <div className="double-scroll">
      <table className="listing">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} title={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => {
                const cell = row[column.key] || {};

                return (
                  <td key={column.key}>
                    {cell.empty ? (
                      <em>No value</em>
                    ) : cell.tooltip ? (
                      <span title={cell.tooltip}>{cell.text}</span>
                    ) : (
                      cell.text
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExplorerTable;
