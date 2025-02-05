import { WorkflowSendEmailActionInput } from 'src/workflow/types/workflow-actions/mail-sender/workflow-send-email-action-input.type';
import { BaseWorkflowActionSettings } from 'src/workflow/types/workflow-actions/workflow-action-settings.type';

export type WorkflowSendEmailActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowSendEmailActionInput;
};
