import React from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';

import { ARTICLE4_CYCLES, MSFD_ARTICLES } from '../constants';

// The explorer sidebar: the reporting cycle selector and the MSFD Articles
// navigation. The article list switches the block's article (falling back to
// the legacy explorer for articles without a React renderer), the cycle only
// affects Article 4.
const Sidebar = ({ article, cycle, onSelectArticle, onSelectCycle }) => (
  <aside className="msfd-sidebar">
    <div className="msfd-sidebar-block">
      <h3 className="msfd-sidebar-heading">Reporting cycle</h3>
      <Dropdown
        selection
        fluid
        className="msfd-cycle-dropdown"
        options={ARTICLE4_CYCLES}
        value={cycle}
        onChange={(event, data) => onSelectCycle(data.value)}
      />
    </div>

    <nav className="msfd-sidebar-block msfd-sidebar-articles">
      <h3 className="msfd-sidebar-heading">MSFD Articles</h3>

      <ul className="msfd-articles-list">
        {MSFD_ARTICLES.map((item) => {
          const active = item.slug === article;

          return (
            <li
              key={item.slug}
              className={`msfd-articles-item ${active ? 'is-active' : ''}`}
            >
              <button
                type="button"
                className="msfd-articles-link"
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelectArticle(item.slug)}
              >
                <Icon name={active ? 'caret down' : 'caret right'} />
                <span className="msfd-articles-number">
                  Article {item.number}
                </span>
                <span className="msfd-articles-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
