import { type WorkflowRunWorkflowActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/run-workflow/types/workflow-run-workflow-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowRunWorkflowActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowRunWorkflowActionInput;
};
