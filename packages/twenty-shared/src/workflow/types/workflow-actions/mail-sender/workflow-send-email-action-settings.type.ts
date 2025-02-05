import { WorkflowSendEmailActionInput } from '../mail-sender/workflow-send-email-action-input.type';
import { BaseWorkflowActionSettings } from '../workflow-action-settings.type';

export type WorkflowSendEmailActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowSendEmailActionInput;
};
