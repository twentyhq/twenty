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
  // Set only when the step resumes after its question was answered: the
  // conversation it continues.
  resumedThreadId?: string;
};
