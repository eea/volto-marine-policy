import React from 'react';
import { centerAndResetMapZoom, zoomMapToFeatures, isValidURL } from './utils';

const showPageNr = (pageNr, currentPage, numberOfPages) => {
  // show first 5 pages
  if (currentPage < 4 && pageNr <= 5) {
    return true;
  }

  // show last 5 pages
  if (numberOfPages - currentPage < 4 && numberOfPages - pageNr < 5) {
    return true;
  }

  if (
    currentPage >= 4 &&
    numberOfPages - currentPage >= 4 &&
    pageNr >= currentPage - 2 &&
    pageNr <= currentPage + 2
  ) {
    return true;
  }

  return false;
};

export default function DemoSitesList(props) {
  const { selectedCase, onSelectedCase, pointsSource, map } = props;
  // const reSearch = new RegExp(`\\b(${searchInput})\\b`, 'gi');
  const [currentPage, setCurrentPage] = React.useState(1);

  const features = pointsSource
    .getFeatures(selectedCase)
    .sort((item1, item2) =>
      item1.values_.title.localeCompare(item2.values_.title),
    );
  const numberOfPages = Math.ceil(features.length / 10);

  const displayFatures = features.slice(
    10 * (currentPage - 1),
    10 * currentPage,
  );

  return displayFatures.length === 0 ? (
    <>
      <h3 style={{ margin: 'calc(2rem - 0.1em) 0 1rem' }}>
        We could not find any results for your search criteria
      </h3>
      <ul>
        <li>check the selected filters</li>
      </ul>
    </>
  ) : (
    <>
      <div className="listing">
        {selectedCase ? (
          <div
            className="content-box u-item listing-item result-item"
            style={{
              marginTop: '2em',
              padding: 'em',
              // border: '3px solid #f2f2f2',
              // borderTop: '1em solid #f2f2f2',
              paddingTop: 0,
              backgroundColor: '#f2f2f2',
              border: 'none',
            }}
          >
            <div className="slot-top">
              <div className="listing-body">
                <h3 className="listing-header">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={selectedCase.path}
                    title={selectedCase.title}
                  >
                    {selectedCase.title}
                  </a>
                </h3>
                <p className="listing-description">
                  {selectedCase.description}
                </p>
                <div className="slot-bottom">
                  <div className="result-bottom">
                    {selectedCase.info ? (
                      <div className="result-info">
                        <span className="result-info-title">Info: </span>
                        <span>
                          {isValidURL(selectedCase.info) ? (
                            <a
                              href={selectedCase.info}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedCase.info}
                            </a>
                          ) : (
                            <span>{selectedCase.info}</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      ''
                    )}

                    {selectedCase.project ? (
                      <div className="result-info">
                        <span className="result-info-title">Project: </span>
                        <span>{selectedCase.project}</span>
                      </div>
                    ) : (
                      ''
                    )}

                    {selectedCase.country ? (
                      <div className="result-info">
                        <span className="result-info-title">Country: </span>
                        <span>{selectedCase.country}</span>
                      </div>
                    ) : (
                      ''
                    )}

                    {selectedCase.project_link ? (
                      <div className="result-info">
                        <span className="result-info-title">
                          Project link:{' '}
                        </span>
                        <span>
                          {isValidURL(selectedCase.project_link) ? (
                            <a
                              href={selectedCase.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedCase.project_link}
                            </a>
                          ) : (
                            <span>{selectedCase.project_link}</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      ''
                    )}

                    <div
                      className="result-info show-on-map"
                      tabIndex="0"
                      role="button"
                      onKeyDown={() => {}}
                      onClick={() => {
                        // scroll to the map
                        // scrollToElement('search-input');
                        // reset map zoom
                        onSelectedCase(null);
                        centerAndResetMapZoom(map);
                        map.getInteractions().array_[9].getFeatures().clear();
                      }}
                    >
                      <span className="result-info-title">Reset map</span>
                      <i className="icon ri-map-2-line"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          displayFatures.map((item, index) => {
            return (
              <div className="u-item listing-item result-item" key={index}>
                <div className="slot-top">
                  <div className="listing-body">
                    <h3 className="listing-header">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={item.values_.path}
                        title={item.values_.title}
                      >
                        {item.values_.title}
                      </a>
                    </h3>
                    {/* <p
                      className="listing-description"
                      dangerouslySetInnerHTML={{
                        __html: searchInput
                          ? item.values_.description.replaceAll(
                              reSearch,
                              '<b>$1</b>',
                            )
                          : item.values_.description,
                      }}
                    ></p> */}
                    <div className="slot-bottom">
                      <div className="result-bottom">
                        {item.values_.info ? (
                          <div className="result-info">
                            <span className="result-info-title">Info: </span>
                            <span>
                              {isValidURL(item.values_.info) ? (
                                <a
                                  href={item.values_.info}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {item.values_.info}
                                </a>
                              ) : (
                                <span>{item.values_.info}</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          ''
                        )}

                        {item.values_.project ? (
                          <div className="result-info">
                            <span className="result-info-title">Project: </span>
                            <span>{item.values_.project}</span>
                          </div>
                        ) : (
                          ''
                        )}

                        {item.values_.country ? (
                          <div className="result-info">
                            <span className="result-info-title">Country: </span>
                            <span>{item.values_.country}</span>
                          </div>
                        ) : (
                          ''
                        )}

                        {item.values_.project_link ? (
                          <div className="result-info">
                            <span className="result-info-title">
                              Project link:{' '}
                            </span>
                            <span>
                              {isValidURL(item.values_.project_link) ? (
                                <a
                                  href={item.values_.project_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {item.values_.project_link}
                                </a>
                              ) : (
                                <span>{item.values_.project_link}</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          ''
                        )}

                        <div
                          className="result-info show-on-map"
                          tabIndex="0"
                          role="button"
                          onKeyDown={() => {}}
                          onClick={() => {
                            map
                              .getInteractions()
                              .array_[9].getFeatures()
                              .clear();
                            // scroll to the map
                            // scrollToElement('ol-map-container');

                            // zoomMapToFeatures(map, [item], 5000);
                            onSelectedCase(item.values_);

                            const popupOverlay =
                              document.getElementById('popup-overlay');
                            popupOverlay.style.visibility = 'visible';

                            setTimeout(() => {
                              const coords =
                                item.values_.geometry.flatCoordinates;
                              const pixel = map.getPixelFromCoordinate(coords);
                              map
                                .getInteractions()
                                .array_[9].getFeatures()
                                .push(map.getFeaturesAtPixel(pixel)[0]);
                            }, 1100);
                          }}
                        >
                          <span className="result-info-title">Show on map</span>
                          <i className="icon ri-road-map-line"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {!selectedCase ? (
        <div className="search-body-footer">
          <div className="ui centered grid">
            <div className="center aligned column">
              <div className="prev-next-paging">
                <div className="paging-wrapper">
                  {currentPage !== 1 ? (
                    <button
                      className="ui button prev double-angle"
                      onClick={() => {
                        setCurrentPage(1);
                      }}
                    ></button>
                  ) : (
                    ''
                  )}
                  {currentPage !== 1 ? (
                    <button
                      className="ui button prev single-angle"
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                      }}
                    ></button>
                  ) : (
                    ''
                  )}
                  {Array.from(Array(numberOfPages).keys()).map((index) => {
                    const pageNr = index + 1;
                    return showPageNr(pageNr, currentPage, numberOfPages) ? (
                      <button
                        className={
                          'ui button pagination-item' +
                          (currentPage === pageNr ? ' active' : '')
                        }
                        onClick={() => {
                          setCurrentPage(pageNr);
                        }}
                      >
                        {pageNr}
                      </button>
                    ) : (
                      ''
                    );
                  })}
                  {currentPage !== numberOfPages ? (
                    <button
                      className="ui button next single-angle"
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                      }}
                    ></button>
                  ) : (
                    ''
                  )}
                  {currentPage !== numberOfPages ? (
                    <button
                      className="ui button next double-angle"
                      onClick={() => {
                        setCurrentPage(numberOfPages);
                      }}
                    ></button>
                  ) : (
                    ''
                  )}{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  );
}
