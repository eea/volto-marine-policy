import React from 'react';
import { Icon } from 'semantic-ui-react';

// Cell values are `{raw, text, tooltip, empty}` and are rendered as plain React
// children, never as raw HTML.
const URL_RE = /^https?:\/\/\S+$/i;

const renderCellValue = (cell) => {
  // Cells whose whole value is a URL become real links (the Article 7 URL
  // column is the common case), so they are clickable and copyable as links.
  if (typeof cell.text === 'string' && URL_RE.test(cell.text)) {
    return (
      <a
        className="msfd-link"
        href={cell.text}
        rel="noopener noreferrer"
        target="_blank"
      >
        {cell.text}
      </a>
    );
  }

  return cell.text;
};

const renderCell = (cell) => {
  if (!cell) return null;

  if (cell.empty) return <em className="msfd-empty">No value</em>;

  const value = renderCellValue(cell);

  if (cell.tooltip) {
    return <span title={cell.tooltip}>{value}</span>;
  }

  return value;
};

// Long free-text cells are truncated to a single line; clicking the cell
// reveals the full value in place (clicking again, or pressing Escape, collapses
// it). `isExpanded`/`onToggle` are passed in because the expanded state lives on
// the table, keyed by a stable cell id.
const renderExpandableCell = (cell, cellKey, expanded, onToggle) => (
  <button
    type="button"
    className={`msfd-cell-expandable${expanded ? ' is-expanded' : ''}`}
    aria-expanded={expanded}
    title={expanded ? 'Click to collapse' : 'Click to see the full text'}
    onClick={() => onToggle(cellKey)}
    onKeyDown={(event) => {
      if (event.key === 'Escape' && expanded) onToggle(cellKey);
    }}
  >
    <span className="msfd-cell-expandable-text">{cell.text}</span>
    <Icon name={expanded ? 'compress' : 'expand'} />
  </button>
);

const renderDataCell = (row, column, cellKey, isExpanded, onToggle) => {
  const cell = row[column.key];

  if (column.expandable && cell && !cell.empty) {
    return renderExpandableCell(cell, cellKey, isExpanded(cellKey), onToggle);
  }

  return renderCell(cell);
};

// Per-column minimum width. The provider can tune it per column (`minWidth`
// in the column spec) and that always wins; when it does not (or until the
// backend providing the hints is reloaded), a small semantic fallback keeps
// the table readable: long free-text columns and name/URL columns get more
// room than short code/label columns. The table keeps its auto layout, but a
// cell is never squeezed below its minimum, so the wrapper scrolls
// horizontally rather than wrapping columns to death.
const DEFAULT_MIN_WIDTH = 130;
const EXPANDABLE_MIN_WIDTH = 220;
const NAME_MIN_WIDTH = 200;
const URL_MIN_WIDTH = 200;

const columnMinWidth = (column) => {
  if (column.minWidth) return column.minWidth;
  if (column.expandable) return EXPANDABLE_MIN_WIDTH;
  if (/url|link|website|homepage/i.test(column.key)) return URL_MIN_WIDTH;
  if (/name|title/i.test(column.key)) return NAME_MIN_WIDTH;

  return DEFAULT_MIN_WIDTH;
};

const columnStyle = (column) => ({
  minWidth: `${columnMinWidth(column)}px`,
});

// Renders one data row. `key` is passed in because grouped rows need a stable
// key per group (the row index alone is not unique across groups).
const renderDataRow = (row, key, columns, onView, isExpanded, onToggleCell) => (
  <tr key={key}>
    {columns.map((column) => {
      const cellKey = `${key}:${column.key}`;

      return (
        <td
          key={column.key}
          className={column.align === 'right' ? 'is-right' : ''}
          style={columnStyle(column)}
        >
          {renderDataCell(row, column, cellKey, isExpanded, onToggleCell)}
        </td>
      );
    })}
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
        style={columnStyle(column)}
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
  const [expandedCells, setExpandedCells] = React.useState({});

  const toggleCell = React.useCallback((key) => {
    setExpandedCells((previous) => ({ ...previous, [key]: !previous[key] }));
  }, []);

  const isExpanded = React.useCallback(
    (key) => Boolean(expandedCells[key]),
    [expandedCells],
  );

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
                        isExpanded,
                        toggleCell,
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
            renderDataRow(
              row,
              `row-${index}`,
              columns,
              onView,
              isExpanded,
              toggleCell,
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExplorerTable;
