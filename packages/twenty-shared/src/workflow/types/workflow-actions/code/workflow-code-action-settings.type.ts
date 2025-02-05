import { WorkflowCodeActionInput } from '../code/workflow-code-action-input.type';
import { BaseWorkflowActionSettings } from '../workflow-action-settings.type';

export type WorkflowCodeActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowCodeActionInput;
};
