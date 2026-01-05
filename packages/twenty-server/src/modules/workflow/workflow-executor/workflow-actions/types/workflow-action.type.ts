import { type WorkflowAiAgentActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-settings.type';
import { type WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { type WorkflowDelayActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/types/workflow-delay-action-settings.type';
import { type WorkflowFilterActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { type WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { type WorkflowHttpRequestActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-settings.type';
import { type WorkflowIfElseActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-action-settings.type';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  type WorkflowCreateRecordActionSettings,
  type WorkflowDeleteRecordActionSettings,
  type WorkflowFindRecordsActionSettings,
  type WorkflowUpdateRecordActionSettings,
  type WorkflowUpsertRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

// Import the enum from its dedicated file to avoid circular dependencies
import { WorkflowActionType } from './workflow-action-type.enum';

// Re-export for consumers
export { WorkflowActionType };

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

export type WorkflowUpsertRecordAction = BaseWorkflowAction & {
  type: WorkflowActionType.UPSERT_RECORD;
  settings: WorkflowUpsertRecordActionSettings;
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

export type WorkflowIfElseAction = BaseWorkflowAction & {
  type: WorkflowActionType.IF_ELSE;
  settings: WorkflowIfElseActionSettings;
};

export type WorkflowHttpRequestAction = BaseWorkflowAction & {
  type: WorkflowActionType.HTTP_REQUEST;
  settings: WorkflowHttpRequestActionSettings;
};

export type WorkflowAiAgentAction = BaseWorkflowAction & {
  type: WorkflowActionType.AI_AGENT;
  settings: WorkflowAiAgentActionSettings;
};

export type WorkflowIteratorAction = BaseWorkflowAction & {
  type: WorkflowActionType.ITERATOR;
  settings: WorkflowIteratorActionSettings;
};

export type WorkflowEmptyAction = BaseWorkflowAction & {
  type: WorkflowActionType.EMPTY;
};

export type WorkflowDelayAction = BaseWorkflowAction & {
  type: WorkflowActionType.DELAY;
  settings: WorkflowDelayActionSettings;
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowUpsertRecordAction
  | WorkflowFindRecordsAction
  | WorkflowFormAction
  | WorkflowFilterAction
  | WorkflowIfElseAction
  | WorkflowHttpRequestAction
  | WorkflowAiAgentAction
  | WorkflowIteratorAction
  | WorkflowEmptyAction
  | WorkflowDelayAction;
