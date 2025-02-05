import { WorkflowCodeActionSettings } from '../workflow-actions/code/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from '../workflow-actions/mail-sender/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from '../workflow-actions/record-crud/workflow-record-crud-action-settings.type';
import { WorkflowActionSettings } from '../workflow-actions/workflow-action-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_RECORD = 'CREATE_RECORD',
  UPDATE_RECORD = 'UPDATE_RECORD',
  DELETE_RECORD = 'DELETE_RECORD',
  FIND_RECORDS = 'FIND_RECORDS',
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

export type WorkflowCreateRecordAction = BaseWorkflowAction & {
  type: WorkflowActionType.CREATE_RECORD;
  settings: WorkflowCreateRecordActionSettings;
};

export type WorkflowUpdateRecordAction = BaseWorkflowAction & {
  type: WorkflowActionType.UPDATE_RECORD;
  settings: WorkflowUpdateRecordActionSettings;
};

export type WorkflowDeleteRecordAction = BaseWorkflowAction & {
  type: WorkflowActionType.DELETE_RECORD;
  settings: WorkflowDeleteRecordActionSettings;
};

export type WorkflowFindRecordsAction = BaseWorkflowAction & {
  type: WorkflowActionType.FIND_RECORDS;
  settings: WorkflowFindRecordsActionSettings;
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowFindRecordsAction;
