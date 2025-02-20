import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-step.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowAction = (
  step: WorkflowStep | WorkflowAction,
): step is WorkflowAction => {
  return 'settings' in step;
};
