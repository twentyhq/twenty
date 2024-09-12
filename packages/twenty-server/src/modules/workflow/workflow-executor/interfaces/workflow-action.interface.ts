import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

export interface WorkflowAction {
  execute({
    step,
    payload,
  }: {
    step: WorkflowStep;
    payload?: object;
  }): Promise<WorkflowActionResult>;
}
