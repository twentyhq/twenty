import { type WorkflowStepWait } from 'twenty-shared/workflow';

export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  isUserError?: boolean;
  // The step pauses as PENDING until what it waits on resolves it
  wait?: WorkflowStepWait;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
  isUsageRefused?: boolean;
};
