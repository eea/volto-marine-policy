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

// Pinning is a per-table choice (nothing is pinned by default). `pinState`
// carries the pinned columns in column order, because the pinned strip is
// stacked in that order no matter which order the user pinned them in.
const columnStyle = (column) => ({
  minWidth: `${columnMinWidth(column)}px`,
});

// A pinned column is drawn once, as a leading cell of the row: it is moved out
// of its place in the column list and glued to the left edge of the scroll box.
// The leading pinned cells stack, so each one starts where the pinned column
// before it ends: the offsets are measured from the pinned headers and published
// on the frame (see useEdgeCue), which lets a cell know its own position in the
// strip without knowing its neighbours.
const pinCellStyle = (column, pinIndex) => ({
  minWidth: `${columnMinWidth(column)}px`,
  left: `var(--msfd-pin-offset-${pinIndex}, 0px)`,
});

const pinCellClassName = (column, pinIndex, pinCount) =>
  [
    'msfd-pinned',
    column.align === 'right' ? 'is-right' : '',
    pinIndex === 0 ? 'is-pinned-first' : '',
    pinIndex === pinCount - 1 ? 'is-pinned-last' : '',
  ]
    .filter(Boolean)
    .join(' ');

const cellClassName = (column) => (column.align === 'right' ? 'is-right' : '');

// Renders the pinned cells that lead the row: one per pinned column, in column
// order. They are the only rendering of those columns (see renderDataRow).
const renderPinnedCells = (row, key, pinState, isExpanded, onToggleCell) =>
  pinState.columns.map((column, pinIndex) => (
    <td
      key={column.key}
      className={pinCellClassName(column, pinIndex, pinState.count)}
      style={pinCellStyle(column, pinIndex)}
    >
      {renderDataCell(
        row,
        column,
        `${key}:${column.key}`,
        isExpanded,
        onToggleCell,
      )}
    </td>
  ));

// The columns that are still in their original place: a pinned column lives in
// the pinned strip instead, so it must not be drawn a second time here.
const unpinnedColumns = (columns, pinState) =>
  columns.filter((column) => pinState.index[column.key] === undefined);

