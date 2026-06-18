import { type WorkflowLogicFunctionActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/types/workflow-logic-function-action-input.type';
import {
  type BaseWorkflowActionSettings,
  type WithExpectedOutputSchema,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowLogicFunctionActionSettings = BaseWorkflowActionSettings &
  WithExpectedOutputSchema & {
    input: WorkflowLogicFunctionActionInput;
  };
