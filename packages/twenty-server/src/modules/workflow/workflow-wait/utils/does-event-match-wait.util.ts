import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type WorkflowStepWait } from 'twenty-shared/workflow';

export const doesEventMatchWait = ({
  wait,
  event,
}: {
  wait: WorkflowStepWait;
  event: ObjectRecordEvent;
}): boolean => {
  if (wait.type !== 'EVENT') {
    return false;
  }

  if (isNonEmptyString(wait.recordId) && wait.recordId !== event.recordId) {
    return false;
  }

  if (!isNonEmptyArray(wait.updatedFields)) {
    return true;
  }

  // like database event triggers, a field filter only matches events that report which fields changed
  const eventUpdatedFields =
    'updatedFields' in event.properties
      ? (event.properties.updatedFields ?? [])
      : [];

  return wait.updatedFields.some((field) => eventUpdatedFields.includes(field));
};
