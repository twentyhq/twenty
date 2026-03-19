import { type WorkflowFailureReason } from 'src/modules/workflow/workflow-executor/types/workflow-failure-reason.type';

export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  failureReason?: WorkflowFailureReason;
  pendingEvent?: boolean;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
};
