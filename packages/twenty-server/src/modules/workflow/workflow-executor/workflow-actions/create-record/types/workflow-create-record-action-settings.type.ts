import { WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record/types/workflow-create-record-action-input.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowCreateRecordActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowCreateRecordActionInput;
};
