export type WorkflowExecutorInput = {
  stepIds: string[];
  workflowRunId: string;
  workspaceId: string;
  shouldComputeWorkflowRunStatus?: boolean;
  currentStepCount?: number;
};

export type WorkflowBranchExecutorInput = {
  stepId: string;
  attemptCount?: number;
  workflowRunId: string;
  workspaceId: string;
  currentStepCount?: number;
};
