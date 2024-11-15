import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';
import {
  performSubscribe,
  performUnsubscribe,
  perform,
  performList,
  DatabaseEventAction,
} from '../utils/triggers/triggers.utils';

export const triggerRecordKey = 'trigger_record';

const choices = Object.values(DatabaseEventAction).reduce(
  (acc, action) => {
    acc[action] = action;
    return acc;
  },
  {} as Record<DatabaseEventAction, DatabaseEventAction>,
);

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
        choices,
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
