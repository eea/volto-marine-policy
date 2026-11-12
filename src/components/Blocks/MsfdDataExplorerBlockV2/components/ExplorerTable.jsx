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

const renderCellList = (items) => (
  <ul className="msfd-cell-list">
    {items.map((item, index) => (
      <li key={`${item}-${index}`}>
        {typeof item === 'string' && URL_RE.test(item) ? (
          <a
            className="msfd-link"
            href={item}
            rel="noopener noreferrer"
            target="_blank"
          >
            {item}
          </a>
        ) : (
          item
        )}
      </li>
    ))}
  </ul>
);

// Grouped cells (the Article 9/2012 `Feature(s)` column) pack
// `groups: [{label, items: []}]`. They render a FeatureType heading with the
// features as bullets underneath. When the column declares `maxItems` and the
// cell holds more items than that, the list is collapsed to a global budget
// (walking the groups in order, dropping a heading once its items run out)
// with a "Show N more" control that expands it in place.
const renderGroupedCell = (cell, column, cellKey, expanded, onToggle) => {
  const groups = (cell.groups || []).filter(
    (group) => group.items && group.items.length,
  );
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const maxItems = column.maxItems || 0;
  const collapsible = maxItems > 0 && total > maxItems;
  const collapsed = collapsible && !expanded;

  let remaining = collapsed ? maxItems : Infinity;
  const visible = [];

  groups.forEach((group) => {
    if (remaining <= 0) return;

    const items = group.items.slice(0, remaining);
    remaining -= items.length;

    if (items.length) visible.push({ label: group.label, items });
  });

  const shown = visible.reduce((sum, group) => sum + group.items.length, 0);
  const hidden = total - shown;

  return (
    <div className="msfd-cell-grouped">
      {visible.map((group) => (
        <div className="msfd-cell-group" key={group.label}>
          <span className="msfd-cell-group-label">{group.label}</span>
          <ul className="msfd-cell-list">
            {group.items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      {(collapsed || expanded) && collapsible && (
        <button
          type="button"
          className="msfd-cell-more"
          onClick={() => onToggle(cellKey)}
        >
          {collapsed ? `Show ${hidden} more` : 'Show less'}
        </button>
      )}
    </div>
  );
};

// Multi-valued cells (packed codes such as the Article 9 features and marine
// reporting units, or the Article 19.3 dataset URLs) render one bullet per
// token. When the column declares `maxItems` and the cell holds more items than
// that, only the first `maxItems` bullets are shown, with a "Show N more"
// control that expands the cell in place. The comma joined `text` is still used
// for the CSV export.
const renderMultiCell = (cell, column, cellKey, expanded, onToggle) => {
  const items = cell.items;
  const maxItems = column.maxItems || 0;
  const collapsible = maxItems > 0 && items.length > maxItems;
  const collapsed = collapsible && !expanded;
  const visible = collapsed ? items.slice(0, maxItems) : items;
  const hidden = items.length - visible.length;
  const list = renderCellList(visible);

  return (
    <div className="msfd-cell-multi">
      {cell.tooltip ? <div title={cell.tooltip}>{list}</div> : list}
      {collapsible && (
        <button
          type="button"
          className="msfd-cell-more"
          onClick={() => onToggle(cellKey)}
        >
          {collapsed ? `Show ${hidden} more` : 'Show less'}
        </button>
      )}
    </div>
  );
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
//
// The expand/compress icon is only shown when the text actually overflows the
// single-line box (measured against the CSS `max-width`), so short values look
// like plain text. The overflow is measured with a layout effect so there is no
// visible flash; while expanded the box is unconstrained, so the last measured
// value is kept to keep the collapse control on screen.
const ExpandableCell = ({ cell, cellKey, expanded, onToggle }) => {
  const textRef = React.useRef(null);
  const [overflowing, setOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    if (expanded) return;

    const node = textRef.current;

    if (node) setOverflowing(node.scrollWidth > node.clientWidth);
  }, [cell.text, expanded]);

  const showToggle = overflowing || expanded;

  return (
    <button
      type="button"
      className={`msfd-cell-expandable${expanded ? ' is-expanded' : ''}`}
      aria-expanded={showToggle ? expanded : undefined}
      title={
        showToggle
          ? expanded
            ? 'Click to collapse'
            : 'Click to see the full text'
          : undefined
      }
      onClick={() => onToggle(cellKey)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) onToggle(cellKey);
      }}
    >
      <span className="msfd-cell-expandable-text" ref={textRef}>
        {cell.text}
      </span>
      {showToggle && <Icon name={expanded ? 'compress' : 'expand'} />}
    </button>
  );
};

const renderDataCell = (row, column, cellKey, isExpanded, onToggle) => {
  const cell = row[column.key];

  if (cell && Array.isArray(cell.groups) && cell.groups.length) {
    return renderGroupedCell(
      cell,
      column,
      cellKey,
      isExpanded(cellKey),
      onToggle,
    );
  }

  if (cell && Array.isArray(cell.items) && cell.items.length) {
    return renderMultiCell(
      cell,
      column,
      cellKey,
      isExpanded(cellKey),
      onToggle,
    );
  }

  if (column.expandable && cell && !cell.empty) {
    return (
      <ExpandableCell
        cell={cell}
        cellKey={cellKey}
        expanded={isExpanded(cellKey)}
        onToggle={onToggle}
      />
    );
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
    {/* <td className="msfd-table-action-col">
      <button
        type="button"
        className="msfd-view"
        onClick={() => onView && onView(row)}
      >
        View <Icon name="external" />
      </button>
    </td> */}
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
    {/* <th className="msfd-table-action-col">Action</th> */}
  </>
);

// Tracks whether the horizontally scrolling box has content hidden past either
// edge, so the edge cues are only painted when there is actually something to
// scroll to. The table can change width without the box changing size (columns
// are sized from their content), hence the observer on the first child too.
//
// It also reports the width of the pinned first column, because the left cue is
// drawn at that column's right edge: the shadow has to read as the pinned
// column casting it over the cells sliding underneath, not as a shadow at the
// edge of the table. The height of the horizontal scrollbar is measured for the
// same reason on the other axis: the cues stop above the bar rather than run
// over it.
const useEdgeCue = () => {
  const scrollRef = React.useRef(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });
  const [stickyWidth, setStickyWidth] = React.useState(0);
  const [scrollbarHeight, setScrollbarHeight] = React.useState(0);
  const edgesRef = React.useRef(edges);

  React.useEffect(() => {
    const node = scrollRef.current;

    if (!node) return undefined;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      const next = {
        start: node.scrollLeft > 1,
        end: max > 1 && node.scrollLeft < max - 1,
      };

      // Scroll fires once per frame: only re-render when an edge actually
      // changed (setting the width to the same number already bails out).
      if (
        next.start !== edgesRef.current.start ||
        next.end !== edgesRef.current.end
      ) {
        edgesRef.current = next;
        setEdges(next);
      }

      const head = node.querySelector('th:first-child');
      setStickyWidth(head ? head.offsetWidth : 0);
      // `clientHeight` is the box without its horizontal scrollbar, so the
      // difference is the bar (0 when the browser uses overlay scrollbars).
      setScrollbarHeight(node.offsetHeight - node.clientHeight);
    };

    update();
    node.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    let observer;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(node);
      if (node.firstElementChild) observer.observe(node.firstElementChild);
    }

    return () => {
      node.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (observer) observer.disconnect();
    };
  }, []);

  return { scrollRef, edges, stickyWidth, scrollbarHeight };
};