// Renders one data row. `key` is passed in because grouped rows need a stable
// key per group (the row index alone is not unique across groups).
const renderDataRow = (
  row,
  key,
  columns,
  onView,
  pinState,
  isExpanded,
  onToggleCell,
) => (
  <tr key={key}>
    {renderPinnedCells(row, key, pinState, isExpanded, onToggleCell)}
    {unpinnedColumns(columns, pinState).map((column) => (
      <td
        key={column.key}
        className={cellClassName(column)}
        style={columnStyle(column)}
      >
        {renderDataCell(
          row,
          column,
          `${key}:${column.key}`,
          isExpanded,
          onToggleCell,
        )}
      </td>
    ))}
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

// The label of a header cell: a sort control when the column is sortable, a
// plain label otherwise. Shared by the pinned headers and the ones in place.
const renderHeaderLabel = (column, sort, dir, onSort) =>
  column.sortable ? (
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
    <span className="msfd-table-head-label">{column.label}</span>
  );

// Column header cells, shared by the flat table and each per-group table. The
// pinned columns come first, moved out of their original place and stuck to the
// left edge of the scroll box; the rest follow in their own order. Every header
// carries a pin checkbox: ticking it pins the column, unticking it sends the
// column back to its place.
const renderHeaderCells = (columns, sort, dir, onSort, pinState) => (
  <>
    {pinState.columns.map((column, pinIndex) => (
      <th
        key={column.key}
        className={pinCellClassName(column, pinIndex, pinState.count)}
        style={pinCellStyle(column, pinIndex)}
      >
        <div className="msfd-table-head">
          {renderHeaderLabel(column, sort, dir, onSort)}
          <label className="msfd-table-pin" title="Unpin column">
            <input
              type="checkbox"
              className="msfd-table-pin-input"
              checked
              aria-label={`Unpin column ${column.label}`}
              onChange={() => pinState.onToggle(column.key)}
            />
          </label>
        </div>
      </th>
    ))}
    {unpinnedColumns(columns, pinState).map((column) => (
      <th
        key={column.key}
        className={cellClassName(column)}
        style={columnStyle(column)}
      >
        <div className="msfd-table-head">
          {renderHeaderLabel(column, sort, dir, onSort)}
          <label className="msfd-table-pin" title="Pin column">
            <input
              type="checkbox"
              className="msfd-table-pin-input"
              checked={false}
              aria-label={`Pin column ${column.label}`}
              onChange={() => pinState.onToggle(column.key)}
            />
          </label>
        </div>
      </th>
    ))}
    {/* <th className="msfd-table-action-col">Action</th> */}
  </>
);

// `useLayoutEffect` warns when a block is rendered on the server (Volto renders
// for the first paint), so fall back to `useEffect` where there is no DOM.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// Tracks whether the horizontally scrolling box has content hidden past either
// edge, so the edge cues are only painted when there is actually something to
// scroll to. The table can change width without the box changing size (columns
// are sized from their content), hence the observer on the first child too.
//
// It also measures the pinned columns: their widths are published on the frame
// as `--msfd-pin-offset-<n>` so each pinned cell knows where to stop (any column
// can be pinned, so the run of sticky cells is not known up front), and their
// total width is what the left cue is anchored to. The shadow has to read as the
// pinned columns casting it over the cells sliding underneath, not as a shadow
// at the edge of the table. The height of the horizontal scrollbar is measured
// for the same reason on the other axis: the cues stop above the bar rather than
// run over it.
const useEdgeCue = () => {
  const frameRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });
  const [stickyWidth, setStickyWidth] = React.useState(0);
  const [scrollbarHeight, setScrollbarHeight] = React.useState(0);
  const edgesRef = React.useRef(edges);
  const publishedPins = React.useRef(0);
  const updateRef = React.useRef(null);

  React.useEffect(() => {
    const node = scrollRef.current;
    const frame = frameRef.current;

    if (!node || !frame) return undefined;

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

      // Stack the pinned headers from the left edge: each one starts where the
      // previous one ends. Offsets beyond the current run are removed so a
      // column pinned later cannot inherit a stale position.
      const heads = node.querySelectorAll('th.msfd-pinned');
      let offset = 0;

      heads.forEach((head, index) => {
        frame.style.setProperty(`--msfd-pin-offset-${index}`, `${offset}px`);
        offset += head.offsetWidth;
      });

      for (
        let index = heads.length;
        index < publishedPins.current;
        index += 1
      ) {
        frame.style.removeProperty(`--msfd-pin-offset-${index}`);
      }

      publishedPins.current = heads.length;
      setStickyWidth(offset);
      // `clientHeight` is the box without its horizontal scrollbar, so the
      // difference is the bar (0 when the browser uses overlay scrollbars).
      setScrollbarHeight(node.offsetHeight - node.clientHeight);
    };

    updateRef.current = update;
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

  // Pinning or unpinning changes which headers are sticky without necessarily
  // resizing the table, so re-measure after every render (before paint, so the
  // cells never read the previous run's offsets).
  useIsomorphicLayoutEffect(() => {
    if (updateRef.current) updateRef.current();
  });

  return { frameRef, scrollRef, edges, stickyWidth, scrollbarHeight };
};

// Unpins everything with one click, putting the columns back in their original
// order. It sits above the table (not in a header cell, which lives in the
// horizontally scrolling box) and is only rendered while something is pinned.
const PinClearBar = ({ count, onClear }) =>
  count > 0 ? (
    <div className="msfd-pin-bar">
      <span className="msfd-pin-bar-count">
        {count} pinned {count === 1 ? 'column' : 'columns'}
      </span>
      <button
        type="button"
        className="msfd-pin-clear"
        title="Unpin all columns"
        aria-label="Unpin all columns"
        onClick={onClear}
      >
        <Icon name="close" />
      </button>
    </div>
  ) : null;

// One-off coach mark above the table pointing at the pin checkboxes. It lives in
// the frame rather than in a header cell because the header sits inside the
// horizontally scrolling box, which would clip anything drawn above it.
const PinHint = ({ onDismiss }) => (
  <div className="msfd-pin-hint">
    <Icon name="info circle" />
    <p className="msfd-pin-hint-text">
      You can pin a column by clicking the checkbox in its header, so it stays
      on screen while the rest of the table scrolls.
    </p>
    <button
      type="button"
      className="msfd-pin-hint-close"
      aria-label="Dismiss the column pinning hint"
      onClick={onDismiss}
    >
      <Icon name="close" />
    </button>
  </div>
);

