import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type WorkflowRunInfo = {
  workflowRunId: string;
  workspaceId: string;
};

export type WorkflowActionInput = {
  currentStepId: string;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
  runInfo: WorkflowRunInfo;
};
