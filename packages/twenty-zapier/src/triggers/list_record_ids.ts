import { Bundle, ZObject } from 'zapier-platform-core';

import { ObjectData } from '../utils/data.types';
import { listSample } from '../utils/triggers/triggers.utils';

const listRecordIdsRequest = async (
  z: ZObject,
  bundle: Bundle,
): Promise<ObjectData[]> => {
  return listSample(z, bundle, true);
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
