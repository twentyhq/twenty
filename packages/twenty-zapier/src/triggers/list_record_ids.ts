import { performList } from '../utils/triggers/triggers.utils';

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
    perform: performList,
  },
};
