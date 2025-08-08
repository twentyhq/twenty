export type WorkflowExecutorInput = {
  stepIds: string[];
  workflowRunId: string;
  workspaceId: string;
  shouldComputeWorkflowRunStatus?: boolean;
};

export type WorkflowBranchExecutorInput = {
  stepId: string;
  attemptCount?: number;
  workflowRunId: string;
  workspaceId: string;
};
