import { WorkflowSystemStep } from 'src/modules/workflow/common/types/workflow-step.type';
import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';

export interface WorkflowSystemAction {
  execute({
    step,
    payload,
  }: {
    step: WorkflowSystemStep;
    payload?: object;
  }): Promise<WorkflowStepResult>;
}
