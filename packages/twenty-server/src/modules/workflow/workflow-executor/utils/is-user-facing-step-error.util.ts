import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { CustomException } from 'src/utils/custom-exception';

const USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES = [
  WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
  WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
  WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
];

// A user-facing step error is caused by the user's configuration or account state
// (invalid step, exhausted billing credits, ...) rather than a system fault. It
// must not be retried or reported to Sentry: it is surfaced to the user as the
// step error. WorkflowStepExecutorException carries no statusCode, so its
// user-facing codes are listed explicitly; other exceptions rely on the shared
// statusCode < 500 convention.
export const isUserFacingStepError = (error: unknown): boolean => {
  if (
    error instanceof WorkflowStepExecutorException &&
    USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES.includes(error.code)
  ) {
    return true;
  }

  return (
    error instanceof CustomException &&
    isDefined(error.statusCode) &&
    error.statusCode < 500
  );
};
