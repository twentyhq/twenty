import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import { WorkflowRecordOperationActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/record-operation/types/workflow-record-operation-action-settings.type';
import { WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
  SEND_EMAIL = 'SEND_EMAIL',
  RECORD_OPERATION = 'RECORD_OPERATION',
}

type BaseWorkflowAction = {
  id: string;
  name: string;
  type: WorkflowActionType;
  settings: WorkflowActionSettings;
  valid: boolean;
};

export type WorkflowCodeAction = BaseWorkflowAction & {
  type: WorkflowActionType.CODE;
  settings: WorkflowCodeActionSettings;
};

export type WorkflowSendEmailAction = BaseWorkflowAction & {
  type: WorkflowActionType.SEND_EMAIL;
  settings: WorkflowSendEmailActionSettings;
};

export type WorkflowRecordOperationAction = BaseWorkflowAction & {
  type: WorkflowActionType.RECORD_OPERATION;
  settings: WorkflowRecordOperationActionSettings;
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowRecordOperationAction;
