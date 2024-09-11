type WorkflowError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type WorkflowStepResult = {
  result?: object;
  error?: WorkflowError;
};
