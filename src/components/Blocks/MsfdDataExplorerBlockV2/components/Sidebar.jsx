import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dropdown, Icon } from 'semantic-ui-react';

import { getPeriodConfig, MSFD_ARTICLES, articlePageHref } from '../constants';

// The explorer sidebar: the reporting cycle/period control and the MSFD
// Articles navigation. Each article lives on its own page, so the article list
// is a set of links to sibling pages (the page is authored separately with its
// own block config); the period control is per-article (see PERIOD_CONFIG).
//
// The articles list is collapsed by default to keep the sidebar compact. When
// expanded it is positioned absolutely (see styles.less) so it overlays the
// content below instead of growing the surrounding grid row.
const Sidebar = ({ article, cycle, onSelectCycle }) => {
  const [articlesOpen, setArticlesOpen] = React.useState(false);
  const location = useLocation();
  const activeArticle = MSFD_ARTICLES.find((item) => item.slug === article);
  const period = getPeriodConfig(article);

  return (
    <aside className="msfd-sidebar">
      <div className="msfd-sidebar-block">
        <h3 className="msfd-sidebar-heading">{period.heading}</h3>
        {period.static ? (
          <p className="msfd-period-static">{period.static}</p>
        ) : (
          <Dropdown
            selection
            fluid
            className="msfd-cycle-dropdown"
            options={period.options}
            value={cycle}
            onChange={(event, data) => onSelectCycle(data.value)}
          />
        )}
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
              ? `Article ${activeArticle.number} - ${activeArticle.label}`
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
                  <Link
                    className="msfd-articles-link"
                    to={articlePageHref(location.pathname, item.page)}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setArticlesOpen(false)}
                  >
                    <Icon name={active ? 'caret down' : 'caret right'} />
                    <span className="msfd-articles-number">
                      Article {item.number}
                    </span>
                    <span className="msfd-articles-label">{item.label}</span>
                  </Link>
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
