export type WorkflowExecutorInput = {
  stepIds: string[];
  workflowRunId: string;
  workspaceId: string;
  shouldComputeWorkflowRunStatus?: boolean;
  executedStepsCount?: number;
  // The conversation the resumed step continues; set only when stepIds is that one step, already claimed out of PENDING
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
