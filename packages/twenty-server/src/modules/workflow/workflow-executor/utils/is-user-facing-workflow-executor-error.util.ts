import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

const USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES = [
  WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
  WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
  WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
];

const USER_FACING_BILLING_EXCEPTION_CODES = [
  BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
  BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
];

const USER_FACING_USAGE_LIMIT_EXCEPTION_CODES = [
  UsageLimitExceptionCode.QUOTA_EXHAUSTED,
];

export const isUserFacingWorkflowExecutorError = (error: unknown): boolean => {
  if (error instanceof WorkflowStepExecutorException) {
    return USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof BillingException) {
    return USER_FACING_BILLING_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof UsageLimitException) {
    return USER_FACING_USAGE_LIMIT_EXCEPTION_CODES.includes(error.code);
  }

  return false;
};
