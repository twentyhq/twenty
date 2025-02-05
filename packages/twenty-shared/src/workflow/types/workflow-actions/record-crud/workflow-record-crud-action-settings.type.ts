import {
  WorkflowCreateRecordActionInput,
  WorkflowDeleteRecordActionInput,
  WorkflowFindRecordsActionInput,
  WorkflowUpdateRecordActionInput,
} from '../record-crud/workflow-record-crud-action-input.type';
import { BaseWorkflowActionSettings } from '../workflow-action-settings.type';

export type WorkflowCreateRecordActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowCreateRecordActionInput;
};

export type WorkflowUpdateRecordActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowUpdateRecordActionInput;
};

export type WorkflowDeleteRecordActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowDeleteRecordActionInput;
};

export type WorkflowFindRecordsActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowFindRecordsActionInput;
};
