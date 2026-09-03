export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  isUserError?: boolean;
  pendingEvent?: boolean;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
};
