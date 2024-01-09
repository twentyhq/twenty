import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesPluralKey } from '../triggers/find_object_names_plural';
import {
  listSample,
  Operation,
  perform,
  performUnsubscribe,
  subscribe,
} from '../utils/triggers/triggers.utils';

export const triggerRecordDeletedKey = 'trigger_record_deleted';

const performSubscribe = (z: ZObject, bundle: Bundle) =>
  subscribe(z, bundle, Operation.delete);
const performList = (z: ZObject, bundle: Bundle) => listSample(z, bundle, true);

export default {
  key: triggerRecordDeletedKey,
  noun: 'Record',
  display: {
    label: 'Record Trigger Deleted',
    description: 'Triggers when a Record is deleted.',
  },
  operation: {
    inputFields: [
      {
        key: 'namePlural',
        required: true,
        label: 'Record Name',
        dynamic: `${findObjectNamesPluralKey}.namePlural`,
        altersDynamicFields: true,
      },
    ],
    type: 'hook',
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: 'f75f6b2e-9442-4c72-aa95-47d8e5ec8cb3',
    },
    outputFields: [{ key: 'id', label: 'ID' }],
  },
};
