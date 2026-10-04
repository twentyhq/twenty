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

  const eventUpdatedFields =
    'updatedFields' in event.properties
      ? event.properties.updatedFields
      : undefined;

  if (isNonEmptyArray(wait.updatedFields) && isNonEmptyArray(eventUpdatedFields)) {
    return wait.updatedFields.some((field) =>
      eventUpdatedFields.includes(field),
    );
  }

  return true;
};
