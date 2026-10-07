import React from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';

import { ARTICLE4_CYCLES, MSFD_ARTICLES } from '../constants';

// The explorer sidebar: the reporting cycle selector and the MSFD Articles
// navigation. The article list switches the block's article (falling back to
// the legacy explorer for articles without a React renderer), the cycle only
// affects Article 4.
//
// The articles list is collapsed by default to keep the sidebar compact. When
// expanded it is positioned absolutely (see styles.less) so it overlays the
// content below instead of growing the surrounding grid row.
const Sidebar = ({ article, cycle, onSelectArticle, onSelectCycle }) => {
  const [articlesOpen, setArticlesOpen] = React.useState(false);
  const activeArticle = MSFD_ARTICLES.find((item) => item.slug === article);

  return (
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

      <nav
        className={`msfd-sidebar-block msfd-sidebar-articles ${
          articlesOpen ? 'is-open' : ''
        }`}
      >
        <span className="msfd-sidebar-heading">MSFD Articles</span>
        <button
          type="button"
          className="msfd-articles-current msfd-sidebar-heading msfd-sidebar-toggle"
          aria-expanded={articlesOpen}
          aria-controls="msfd-articles-list"
          onClick={() => setArticlesOpen((open) => !open)}
        >
          <span className="msfd-sidebar-toggle-text">
            {activeArticle
              ? `Article ${activeArticle.number} — ${activeArticle.label}`
              : 'Select an article'}
          </span>
          <Icon name={articlesOpen ? 'caret up' : 'caret down'} />
        </button>

        {articlesOpen ? (
          <ul id="msfd-articles-list" className="msfd-articles-list">
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
                    onClick={() => {
                      onSelectArticle(item.slug);
                      setArticlesOpen(false);
                    }}
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
        ) : null}
      </nav>
    </aside>
  );
};

export default Sidebar;
