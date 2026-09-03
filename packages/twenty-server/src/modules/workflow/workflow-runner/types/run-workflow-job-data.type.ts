export type RunWorkflowJobData = {
  workspaceId: string;
  workflowRunId: string;
  lastExecutedStepId?: string;
  stepIdsToRetry?: string[];
  automaticRetryStepId?: string;
};
