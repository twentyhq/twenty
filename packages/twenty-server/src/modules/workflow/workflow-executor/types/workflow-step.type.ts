import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export enum WorkflowStepType {
  ACTION = 'ACTION',
  FORM = 'FORM',
  ROUTER = 'ROUTER',
  LOOP = 'LOOP',
}

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

/**
 * To migrate to WorkflowActionStepSettings once the V2 workflow is released.
 */

export type WorkflowCodeAction = {
  type: WorkflowActionType.CODE;
  actionSettings: WorkflowCodeActionSettings;
};

export type WorkflowSendEmailAction = {
  type: WorkflowActionType.SEND_EMAIL;
  actionSettings: WorkflowSendEmailActionSettings;
};

export type WorkflowCreateRecordAction = {
  type: WorkflowActionType.CREATE_RECORD;
  actionSettings: WorkflowCreateRecordActionSettings;
};

export type WorkflowUpdateRecordAction = {
  type: WorkflowActionType.UPDATE_RECORD;
  actionSettings: WorkflowUpdateRecordActionSettings;
};

export type WorkflowDeleteRecordAction = {
  type: WorkflowActionType.DELETE_RECORD;
  actionSettings: WorkflowDeleteRecordActionSettings;
};

export type WorkflowFindRecordsAction = {
  type: WorkflowActionType.FIND_RECORDS;
  actionSettings: WorkflowFindRecordsActionSettings;
};

export type BaseWorkflowStepSettings = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowActionStepSettings =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowFindRecordsAction;

export type WorkflowActionStep = BaseWorkflowStep & {
  type: WorkflowStepType.ACTION;
  stepSettings: BaseWorkflowStepSettings & WorkflowActionStepSettings;
};

export type WorkflowStep = WorkflowActionStep;
