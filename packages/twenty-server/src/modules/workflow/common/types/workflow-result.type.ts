type WorkflowError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type WorkflowResult = {
  data?: object;
  error?: WorkflowError;
};
