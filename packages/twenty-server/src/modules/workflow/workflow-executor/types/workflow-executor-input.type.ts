import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

export type WorkflowExecutorInput = {
  stepIds: string[];
  workflowRunId: string;
  workspaceId: string;
  shouldComputeWorkflowRunStatus?: boolean;
  executedStepsCount?: number;
  // What a step that waited on a callback was handed; set only when stepIds is that one step, already claimed out of PENDING
  awaitedActionOutput?: WorkflowActionOutput;
};

export type WorkflowBranchExecutorInput = {
  stepId: string;
  attemptCount?: number;
  workflowRunId: string;
  workspaceId: string;
  executedStepsCount?: number;
  awaitedActionOutput?: WorkflowActionOutput;
};
