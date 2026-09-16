import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { isUserFacingStepError } from 'src/modules/workflow/workflow-executor/utils/is-user-facing-step-error.util';

describe('isUserFacingStepError', () => {
  it('returns true for exhausted billing credits (402)', () => {
    const error = new BillingException(
      'Credits exhausted',
      BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
    );

    expect(isUserFacingStepError(error)).toBe(true);
  });

  it('returns false for a server-side billing exception (500)', () => {
    const error = new BillingException(
      'Unexpected billing error',
      BillingExceptionCode.BILLING_UNHANDLED_ERROR,
    );

    expect(isUserFacingStepError(error)).toBe(false);
  });

  it('returns true for user-facing workflow step executor codes', () => {
    const error = new WorkflowStepExecutorException(
      'Invalid step input',
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );

    expect(isUserFacingStepError(error)).toBe(true);
  });

  it('returns false for internal workflow step executor errors', () => {
    const error = new WorkflowStepExecutorException(
      'Internal error',
      WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    );

    expect(isUserFacingStepError(error)).toBe(false);
  });

  it('returns false for a plain error', () => {
    expect(isUserFacingStepError(new Error('boom'))).toBe(false);
  });
});
