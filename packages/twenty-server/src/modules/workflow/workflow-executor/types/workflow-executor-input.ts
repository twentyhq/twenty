export type WorkflowExecutorInput = {
  workflowRunId: string;
  stepIdsToExecute: string[];
};

export type WorkflowBranchExecutorInput = {
  currentStepId: string;
  attemptCount?: number;
  workflowRunId: string;
};
