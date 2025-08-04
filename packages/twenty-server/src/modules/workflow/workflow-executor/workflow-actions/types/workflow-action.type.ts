import { WorkflowAiAgentActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-settings.type';
import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowFilterActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { WorkflowHttpRequestActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';
import { WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_RECORD = 'CREATE_RECORD',
  UPDATE_RECORD = 'UPDATE_RECORD',
  DELETE_RECORD = 'DELETE_RECORD',
  FIND_RECORDS = 'FIND_RECORDS',
  FORM = 'FORM',
  FILTER = 'FILTER',
  HTTP_REQUEST = 'HTTP_REQUEST',
  AI_AGENT = 'AI_AGENT',
}

type BaseWorkflowAction = {
  id: string;
  name: string;
  type: WorkflowActionType;
  settings: WorkflowActionSettings;
  position?: {
    x: number;
    y: number;
  };
  valid: boolean;
  nextStepIds?: string[];
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

export type WorkflowFormAction = BaseWorkflowAction & {
  type: WorkflowActionType.FORM;
  settings: WorkflowFormActionSettings;
};

export type WorkflowFilterAction = BaseWorkflowAction & {
  type: WorkflowActionType.FILTER;
  settings: WorkflowFilterActionSettings;
};

export type WorkflowHttpRequestAction = BaseWorkflowAction & {
  type: WorkflowActionType.HTTP_REQUEST;
  settings: WorkflowHttpRequestActionSettings;
};

export type WorkflowAiAgentAction = BaseWorkflowAction & {
  type: WorkflowActionType.AI_AGENT;
  settings: WorkflowAiAgentActionSettings;
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowFindRecordsAction
  | WorkflowFormAction
  | WorkflowFilterAction
  | WorkflowHttpRequestAction
  | WorkflowAiAgentAction;
