import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

export interface WorkflowAction {
  execute({
    step,
    context,
  }: {
    step: WorkflowStep;
    context?: Record<string, any>;
  }): Promise<WorkflowActionResult>;
}
