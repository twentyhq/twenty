import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
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

// A step asking for a model the instance does not serve, or asking it something
// it cannot answer, is a configuration the author has to change: no retry will
// produce a model, and reporting it as a system error buries real ones.
const USER_FACING_AI_EXCEPTION_CODES = [
  AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
  AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
  AiExceptionCode.INVALID_EVALUATION_REQUEST,
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

  if (error instanceof AiException) {
    return USER_FACING_AI_EXCEPTION_CODES.includes(error.code);
  }

  return false;
};
