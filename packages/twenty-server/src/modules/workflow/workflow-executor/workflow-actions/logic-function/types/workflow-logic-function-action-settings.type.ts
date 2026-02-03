import { type WorkflowLogicFunctionActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/types/workflow-logic-function-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowLogicFunctionActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowLogicFunctionActionInput;
};
