import {
  WorkflowCreateRecordActionInput,
  WorkflowDeleteRecordActionInput,
  WorkflowFindRecordsActionInput,
  WorkflowUpdateRecordActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

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
