import { Bundle, ZObject } from 'zapier-platform-core';

import { capitalize } from '../utils/capitalize';
import requestDb from '../utils/requestDb';

const listRecordIdsRequest = async (
  z: ZObject,
  bundle: Bundle,
): Promise<{ id: string }[]> => {
  const data = bundle.inputData;
  const namePlural = data.namePlural;
  const query = `
  query List${capitalize(namePlural)}Ids {
    ${namePlural}{edges{node{id}}}
  }`;
  const result = await requestDb(z, bundle, query);
  return result.data[namePlural]['edges'].map((edge: any) => {
    return {
      id: edge.node.id,
    };
  });
};

export const listRecordIdsKey = 'list_record_ids';

export default {
  display: {
    description: 'List Record Ids of an object.',
    label: 'List Record Ids.',
    hidden: true,
  },
  key: listRecordIdsKey,
  noun: 'Object',
  operation: {
    perform: listRecordIdsRequest,
  },
};
