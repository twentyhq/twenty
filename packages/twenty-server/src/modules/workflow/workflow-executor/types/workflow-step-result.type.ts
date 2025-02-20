type WorkflowStepError = {
  errorMessage: string;
  errorType?: string;
  stackTrace?: string;
};

export type WorkflowStepResult = {
  result?: object;
  error?: WorkflowStepError;
};
