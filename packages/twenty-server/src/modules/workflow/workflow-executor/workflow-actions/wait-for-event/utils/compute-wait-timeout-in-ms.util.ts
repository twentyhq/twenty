import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowWaitForEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-input.type';

const MS_PER_MINUTE = 60 * 1000;

const MAX_TIMEOUT_IN_MS = 365 * 24 * 60 * MS_PER_MINUTE;

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

  // a timeout that cannot be read must not turn into a wait without a deadline
  if (
    [days, hours, minutes].some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new WorkflowStepExecutorException(
      'Wait timeout must be made of non-negative numbers',
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  const timeoutInMs = ((days * 24 + hours) * 60 + minutes) * MS_PER_MINUTE;

  if (timeoutInMs > MAX_TIMEOUT_IN_MS) {
    throw new WorkflowStepExecutorException(
      'Wait timeout cannot exceed one year',
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  return timeoutInMs > 0 ? timeoutInMs : null;
};
