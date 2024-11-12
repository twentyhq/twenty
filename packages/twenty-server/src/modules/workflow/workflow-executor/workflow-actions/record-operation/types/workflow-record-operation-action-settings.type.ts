import { WorkflowRecordOperationActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-operation/types/workflow-record-operation-action-input.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowRecordOperationActionSettings =
  BaseWorkflowActionSettings & {
    input: WorkflowRecordOperationActionInput;
  };
