import { StepStatus } from 'twenty-shared/workflow';

import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { stepIsAwaitingRetry } from 'src/modules/workflow/workflow-executor/utils/step-is-awaiting-retry.util';

describe('stepIsAwaitingRetry', () => {
  it('should return true when a retrying step is pending with an error', () => {
    const result = stepIsAwaitingRetry({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: { status: StepStatus.PENDING, error: 'some error' },
    });

    expect(result).toBe(true);
  });

  it('should return false when the step is pending without an error', () => {
    const result = stepIsAwaitingRetry({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: { status: StepStatus.PENDING },
    });

    expect(result).toBe(false);
  });

  it('should return false when the step does not retry on failure', () => {
    const result = stepIsAwaitingRetry({
      step: createMockCodeStep('step-1'),
      stepInfo: { status: StepStatus.PENDING, error: 'some error' },
    });

    expect(result).toBe(false);
  });
});
