import { STEP_RETRY_DELAYS_MS, StepStatus } from 'twenty-shared/workflow';

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
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should return the next delay for each recorded failed attempt', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
          { status: StepStatus.FAILED, error: 'second', retryAttempt: 2 },
        ],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[2]);
  });

  it('should restart the budget on the iteration archived after a retried one', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
          { status: StepStatus.FAILED, error: 'second', retryAttempt: 2 },
          { status: StepStatus.FAILED_SAFELY, error: 'previous iteration' },
        ],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should return undefined once every attempt has been used', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: STEP_RETRY_DELAYS_MS.map((_, index) => ({
          status: StepStatus.FAILED,
          error: 'some error',
          retryAttempt: index + 1,
        })),
      },
    });

    expect(result).toBeUndefined();
  });

  it('should ignore history entries that are not retry attempts', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 3 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [{ status: StepStatus.SUCCESS, result: {} }],
      },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should stop retrying once the configured count is reached', () => {
    const result = getStepRetryDelayMs({
      step: createMockCodeStep('step-1', [], { retryOnFailure: 1 }),
      stepInfo: {
        status: StepStatus.RUNNING,
        history: [
          { status: StepStatus.FAILED, error: 'first', retryAttempt: 1 },
        ],
      },
    });

    expect(result).toBeUndefined();
  });

  it('should clamp the configured count to the delay schedule length', () => {
    const result = getStepRetryDelayMs({
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

    expect(result).toBeUndefined();
  });
  it('should not retry when the value is missing', () => {
    const step = createMockCodeStep('step-1');

    Reflect.deleteProperty(
      step.settings.errorHandlingOptions.retryOnFailure,
      'value',
    );

    const result = getStepRetryDelayMs({
      step,
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBeUndefined();
  });
});
