import React from 'react';
import { Portal } from 'react-portal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { BodyClass, isCmsUi } from '@plone/volto/helpers';
import { Icon } from '@plone/volto/components';
import printerSVG from '@plone/volto/icons/printer.svg';

import './css/printpage.less';

const messages = defineMessages({
  printPageTitle: {
    id: 'Print page',
    defaultMessage: 'Print page',
  },
});

const PrintPage = (props) => {
  const { pathname } = props;
  const intl = useIntl();
  const cmsView = isCmsUi(pathname);

  const printPage = () => {
    document.getElementById('main').classList.add('print');
    setTimeout(() => {
      window.print();
    }, 1000);
    window.onafterprint = () =>
      document.getElementById('main').classList.remove('print');
  };

  return (
    <>
      {!cmsView && (
        <Portal node={__CLIENT__ && document.querySelector('.content-area')}>
          <BodyClass className="has-print-button" />
          <div className="ui container">
            <div className="print-button">
              <Button
                basic
                icon
                title={intl.formatMessage(messages.printPageTitle)}
                onClick={printPage}
              >
                <Icon name={printerSVG} size="30px" />
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default compose(
  connect((state, props) => ({
    pathname: state.router.location.pathname,
  })),
)(PrintPage);
