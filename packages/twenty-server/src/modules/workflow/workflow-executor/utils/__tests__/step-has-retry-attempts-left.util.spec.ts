import { StepStatus, STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';

import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { stepHasRetryAttemptsLeft } from 'src/modules/workflow/workflow-executor/utils/step-has-retry-attempts-left.util';

describe('stepHasRetryAttemptsLeft', () => {
  it('should return false when the step does not retry on failure', () => {
    const result = stepHasRetryAttemptsLeft({
      step: createMockCodeStep('step-1'),
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBe(false);
  });

  it('should return true while attempts remain', () => {
    const result = stepHasRetryAttemptsLeft({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
        ],
      },
    });

    expect(result).toBe(true);
  });

  it('should return false once the configured count is reached', () => {
    const result = stepHasRetryAttemptsLeft({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 1 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
        ],
      },
    });

    expect(result).toBe(false);
  });

  it('should restart the budget on the iteration archived after a retried one', () => {
    const result = stepHasRetryAttemptsLeft({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 1 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
          { status: StepStatus.FAILED_SAFELY, error: 'previous iteration' },
        ],
      },
    });

    expect(result).toBe(true);
  });

  it('should clamp the configured count to the delay schedule length', () => {
    const result = stepHasRetryAttemptsLeft({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 10 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: STEP_RETRY_DELAYS_MS.map((_, index) => ({
          status: StepStatus.FAILED,
          error: 'some error',
          retryAttempt: index + 1,
        })),
      },
    });

    expect(result).toBe(false);
  });
});
