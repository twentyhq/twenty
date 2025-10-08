import {
  type WorkflowUpsertRecordActionInput,
  type WorkflowCreateRecordActionInput,
  type WorkflowDeleteRecordActionInput,
  type WorkflowFindRecordsActionInput,
  type WorkflowUpdateRecordActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

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

export type WorkflowUpsertRecordActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowUpsertRecordActionInput;
};
