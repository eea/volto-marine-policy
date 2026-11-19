import React, { memo } from 'react';
import cx from 'classnames';
import Image from '@plone/volto/components/theme/Image/Image';

import {
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_GROUP_BACKGROUND,
  getCardLink,
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

// A card with a `url` becomes one link: the whole surface is clickable and
// focusable, so the target never depends on hitting the title. In edit mode the
// navigation is swallowed, otherwise clicking the card would leave the editor
// instead of selecting the block.
const DescriptorCard = ({ card, mode }) => {
  const background = card.background_color || DEFAULT_CARD_BACKGROUND;
  const inverted = isDarkColor(background);
  const link = getCardLink(card.url);

  const className = cx('factsheet-descriptor-card', {
    'factsheet-card-dark': inverted,
    'factsheet-descriptor-card--link': !!link,
  });
  const style = {
    backgroundColor: background,
    color: getTextColor(background),
  };

  const content = (
    <>
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
    </>
  );

  if (!link) {
    return (
      <article className={className} style={style}>
        {content}
      </article>
    );
  }

  return (
    <a
      className={className}
      style={style}
      href={link.href}
      {...(link.external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      {...(mode === 'edit'
        ? {
            onClick: (event) => event.preventDefault(),
            'aria-disabled': true,
          }
        : {})}
    >
      {content}
    </a>
  );
};

// One grid per group, so a group always starts on a new row and the main card
// occupies its first cell (see styles.less for the responsive column count).
const Group = ({ group, index, mode }) => (
  <div className="factsheet-descriptors-group" data-group-index={index}>
    <GroupCard group={group} />
    {(group.cards || []).map((card, cardIndex) => (
      <DescriptorCard
        key={card['@id'] || `card-${index}-${cardIndex}`}
        card={card}
        mode={mode}
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
          mode={mode}
        />
      ))}
    </div>
  );
}, propsAreEqual);

export default View;
