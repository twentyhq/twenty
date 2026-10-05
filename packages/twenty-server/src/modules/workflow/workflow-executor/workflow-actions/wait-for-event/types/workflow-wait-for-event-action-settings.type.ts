import { type WorkflowWaitForEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowWaitForEventActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowWaitForEventActionInput;
};
