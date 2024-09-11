import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';
import { WorkflowStep } from 'src/modules/workflow/common/types/workflow-step.type';

export interface WorkflowStepExecutor {
  execute({
    step,
    payload,
  }: {
    step: WorkflowStep;
    payload?: object;
  }): Promise<WorkflowStepResult>;
}
