import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

describe('computeWorkflowVersionStepChanges', () => {
  it('should compute next step ids', () => {
    const input = {
      trigger: { nextStepIds: ['1', '2'] } as WorkflowTrigger,
      steps: [
        { id: '1', nextStepIds: ['3'] },
        { id: '2', nextStepIds: ['3'] },
      ] as WorkflowAction[],
      deletedStepIds: ['5'],
    };

    const expectedResult = {
      triggerNextStepIds: ['1', '2'],
      stepsNextStepIds: { '1': ['3'], '2': ['3'] },
      deletedStepIds: ['5'],
    };

    expect(computeWorkflowVersionStepChanges(input)).toEqual(expectedResult);
  });
});
