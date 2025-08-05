import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('computeWorkflowVersionStepChanges', () => {
  it('should compute next step ids', () => {
    const input = {
      trigger: { nextStepIds: ['1', '2'] } as WorkflowTrigger,
      steps: [
        { id: '1', nextStepIds: ['3'] },
        { id: '2', nextStepIds: ['3'] },
      ] as WorkflowAction[],
      deletedStepId: '5',
    };

    const expectedResult = {
      triggerNextStepIds: ['1', '2'],
      stepsNextStepIds: { '1': ['3'], '2': ['3'] },
      deletedStepId: '5',
    };

    expect(computeWorkflowVersionStepChanges(input)).toEqual(expectedResult);
  });
});
