export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  pendingEvent?: boolean;
  shouldEndWorkflowRun?: boolean;
};
