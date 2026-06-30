import { StepStatus } from 'twenty-shared/workflow';

import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('workflowShouldFail', () => {
  it('should return true if a failed step exists', () => {
    const steps = [
      {
        id: 'step-1',
      } as WorkflowAction,
    ];

    const stepInfos = { 'step-1': { status: StepStatus.FAILED } };

    expect(workflowShouldFail({ steps, stepInfos })).toBeTruthy();
  });

  it('should return false if no failed step exists', () => {
    const steps = [
      {
        id: 'step-1',
      } as WorkflowAction,
    ];

    const stepInfos = { 'step-1': { status: StepStatus.SUCCESS } };

    expect(workflowShouldFail({ steps, stepInfos })).toBeFalsy();
  });
});
