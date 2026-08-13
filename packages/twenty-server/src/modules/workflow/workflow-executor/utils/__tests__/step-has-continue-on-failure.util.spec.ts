import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { stepHasContinueOnFailure } from 'src/modules/workflow/workflow-executor/utils/step-has-continue-on-failure.util';

describe('stepHasContinueOnFailure', () => {
  it('should return false when continueOnFailure is false (the default)', () => {
    const step = createMockCodeStep('step1');

    expect(stepHasContinueOnFailure(step)).toBe(false);
  });

  it('should return true when the step opts into continueOnFailure', () => {
    const step = createMockCodeStep('step1');
    step.settings.errorHandlingOptions.continueOnFailure.value = true;

    expect(stepHasContinueOnFailure(step)).toBe(true);
  });

  it('should return false when errorHandlingOptions is missing (older/malformed step data)', () => {
    const step = createMockCodeStep('step1');
    // @ts-expect-error - simulating pre-existing step data saved before this
    // field was always populated
    delete step.settings.errorHandlingOptions;

    expect(stepHasContinueOnFailure(step)).toBe(false);
  });
});
