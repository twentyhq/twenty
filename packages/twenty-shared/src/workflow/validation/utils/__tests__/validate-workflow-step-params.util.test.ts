import { type ValidatableWorkflow } from '@/workflow/validation/types/workflow-validation.type';
import { validateWorkflowStepParams } from '../validate-workflow-step-params.util';

describe('validateWorkflowStepParams', () => {
  it('should return no issues when there is no trigger and no steps', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: undefined,
    };

    expect(validateWorkflowStepParams(workflow)).toEqual([]);
  });

  it('should flag an invalid trigger configuration', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'NOT_A_REAL_TRIGGER' },
      steps: [],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some((issue) => issue.code === 'INVALID_TRIGGER_PARAMS'),
    ).toBe(true);
  });

  it('should flag an invalid step configuration with its step id', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: [{ id: 'step-1', type: 'NOT_A_REAL_ACTION' }],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some(
        (issue) =>
          issue.code === 'INVALID_STEP_PARAMS' && issue.stepId === 'step-1',
      ),
    ).toBe(true);
  });
});
