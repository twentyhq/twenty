import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import { WorkflowStep } from 'src/modules/workflow/common/types/workflow-step.type';

export interface WorkflowStepExecutor {
  execute({
    step,
    payload,
  }: {
    step: WorkflowStep;
    payload?: object;
  }): Promise<WorkflowResult>;
}
