import React from 'react';
import { isValidURL, truncateText } from './utils';

export default function FeatureDisplay({ feature }) {
  return feature ? (
    <div id="csepopup">
      <h3>
        <strong>
          <a target="_blank" rel="noopener noreferrer" href={feature.path}>
            {truncateText(feature.title)}
          </a>
        </strong>
      </h3>
      {feature.info ? (
        <div>
          <span className="popup-title blue">Info: </span>
          <span>
            {isValidURL(feature.info) ? (
              <a href={feature.info} target="_blank" rel="noopener noreferrer">
                {feature.info}
              </a>
            ) : (
              <span>{feature.info}</span>
            )}
          </span>
        </div>
      ) : (
        ''
      )}

      {feature.country ? (
        <div>
          <span className="popup-title blue">Country: </span>
          <span>{feature.country}</span>
        </div>
      ) : (
        ''
      )}
      {feature.project ? (
        <div>
          <span className="popup-title blue">Project: </span>
          <span>
            {isValidURL(feature.project_link) ? (
              <a
                href={feature.project_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {feature.project}
              </a>
            ) : (
              <span>{feature.project}</span>
            )}
          </span>
        </div>
      ) : (
        ''
      )}

      {/* {feature.project_link ? (
        <div>
          <span className="popup-title blue">Project link: </span>
          <span>
            {isValidURL(feature.project_link) ? (
              <a
                href={feature.project_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {feature.project_link}
              </a>
            ) : (
              <span>{feature.project_link}</span>
            )}
          </span>
        </div>
      ) : (
        ''
      )} */}

      {feature.indicators.length > 0 ? (
        <div>
          <span className="popup-title blue">Indicators</span>
          <ul>
            {feature.indicators.map((item, index) => {
              return (
                <li key={index}>
                  <span
                  // target="_blank"
                  // rel="noopener noreferrer"
                  // href={item['path']}
                  >
                    {item['title']}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        ''
      )}
      {/* <div>
        <h4>Indicators</h4>
        <ul>
          {feature.sectors.map((item, index) => {
            return <li key={index}>{item}</li>;
          })}
        </ul>
      </div> */}
    </div>
  ) : null;
}
