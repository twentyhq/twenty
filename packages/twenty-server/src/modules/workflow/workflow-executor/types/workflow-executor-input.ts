export type WorkflowExecutorInput = {
  stepIdsToExecute: string[];
  workflowRunId: string;
  workspaceId: string;
};

export type WorkflowBranchExecutorInput = {
  currentStepId: string;
  attemptCount?: number;
  workflowRunId: string;
  workspaceId: string;
};
