import React from 'react';

// One page equals one country, mirroring the legacy explorer.
const Pagination = ({ pagination, onPage, position }) => {
  if (!pagination || !pagination.pageCount) return null;

  const { page, pageCount } = pagination;

  return (
    <div
      className={`prev-next-row prev-next-row-${position} msfd-pagination-${position}`}
    >
      {page > 0 ? (
        <div className="form-buttons-prev-row">
          <button
            type="button"
            className="form-buttons-prev pagination-prev btn btn-xs btn-default"
            aria-label="Previous result"
            onClick={() => onPage(page - 1)}
          />
        </div>
      ) : null}

      {pageCount > 1 ? (
        <span className="pagination-text bottom">
          Result <span>{page + 1}</span> of <span>{pageCount}</span>
        </span>
      ) : null}

      {page < pageCount - 1 ? (
        <div className="form-buttons-next-row">
          <button
            type="button"
            className="form-buttons-next pagination-next btn btn-xs btn-default"
            aria-label="Next result"
            onClick={() => onPage(page + 1)}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Pagination;
