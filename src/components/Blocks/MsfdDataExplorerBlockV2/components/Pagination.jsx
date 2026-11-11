import React from 'react';
import { Icon } from 'semantic-ui-react';

const WINDOW_SIZE = 5;
const MAX_NUMBERS = 7;

// Builds the list of page indexes to render. With many pages it shows a window
// of WINDOW_SIZE consecutive pages around the current one, plus the first and
// last page with ellipses, e.g. 1 2 3 4 5 … 53.
const buildPages = (current, pageCount) => {
  if (pageCount <= MAX_NUMBERS) {
    return Array.from({ length: pageCount }, (unused, index) => index);
  }

  const half = Math.floor(WINDOW_SIZE / 2);
  const start = Math.max(0, Math.min(current - half, pageCount - WINDOW_SIZE));
  const end = start + WINDOW_SIZE - 1;
  const pages = [];

  if (start > 0) {
    pages.push(0);

    if (start > 1) pages.push('gap');
  }

  for (let index = start; index <= end; index += 1) pages.push(index);

  if (end < pageCount - 1) {
    if (end < pageCount - 2) pages.push('gap');

    pages.push(pageCount - 1);
  }

  return pages;
};

// Result pager: "Showing x - y of z results" on the left, numbered pages and
// prev/next controls on the right, matching the WISE Marine mockup.
const Pagination = ({ pagination, onPage, position }) => {
  if (!pagination || pagination.pageCount <= 1) return null;

  const { page, pageCount, pageSize, total } = pagination;
  const start = page * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);

  return (
    <div className={`msfd-pagination msfd-pagination-${position}`}>
      <span className="msfd-pagination-info">
        Showing <b>{start}</b> - <b>{end}</b> of <b>{total}</b> results
      </span>

      <nav className="msfd-pagination-pages" aria-label="Pagination">
        <button
          type="button"
          className="msfd-page"
          aria-label="Previous page"
          disabled={page <= 0}
          onClick={() => onPage(page - 1)}
        >
          <Icon name="chevron left" />
        </button>

        {buildPages(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <span className="msfd-page-gap" key={`gap-${index}`}>
              …
            </span>
          ) : (
            <button
              type="button"
              key={item}
              className={`msfd-page ${item === page ? 'is-active' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPage(item)}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          className="msfd-page"
          aria-label="Next page"
          disabled={page >= pageCount - 1}
          onClick={() => onPage(page + 1)}
        >
          <Icon name="chevron right" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
