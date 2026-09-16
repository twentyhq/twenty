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
import { isUserFacingWorkflowExecutorError } from 'src/modules/workflow/workflow-executor/utils/is-user-facing-workflow-executor-error.util';

describe('isUserFacingWorkflowExecutorError', () => {
  it('returns true for exhausted billing credits', () => {
    const error = new BillingException(
      'Credits exhausted',
      BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
    );

    expect(isUserFacingWorkflowExecutorError(error)).toBe(true);
  });

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

  it('returns false for a plain error', () => {
    expect(isUserFacingWorkflowExecutorError(new Error('boom'))).toBe(false);
  });
});
