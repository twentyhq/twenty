import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowAiAgentAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowAiAgentAction = (
  action: WorkflowAction,
): action is WorkflowAiAgentAction => {
  return action.type === WorkflowActionType.AI_AGENT;
};
