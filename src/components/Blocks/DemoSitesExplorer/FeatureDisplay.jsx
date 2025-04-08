import React from 'react';
import { isValidURL } from './utils';

export default function FeatureDisplay({ feature }) {
  return feature ? (
    <div id="csepopup">
      <h3>
        <strong>
          <a target="_blank" rel="noopener noreferrer" href={feature.path}>
            {feature.title}
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
          <span>{feature.project}</span>
        </div>
      ) : (
        ''
      )}

      {feature.project_link ? (
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
      )}

      {/* <div>
        <h4>NWRMs implemented</h4>
        <ul>
          {feature.nwrms_implemented.map((item, index) => {
            return (
              <li key={index}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={item['path']}
                >
                  {item['title']}
                </a>
              </li>
            );
          })}
        </ul>
      </div> */}
      {/* <div>
        <h4>Sectors </h4>
        <ul>
          {feature.sectors.map((item, index) => {
            return <li key={index}>{item}</li>;
          })}
        </ul>
      </div> */}
    </div>
  ) : null;
}
