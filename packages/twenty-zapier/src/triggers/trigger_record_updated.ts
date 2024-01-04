import { findObjectNamesPluralKey } from '../triggers/find_object_names_plural';
import {
  listSample,
  Operation,
  perform,
  performUnsubscribe,
  subscribe,
} from '../utils/triggers.utils';
import { Bundle, ZObject } from 'zapier-platform-core';

export const triggerRecordUpdatedKey = 'trigger_record_updated';

const performSubscribe = (z: ZObject, bundle: Bundle) =>
  subscribe(z, bundle, Operation.update);
const performList = (z: ZObject, bundle: Bundle) => listSample(z, bundle);

export default {
  key: triggerRecordUpdatedKey,
  noun: 'Record',
  display: {
    label: 'Record Trigger Updated',
    description: 'Triggers when a Record is updated.',
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
      createdAt: '2023-10-19T07:37:25.306Z',
      workspaceId: 'c8b070fc-c969-4ca5-837a-e7c3735734d2',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'workspaceId', label: 'Workspace ID' },
    ],
  },
};
