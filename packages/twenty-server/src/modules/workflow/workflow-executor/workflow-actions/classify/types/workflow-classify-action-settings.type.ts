import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { type WorkflowClassifyActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/types/workflow-classify-action-input.type';

export type WorkflowClassifyActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowClassifyActionInput;
};
