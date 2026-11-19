import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Button } from 'semantic-ui-react';
import ImageWidget from '@plone/volto/components/manage/Widgets/ImageWidget';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import clearSVG from '@plone/volto/icons/clear.svg';

const messages = defineMessages({
  removeIcon: {
    id: 'Remove icon',
    defaultMessage: 'Remove icon',
  },
});

export const hasIconValue = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

/**
 * The icon field of the descriptor cards.
 *
 * It reuses Volto's `image` widget (pick / upload / link an image) but adds its
 * own remove button. The widget's built-in clear control is rendered inside an
 * absolutely positioned toolbar on top of the preview and is not reliably
 * clickable once the field is nested in the block's object lists, which left
 * editors unable to unset an icon they had picked.
 */
const IconWidget = (props) => {
  const { id, value, onChange } = props;
  const intl = useIntl();

  return (
    <div className="factsheet-icon-widget">
      <ImageWidget {...props} />
      {hasIconValue(value) && (
        <Button
          type="button"
          basic
          compact
          className="factsheet-icon-widget-remove"
          aria-label={intl.formatMessage(messages.removeIcon)}
          onClick={() => onChange(id, null)}
        >
          <Icon name={clearSVG} size="18px" color="#e40166" />
          {intl.formatMessage(messages.removeIcon)}
        </Button>
      )}
    </div>
  );
};

export default IconWidget;
