import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowMcpToolAction = (
  action: WorkflowAction,
): action is WorkflowAction & { type: WorkflowActionType.MCP_TOOL } =>
  action.type === WorkflowActionType.MCP_TOOL;
