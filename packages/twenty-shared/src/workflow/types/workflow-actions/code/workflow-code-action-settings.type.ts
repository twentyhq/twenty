import { WorkflowCodeActionInput } from 'src/workflow/types/workflow-actions/code/workflow-code-action-input.type';
import { BaseWorkflowActionSettings } from 'src/workflow/types/workflow-actions/workflow-action-settings.type';

export type WorkflowCodeActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowCodeActionInput;
};
