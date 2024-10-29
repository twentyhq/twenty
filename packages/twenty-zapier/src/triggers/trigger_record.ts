import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';
import {
  listSample,
  EventOperation,
  perform,
  performUnsubscribe,
  subscribe,
} from '../utils/triggers/triggers.utils';

export const triggerRecordKey = 'trigger_record';

const performSubscribe = (z: ZObject, bundle: Bundle) =>
  subscribe(z, bundle, bundle.inputData.operation);
const performList = (z: ZObject, bundle: Bundle) =>
  listSample(z, bundle, bundle.inputData.operation === EventOperation.DELETED);

export default {
  key: triggerRecordKey,
  noun: 'Record',
  display: {
    label: 'Record Trigger',
    description:
      'Triggers when a Record is created, updated, deleted or destroyed.',
  },
  operation: {
    inputFields: [
      {
        key: 'nameSingular',
        required: true,
        label: 'Record Name',
        dynamic: `${findObjectNamesSingularKey}.nameSingular.labelSingular`,
        altersDynamicFields: true,
      },
      {
        key: 'operation',
        required: true,
        label: 'Operation',
        choices: {
          [EventOperation.CREATED]: EventOperation.CREATED,
          [EventOperation.UPDATED]: EventOperation.UPDATED,
          [EventOperation.DELETED]: EventOperation.DELETED,
          [EventOperation.DESTROYED]: EventOperation.DESTROYED,
        },
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
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'createdAt', label: 'Created At' },
    ],
  },
};
