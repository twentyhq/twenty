export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  pendingEvent?: boolean;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
  fallbackReason?: 'unresolved-filter-value';
};
