import React, { memo } from 'react';
import cx from 'classnames';
import Image from '@plone/volto/components/theme/Image/Image';

import {
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_GROUP_BACKGROUND,
  getIconAlt,
  getIconURL,
  getTextColor,
  hasSlateContent,
  isDarkColor,
  renderSlate,
  renderSlateInline,
} from './helpers';

import './styles.less';

// A card is a coloured surface: the text colour follows from the background so
// the editor never has to pick a second colour (see helpers/getTextColor), and
// on a dark surface the monochrome SVG icon is inverted so its baked-in navy
// stroke stays visible.
const Icon = ({ icon, inverted, className }) => {
  const url = getIconURL(icon);
  if (!url) return null;
  return (
    <Image
      className={cx(className, { 'factsheet-icon-inverted': inverted })}
      src={url}
      alt={getIconAlt(icon)}
    />
  );
};

const GroupCard = ({ group }) => {
  const background = group.background_color || DEFAULT_GROUP_BACKGROUND;
  const inverted = isDarkColor(background);

  return (
    <article
      className={cx('factsheet-descriptor-main', {
        'factsheet-card-dark': inverted,
      })}
      style={{
        backgroundColor: background,
        color: getTextColor(background),
      }}
    >
      <Icon
        icon={group.icon}
        inverted={inverted}
        className="factsheet-descriptor-icon"
      />
      {hasSlateContent(group.title) && (
        <h3 className="factsheet-descriptor-main-title">
          {renderSlateInline(group.title)}
        </h3>
      )}
      {hasSlateContent(group.description) && (
        <div className="factsheet-descriptor-main-description slate">
          {renderSlate(group.description)}
        </div>
      )}
    </article>
  );
};

const DescriptorCard = ({ card }) => {
  const background = card.background_color || DEFAULT_CARD_BACKGROUND;
  const inverted = isDarkColor(background);

  return (
    <article
      className={cx('factsheet-descriptor-card', {
        'factsheet-card-dark': inverted,
      })}
      style={{
        backgroundColor: background,
        color: getTextColor(background),
      }}
    >
      <Icon
        icon={card.icon}
        inverted={inverted}
        className="factsheet-descriptor-icon"
      />
      {hasSlateContent(card.title) && (
        <h4 className="factsheet-descriptor-title">
          {renderSlateInline(card.title)}
        </h4>
      )}
      {hasSlateContent(card.text) && (
        <div className="factsheet-descriptor-text slate">
          {renderSlate(card.text)}
        </div>
      )}
      {hasSlateContent(card.info) && (
        <div className="factsheet-descriptor-info slate">
          {renderSlate(card.info)}
        </div>
      )}
    </article>
  );
};

// One grid per group, so a group always starts on a new row and the main card
// occupies its first cell (see styles.less for the responsive column count).
const Group = ({ group, index }) => (
  <div className="factsheet-descriptors-group" data-group-index={index}>
    <GroupCard group={group} />
    {(group.cards || []).map((card, cardIndex) => (
      <DescriptorCard
        key={card['@id'] || `card-${index}-${cardIndex}`}
        card={card}
      />
    ))}
  </div>
);

const propsAreEqual = (prevProps, nextProps) =>
  prevProps.data === nextProps.data && prevProps.mode === nextProps.mode;

const View = memo(({ data = {}, mode }) => {
  const groups = data.groups || [];

  if (!groups.length) {
    return mode === 'edit' ? (
      <div className="factsheet-descriptors-block">
        <p className="factsheet-descriptors-empty">Add a descriptor group.</p>
      </div>
    ) : null;
  }

  return (
    <div className="factsheet-descriptors-block">
      {groups.map((group, index) => (
        <Group
          key={group['@id'] || `group-${index}`}
          group={group}
          index={index}
        />
      ))}
    </div>
  );
}, propsAreEqual);

export default View;
