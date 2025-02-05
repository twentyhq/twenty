import { WorkflowCodeActionInput } from '@/workflow/workflow-actions/code/workflow-code-action-input';
import { BaseWorkflowActionSettings } from '@/workflow/workflow-actions/workflow-action-settings';

export type WorkflowCodeActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowCodeActionInput;
};