// The scroll box plus the two edge cues. The cues live outside the scroller (in
// the `frame`, which does not scroll) so they stay pinned to the visible edge
// instead of travelling with the table, and are `pointer-events: none` so they
// never swallow a click on the cell underneath.
//
// `is-scrolled` tells the stylesheet the table is no longer at its left edge:
// the table's own left border has scrolled out of view by then, so the pinned
// column has to draw its own.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- `role="region"` plus
   `tabIndex={0}` is the blessed pattern for a scrollable region (it is what
   makes the box scrollable with the keyboard); the rule only knows about
   interactive roles and flags the very thing that makes it reachable. */
const TableScrollFrame = ({ label, children }) => {
  const { scrollRef, edges, stickyWidth, scrollbarHeight } = useEdgeCue();

  return (
    <div
      className={`msfd-table-frame${edges.start ? ' is-scrolled' : ''}`}
      style={{
        '--msfd-sticky-width': `${stickyWidth}px`,
        '--msfd-scrollbar-height': `${scrollbarHeight}px`,
      }}
    >
      <div
        className="msfd-table-scroll"
        ref={scrollRef}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
      <span
        className={`msfd-table-cue is-left${edges.start ? ' is-visible' : ''}`}
        aria-hidden="true"
      />
      <span
        className={`msfd-table-cue is-right${edges.end ? ' is-visible' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
};

/* eslint-enable jsx-a11y/no-noninteractive-tabindex */

const SCROLL_LABEL = 'Results table, scrollable horizontally';

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

              <TableScrollFrame label={SCROLL_LABEL}>
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
              </TableScrollFrame>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <TableScrollFrame label={SCROLL_LABEL}>
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
    </TableScrollFrame>
  );
};

export default ExplorerTable;
