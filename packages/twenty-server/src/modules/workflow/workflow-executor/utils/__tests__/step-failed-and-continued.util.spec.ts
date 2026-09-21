import { StepStatus } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIfElseStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { stepFailedAndContinued } from 'src/modules/workflow/workflow-executor/utils/step-failed-and-continued.util';

describe('stepFailedAndContinued', () => {
  it('should return true when the step failed on its own and continues on failure', () => {
    const step = createMockCodeStep('step-1', [], {
      continueOnFailure: true,
    });

    const result = stepFailedAndContinued({
      step,
      stepInfos: {
        'step-1': { status: StepStatus.FAILED_SAFELY, error: 'some error' },
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when the step does not continue on failure', () => {
    const step = createMockCodeStep('step-1');

    const result = stepFailedAndContinued({
      step,
      stepInfos: {
        'step-1': { status: StepStatus.FAILED_SAFELY, error: 'some error' },
      },
    });

    expect(result).toBe(false);
  });

  it('should return false when the step was failed safely by cascade', () => {
    const step = createMockCodeStep('step-1', [], {
      continueOnFailure: true,
    });

    const result = stepFailedAndContinued({
      step,
      stepInfos: {
        'step-1': { status: StepStatus.FAILED_SAFELY },
      },
    });

    expect(result).toBe(false);
  });

  it('should return false for an if/else step even when it continues on failure', () => {
    const step = createMockIfElseStep(
      'step-1',
      [{ id: 'branch-1', nextStepIds: ['step-2'] }],
      [],
      { continueOnFailure: true },
    );

    const result = stepFailedAndContinued({
      step,
      stepInfos: {
        'step-1': { status: StepStatus.FAILED_SAFELY, error: 'some error' },
      },
    });

    expect(result).toBe(false);
  });
});
