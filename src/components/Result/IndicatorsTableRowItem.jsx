import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Table } from 'semantic-ui-react';
// import { ResultHeader } from '@eeacms/search/components/Result/ResultModal';

const normalizeStr = (str) => {
  if (typeof str === 'number') {
    str = str.toLocaleString();
  }

  let tmp = document.createElement('DIV');
  tmp.innerHTML = str;
  str = tmp.textContent || tmp.innerText || '';
  return str;
};

const WrappedRowItem = (props) => {
  const { appConfig } = useAppConfig();
  const { indicatorsTableViewParams } = appConfig;
  const { result } = props;

  return (
    <Table.Row>
      {indicatorsTableViewParams.columns.map((col, index) => (
        <Table.Cell key={index}>
          {col.title === 'Name of indicator' ? (
            <a href={result['data_provenances'].raw.link}>{result['title']}</a>
          ) : col.title === 'Last updated' ? (
            result[col.field]?.raw.substring(0, 4)
          ) : (
            normalizeStr(
              Array.isArray(result[col.field]?.raw)
                ? result[col.field]?.raw.sort().join(', ')
                : result[col.field]?.raw || '',
            )
          )}
        </Table.Cell>
      ))}
    </Table.Row>
  );
};

const IndicatorsTableRowItem = (props) => <WrappedRowItem {...props} />;

export default IndicatorsTableRowItem;
