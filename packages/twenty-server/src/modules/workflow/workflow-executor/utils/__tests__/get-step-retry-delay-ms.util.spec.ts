import { StepStatus, STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';

import { getStepRetryDelayMs } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-delay-ms.util';

describe('getStepRetryDelayMs', () => {
  it('should return the first delay before any failed attempt', () => {
    const result = getStepRetryDelayMs({
      stepInfo: { status: StepStatus.RUNNING },
    });

    expect(result).toBe(STEP_RETRY_DELAYS_MS[0]);
  });

  it('should return the next delay for each recorded failed attempt', () => {
    const result = getStepRetryDelayMs({
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
});
