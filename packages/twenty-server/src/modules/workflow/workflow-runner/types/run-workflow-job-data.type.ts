export type RunWorkflowJobData = {
  workspaceId: string;
  workflowRunId: string;
  lastExecutedStepId?: string;
  stepIdsToRetry?: string[];
  stepToResume?: { stepId: string; threadId: string };
};
