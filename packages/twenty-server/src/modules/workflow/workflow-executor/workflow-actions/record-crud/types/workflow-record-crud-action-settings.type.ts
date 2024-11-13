import { WorkflowRecordCRUDActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowRecordCRUDActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowRecordCRUDActionInput;
};
