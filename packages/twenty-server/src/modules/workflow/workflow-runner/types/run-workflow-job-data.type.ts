import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowRunId: string;
  lastExecutedStepId?: string;
  stepIdsToRetry?: string[];
  // what a step that waited on a callback was handed, such as the outcome of an agent run
  awaitedStepOutput?: {
    stepId: string;
    actionOutput: Pick<WorkflowActionOutput, 'result' | 'error'>;
  };
};