// The scroll box plus the two edge cues. The cues live outside the scroller (in
// the `frame`, which does not scroll) so they stay pinned to the visible edge
// instead of travelling with the table, and are `pointer-events: none` so they
// never swallow a click on the cell underneath.
//
// `is-scrolled` tells the stylesheet the table is no longer at its left edge:
// the table's own left border has scrolled out of view by then, so the pinned
// columns have to draw their own edges.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- `role="region"` plus
   `tabIndex={0}` is the blessed pattern for a scrollable region (it is what
   makes the box scrollable with the keyboard); the rule only knows about
   interactive roles and flags the very thing that makes it reachable. */
const TableScrollFrame = ({
  label,
  children,
  showPinHint,
  onDismissPinHint,
}) => {
  const { frameRef, scrollRef, edges, stickyWidth, scrollbarHeight } =
    useEdgeCue();

  return (
    <div
      ref={frameRef}
      className={`msfd-table-frame${edges.start ? ' is-scrolled' : ''}${
        showPinHint ? ' is-hinting' : ''
      }`}
      style={{
        '--msfd-sticky-width': `${stickyWidth}px`,
        '--msfd-scrollbar-height': `${scrollbarHeight}px`,
      }}
    >
      {showPinHint && <PinHint onDismiss={onDismissPinHint} />}
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
//
// Any column can be pinned to the left edge from its header checkbox. Nothing is
// pinned by default, and the choice is shared by all the per-group tables (they
// show the same columns).
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
  const [pinnedKeys, setPinnedKeys] = React.useState([]);
  const [pinHint, setPinHint] = React.useState(true);

  const toggleCell = React.useCallback((key) => {
    setExpandedCells((previous) => ({ ...previous, [key]: !previous[key] }));
  }, []);

  const isExpanded = React.useCallback(
    (key) => Boolean(expandedCells[key]),
    [expandedCells],
  );

  // Pinning a column doubles as "I got the hint", so the coach mark goes away.
  const togglePin = React.useCallback((key) => {
    setPinnedKeys((previous) =>
      previous.indexOf(key) === -1
        ? [...previous, key]
        : previous.filter((item) => item !== key),
    );
    setPinHint(false);
  }, []);

  const dismissPinHint = React.useCallback(() => setPinHint(false), []);

  // One click puts every column back where it was.
  const clearPins = React.useCallback(() => setPinnedKeys([]), []);

  if (!columns || !columns.length) return null;

  const isGrouped = Boolean(groupBy && groups && groups.length);

  // Pinned columns are stacked in visual column order, whatever order they were
  // pinned in (and columns that are no longer in the table are ignored).
  const pinnedColumns = columns.filter(
    (column) => pinnedKeys.indexOf(column.key) !== -1,
  );
  const pinState = {
    columns: pinnedColumns,
    count: pinnedColumns.length,
    index: pinnedColumns.reduce(
      (map, column, index) => ({ ...map, [column.key]: index }),
      {},
    ),
    onToggle: togglePin,
    onClear: clearPins,
  };

  if (isGrouped) {
    const buckets = bucketRows(rows, groupBy);

    return (
      <>
        <PinClearBar count={pinState.count} onClear={pinState.onClear} />
        <div className="msfd-table-groups">
          {groups.map((group, groupIndex) => {
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

                <TableScrollFrame
                  label={SCROLL_LABEL}
                  showPinHint={pinHint && groupIndex === 0}
                  onDismissPinHint={dismissPinHint}
                >
                  <table className="msfd-table">
                    <thead>
                      <tr>
                        {renderHeaderCells(
                          columns,
                          sort,
                          dir,
                          onSort,
                          pinState,
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {groupRows.map((row, index) =>
                        renderDataRow(
                          row,
                          `row-${group.key}-${index}`,
                          columns,
                          onView,
                          pinState,
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
      </>
    );
  }

  return (
    <>
      <PinClearBar count={pinState.count} onClear={pinState.onClear} />
      <TableScrollFrame
        label={SCROLL_LABEL}
        showPinHint={pinHint}
        onDismissPinHint={dismissPinHint}
      >
        <table className="msfd-table">
          <thead>
            <tr>{renderHeaderCells(columns, sort, dir, onSort, pinState)}</tr>
          </thead>
          <tbody>
            {(rows || []).map((row, index) =>
              renderDataRow(
                row,
                `row-${index}`,
                columns,
                onView,
                pinState,
                isExpanded,
                toggleCell,
              ),
            )}
          </tbody>
        </table>
      </TableScrollFrame>
    </>
  );
};

export default ExplorerTable;
