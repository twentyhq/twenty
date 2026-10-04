import { isDefined } from 'twenty-shared/utils';

import { type WorkflowWaitForEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-input.type';

const MS_PER_MINUTE = 60 * 1000;

// Variables resolve timeout parts to strings, and an empty part means none of that unit
export const computeWaitTimeoutInMs = (
  timeout: WorkflowWaitForEventActionInput['timeout'],
): number | null => {
  if (!isDefined(timeout)) {
    return null;
  }

  const days = Number(timeout.days || 0);
  const hours = Number(timeout.hours || 0);
  const minutes = Number(timeout.minutes || 0);

  if ([days, hours, minutes].some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }

  const timeoutInMs = ((days * 24 + hours) * 60 + minutes) * MS_PER_MINUTE;

  return timeoutInMs > 0 ? timeoutInMs : null;
};
