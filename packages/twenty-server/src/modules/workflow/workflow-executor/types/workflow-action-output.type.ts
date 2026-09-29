import { type WorkflowPendingAsk } from 'src/modules/workflow/workflow-executor/types/workflow-pending-ask.type';

export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  isUserError?: boolean;
  pendingEvent?: boolean;
  pendingAsk?: WorkflowPendingAsk;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
  isUsageRefused?: boolean;
};
