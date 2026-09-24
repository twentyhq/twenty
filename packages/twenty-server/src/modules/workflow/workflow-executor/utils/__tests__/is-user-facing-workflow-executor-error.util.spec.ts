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
import { isUserFacingWorkflowExecutorError } from 'src/modules/workflow/workflow-executor/utils/is-user-facing-workflow-executor-error.util';

describe('isUserFacingWorkflowExecutorError', () => {
  it('returns true for an inactive subscription', () => {
    const error = new BillingException(
      'No active subscription',
      BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(true);
  });

  it('returns true for an exhausted usage quota', () => {
    const error = new UsageLimitException(
      'Quota exhausted',
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(true);
  });

  it('returns false for a platform-state billing error the user cannot resolve', () => {
    const error = new BillingException(
      'Subscription not found',
      BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(false);
  });

  it.each([
    WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
    WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
  ])('returns true for user-facing workflow step executor code %s', (code) => {
    const error = new WorkflowStepExecutorException('User error', code);

    expect(isUserFacingWorkflowExecutorError(error)).toBe(true);
  });

  it('returns false for internal workflow step executor errors', () => {
    const error = new WorkflowStepExecutorException(
      'Internal error',
      WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(false);
  });

  // No retry conjures a model, and reporting these as system errors buries the
  // real ones, so a misconfigured classification step is the author's to fix.
  it.each([
    // What an instance with no provider configured at all raises, through
    // getDefaultModelForTier under the auto-select fallback.
    AiExceptionCode.API_KEY_NOT_CONFIGURED,
    AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
    AiExceptionCode.INVALID_EVALUATION_REQUEST,
  ])('returns true for user-facing AI code %s', (code) => {
    const error = new AiException('Misconfigured step', code);

    expect(isUserFacingWorkflowExecutorError(error)).toBe(true);
  });

  it('returns false for an AI failure the user cannot resolve', () => {
    const error = new AiException(
      'Agent execution failed',
      AiExceptionCode.AGENT_EXECUTION_FAILED,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(false);
  });

  it('returns false for a plain error', () => {
    expect(isUserFacingWorkflowExecutorError(new Error('boom'))).toBe(false);
  });
});
