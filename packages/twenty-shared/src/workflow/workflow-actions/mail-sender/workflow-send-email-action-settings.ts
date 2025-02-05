import { WorkflowSendEmailActionInput } from '@/workflow/workflow-actions/mail-sender/workflow-send-email-action-input';
import { BaseWorkflowActionSettings } from '@/workflow/workflow-actions/workflow-action-settings';

export type WorkflowSendEmailActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowSendEmailActionInput;
};
