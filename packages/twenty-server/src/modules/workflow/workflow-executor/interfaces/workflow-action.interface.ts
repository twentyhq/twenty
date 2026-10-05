import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowWaitResolution } from 'src/modules/workflow/workflow-wait/types/workflow-wait-resolution.type';
import { type WorkflowWaitResolutionInput } from 'src/modules/workflow/workflow-wait/types/workflow-wait-resolution-input.type';

export interface WorkflowAction {
  execute(
    workflowActionInput: WorkflowActionInput,
  ): Promise<WorkflowActionOutput>;

  // Without it, a resolved time or event wait completes the step with the outcome as its result
  resolveWait?(
    workflowWaitResolutionInput: WorkflowWaitResolutionInput,
  ): Promise<WorkflowWaitResolution>;
}
