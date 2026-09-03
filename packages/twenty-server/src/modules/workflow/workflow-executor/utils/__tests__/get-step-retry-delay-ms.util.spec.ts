import { StepStatus } from 'twenty-shared/workflow';

import { STEP_RETRY_DELAYS_MS } from 'src/modules/workflow/workflow-executor/constants/step-retry-delays.constant';
import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { getStepRetryDelayMs } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-delay-ms.util';

describe('getStepRetryDelayMs', () => {
  it('should return undefined when the step does not retry on failure', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1'),
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBeUndefined();
  });

  it('should return the first delay on the first failure', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: true }),
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should return the next delay for each recorded failed attempt', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: true }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first' },
          { status: StepStatus.FAILED, error: 'second' },
        ],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[2]);
  });

  it('should restart the budget after an iteration that did not end on a failed attempt', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: true }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first' },
          { status: StepStatus.FAILED, error: 'second' },
          { status: StepStatus.FAILED_SAFELY, error: 'previous iteration' },
        ],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should return undefined once every attempt has been used', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: true }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: STEP_RETRY_DELAYS_MS.map(() => ({
          status: StepStatus.FAILED,
          error: 'some error',
        })),
      },
    });

    expect(result).toBeUndefined();
  });

  it('should ignore history entries that are not failed attempts', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: true }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [{ status: StepStatus.SUCCESS, result: {} }],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });
});
