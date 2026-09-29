export type WorkflowExecutorInput = {
  stepIds: string[];
  workflowRunId: string;
  workspaceId: string;
  shouldComputeWorkflowRunStatus?: boolean;
  executedStepsCount?: number;
  // Set only when stepIds is the one step resuming after its question was
  // answered, already claimed out of PENDING: the conversation it continues.
  resumedThreadId?: string;
};

export type WorkflowBranchExecutorInput = {
  stepId: string;
  attemptCount?: number;
  workflowRunId: string;
  workspaceId: string;
  executedStepsCount?: number;
  resumedThreadId?: string;
};
